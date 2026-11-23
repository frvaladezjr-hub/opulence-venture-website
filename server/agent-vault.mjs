import {createDecipheriv} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

function mediaKey(){
  const value=process.env.AGENT_MEDIA_KEY||'';
  if(!/^[a-f0-9]{64}$/i.test(value))throw new Error('Private media not configured.');
  return Buffer.from(value,'hex');
}
export function decryptVault(bytes,key,label){
  if(bytes.length<28)throw new Error('Invalid encrypted media.');
  const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));
  decipher.setAAD(Buffer.from('opulence-vault-v1:'+label));
  decipher.setAuthTag(bytes.subarray(12,28));
  return Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]);
}
async function manifest(){
  const bytes=await readFile(path.join(process.cwd(),'agent-vault','catalog.bin'));
  const data=JSON.parse(decryptVault(bytes,mediaKey(),'catalog').toString('utf8'));
  if(data.version!==1||!Array.isArray(data.resources)||!data.files)throw new Error('Invalid vault.');
  return data;
}
export async function loadCatalog(){return JSON.stringify((await manifest()).resources);}
export async function serveMedia(embed,req,res){
  const file=(await manifest()).files[embed.id];
  if(!file)return res.status(404).json({error:'Resource not found.'});
  const part=new URL(req.url,'https://agent.invalid').searchParams.get('part');
  if(part===null)return res.status(200).json({transfer:'chunks-v1',mime:file.mime,size:file.size,parts:file.parts.length});
  if(!/^(0|[1-9][0-9]*)$/.test(part)||Number(part)>=file.parts.length)return res.status(400).json({error:'Invalid media part.'});
  const filename=file.parts[Number(part)];
  if(!/^[a-f0-9]{32}\.bin$/.test(filename))throw new Error('Invalid vault path.');
  const bytes=await readFile(path.join(process.cwd(),'agent-vault',filename));
  const clear=decryptVault(bytes,mediaKey(),embed.id+':'+Number(part));
  if(clear.length>2*1024*1024)throw new Error('Media part too large.');
  res.setHeader('Content-Type','application/octet-stream');
  res.setHeader('Content-Length',clear.length);
  res.end(clear);
}
// Thumbnails use their own key so they can be refreshed without the media key.
function thumbKey(){
  const value=process.env.AGENT_THUMB_KEY||'';
  if(!/^[a-f0-9]{64}$/i.test(value))return null;
  return Buffer.from(value,'hex');
}
export async function serveThumb(id,res){
  const key=thumbKey();
  if(!key)return res.status(404).json({error:'Thumbnail not found.'});
  let data;
  try{data=JSON.parse(decryptVault(await readFile(path.join(process.cwd(),'agent-vault','thumbs.bin')),key,'thumbs').toString('utf8'));}
  catch{return res.status(404).json({error:'Thumbnail not found.'});}
  const entry=data?.thumbs?.[id];
  if(!entry||!/^[a-f0-9]{32}\.bin$/.test(entry.file)||!/^image\/(webp|jpeg|png)$/.test(entry.mime))return res.status(404).json({error:'Thumbnail not found.'});
  const clear=decryptVault(await readFile(path.join(process.cwd(),'agent-vault',entry.file)),key,'thumb:'+id);
  if(clear.length>512*1024)throw new Error('Thumbnail too large.');
  res.setHeader('Content-Type',entry.mime);
  res.setHeader('Content-Length',clear.length);
  res.end(clear);
}
