import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {loadCatalog,serveMedia} from '../server/agent-vault.mjs';

const TTL=7200;
const sha=value=>createHash('sha256').update(value).digest('hex');
const MAX_BODY=1024;
const prefix='opulence:agent:v1:';
const LIMIT_LUA=`
local a = redis.call('INCR', KEYS[1])
if a == 1 then redis.call('EXPIRE', KEYS[1], 900) end
local b = redis.call('INCR', KEYS[2])
if b == 1 then redis.call('EXPIRE', KEYS[2], 900) end
if a > 5 or b > 50 then return 0 end
return 1
`;

export function redisStore(env) {
  const url=new URL(env.KV_REST_API_URL);
  if(url.protocol!=='https:'||!env.KV_REST_API_TOKEN) throw new Error('Missing secure rate-limit storage.');
  async function cmd(parts) {
    const response=await fetch(url,{
      method:'POST',headers:{Authorization:`Bearer ${env.KV_REST_API_TOKEN}`,'Content-Type':'application/json'},
      body:JSON.stringify(parts),signal:AbortSignal.timeout(5000)
    });
    if(!response.ok) throw new Error('Storage unavailable.');
    const result=await response.json();
    if(result.error) throw new Error('Storage unavailable.');
    return result.result;
  }
  return {
    async allow(identity){return Number(await cmd(['EVAL',LIMIT_LUA,2,prefix+'attempt:'+identity,prefix+'global-attempts']))===1;},
    async set(key,value,ttl){await cmd(['SET',prefix+'session:'+key,JSON.stringify(value),'EX',ttl]);},
    async get(key){const value=await cmd(['GET',prefix+'session:'+key]);return value?JSON.parse(value):null;},
    async remove(key){await cmd(['DEL',prefix+'session:'+key]);}
  };
}
function readCatalog(raw='[]') {
  const list=JSON.parse(raw);
  if(!Array.isArray(list)||list.length>300) throw new Error('Invalid catalog.');
  return list.map((item,index)=>{
    if(!item||!['material','video'].includes(item.type)) throw new Error('Invalid resource.');
    const url=item.url?new URL(item.url):null;
    if(url&&(url.protocol!=='https:'||url.username||url.password)) throw new Error('Invalid resource link.');
    if(!url&&!item.embed)throw new Error('Missing resource.');
    const text=(value,max)=>{
      if(typeof value!=='string'||value.length>max) throw new Error('Invalid resource text.');
      return value.trim();
    };
    const title=text(item.title,160);
    if(!title) throw new Error('Missing title.');
    let embed;
    if(item.embed) {
      const formats=item.type==='material'?['pdf']:['video','guide'];
      if(!formats.includes(item.embed.format)||!/^[a-z0-9-]{1,60}$/.test(item.embed.id))throw new Error('Invalid embedded resource.');
      embed={id:item.embed.id,format:item.embed.format};
    }
    return {id:String(index+1),type:item.type,title,description:text(item.description||'',1500),category:text(item.category||'General',80),...(url?{url:url.href}:{}),...(embed?{embed}:{})};
  });
}

// A four-digit code is only a basic shared gate, never individual agent approval.
// All production requests fail closed unless the passcode, session secret, and
// durable Redis-backed rate/session store are configured.
export function createHandler({env=process.env,store=null,preview=false,now=Date.now,mediaLoader=null,catalogLoader=null}={}) {
  return async function handler(req,res) {
    res.setHeader('Cache-Control','no-store, private');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    if(!['GET','POST','DELETE'].includes(req.method)){
      res.setHeader('Allow','GET, POST, DELETE');return res.status(405).json({error:'Method not allowed.'});
    }
    if(!preview && req.headers.origin){
      try {if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Invalid origin.'});}
      catch {return res.status(403).json({error:'Invalid origin.'});}
    }
    if(!/^\d{4}$/.test(env.AGENT_ACCESS_CODE||'') || (env.AGENT_SESSION_SECRET||'').length<32){
      return res.status(503).json({error:'Agent access has not been activated.'});
    }
    try {
      const db=store || redisStore(env);
      const digest=value=>createHmac('sha256',env.AGENT_SESSION_SECRET).update(value).digest();
      const version=digest('version:'+env.AGENT_ACCESS_CODE).toString('hex');
      if(req.method==='POST'){
        const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
        // The global counter also bounds distributed guessing. Atomic persistent
        // counters cannot be bypassed by a function cold start or new instance.
        if(!await db.allow(sha(ip))){res.setHeader('Retry-After','900');return res.status(429).json({error:'Too many attempts.'});}
        if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return res.status(415).json({error:'JSON required.'});
        const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});
        if(Buffer.byteLength(raw)>MAX_BODY)return res.status(413).json({error:'Request too large.'});
        let body;try{body=JSON.parse(raw);}catch{return res.status(400).json({error:'Invalid request.'});}
        if(typeof body?.code!=='string'||!/^\d{4}$/.test(body.code)||!timingSafeEqual(digest(body.code),digest(env.AGENT_ACCESS_CODE))){
          return res.status(401).json({error:'Incorrect passcode.'});
        }
        const token=randomBytes(32).toString('base64url');
        const expiresAt=now()+TTL*1000;
        await db.set(sha(token),{version,expiresAt},TTL);
        return res.status(200).json({token,expiresAt});
      }
      const authorization=String(req.headers.authorization||'');
      const match=/^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization);
      if(!match)return res.status(401).json({error:'Access required.'});
      const key=sha(match[1]);
      const session=await db.get(key);
      if(!session || session.expiresAt<=now() || session.version!==version)return res.status(401).json({error:'Session expired.'});
      if(req.method==='DELETE'){await db.remove(key);return res.status(200).json({ok:true});}
      const resources=readCatalog(catalogLoader?await catalogLoader():env.AGENT_RESOURCE_CATALOG||'[]');
      const mediaId=new URL(req.url||'/', 'https://agent.invalid').searchParams.get('media');
      if(mediaId!==null) {
        const item=resources.find(item=>item.embed?.id===mediaId);
        if(!item)return res.status(404).json({error:'Resource not found.'});
        if(!mediaLoader)return res.status(503).json({error:'Media storage is not configured.'});
        return await mediaLoader(item.embed,req,res);
      }
      return res.status(200).json({resources});
    } catch {
      // No passcodes, tokens, catalog contents, or provider response bodies in logs.
      return res.status(503).json({error:'Agent access is temporarily unavailable.'});
    }
  };
}
export default createHandler({catalogLoader:loadCatalog,mediaLoader:serveMedia});
