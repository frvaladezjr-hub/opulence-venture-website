import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,createCipheriv} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {decryptVault,loadCatalog,serveMedia} from '../server/agent-vault.mjs';
const encrypt=(data,key,label)=>{
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from('opulence-vault-v1:'+label));
  const payload=Buffer.concat([cipher.update(data),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),payload]);
};
test('AES-GCM rejects wrong key, modified bytes, and swapped media context',()=>{
  const key=randomBytes(32),data=Buffer.from('fixture not actual user media'),encrypted=encrypt(data,key,'fixture:0');
  assert.deepEqual(decryptVault(encrypted,key,'fixture:0'),data);
  assert.throws(()=>decryptVault(encrypted,randomBytes(32),'fixture:0'));
  assert.throws(()=>decryptVault(encrypted,key,'fixture:1'));
  const tampered=Buffer.from(encrypted);tampered[30]^=1;
  assert.throws(()=>decryptVault(tampered,key,'fixture:0'));
});
test('vault metadata, chunks, bounds and missing configuration are checked',async()=>{
  const cwd=process.cwd(),previous=process.env.AGENT_MEDIA_KEY;
  const dir=await mkdtemp(path.join(tmpdir(),'agent-vault-test-'));
  const key=randomBytes(32),filename='a'.repeat(32)+'.bin',bytes=Buffer.from('PDF fixture');
  const data={version:1,resources:[{title:'Fixture'}],files:{fixture:{mime:'application/pdf',size:bytes.length,parts:[filename]}}};
  const response=()=>({code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(d){this.data=d;return this;},end(d){this.body=d;}});
  try{
    await mkdir(path.join(dir,'agent-vault'));
    await writeFile(path.join(dir,'agent-vault','catalog.bin'),encrypt(Buffer.from(JSON.stringify(data)),key,'catalog'));
    await writeFile(path.join(dir,'agent-vault',filename),encrypt(bytes,key,'fixture:0'));
    process.chdir(dir);process.env.AGENT_MEDIA_KEY=key.toString('hex');
    assert.equal(JSON.parse(await loadCatalog())[0].title,'Fixture');
    let res=response();await serveMedia({id:'fixture'},{url:'/?media=fixture'},res);
    assert.equal(res.data.transfer,'chunks-v1');assert.equal(res.data.parts,1);
    res=response();await serveMedia({id:'fixture'},{url:'/?media=fixture&part=0'},res);assert.deepEqual(res.body,bytes);
    for(const part of ['-1','1','../catalog','1.5','00']){
      res=response();await serveMedia({id:'fixture'},{url:'/?media=fixture&part='+part},res);assert.equal(res.code,400);
    }
    delete process.env.AGENT_MEDIA_KEY;await assert.rejects(loadCatalog());
  }finally{
    process.chdir(cwd);if(previous===undefined)delete process.env.AGENT_MEDIA_KEY;else process.env.AGENT_MEDIA_KEY=previous;
    await rm(dir,{recursive:true,force:true});
  }
});
