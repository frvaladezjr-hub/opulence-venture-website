import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,redisStore} from '../api/agent-resources.mjs';
const fixture={AGENT_ACCESS_CODE:'0427',AGENT_SESSION_SECRET:'test-only-secret-012345678901234567890',AGENT_RESOURCE_CATALOG:JSON.stringify([
  {type:'material',title:'Test deck',category:'Presentations',description:'Test fixture only',url:'https://example.com/test.pdf'},
  {type:'video',title:'Test training',category:'Training',description:'Test fixture only',url:'https://example.com/test-video'}
])};
function store(){
  const sessions=new Map();let attempts=0;
  return {async allow(){return ++attempts<=5;},async set(k,v){sessions.set(k,v);},async get(k){return sessions.get(k);},async remove(k){sessions.delete(k);}};
}
async function call(handler,method='GET',body=null,token='',extra={}){
  const headers={'content-type':'application/json',host:'example.com',origin:'https://example.com','x-forwarded-for':'192.0.2.1',...extra};
  if(token)headers.authorization='Bearer '+token;
  const req={method,body,headers};
  const res={code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(d){this.data=d;return this;}};
  await handler(req,res);return res;
}
test('locked library discloses no metadata, unauthorized token is rejected',async()=>{
  const handler=createHandler({env:fixture,store:store()});
  const response=await call(handler);
  assert.equal(response.code,401);assert.equal(response.data.resources,undefined);
  assert.equal((await call(handler,'GET',null,'not-a-real-token')).code,401);
});
test('correct four-digit code including leading zero unlocks catalog and logout revokes token',async()=>{
  const handler=createHandler({env:fixture,store:store()});
  const login=await call(handler,'POST',{code:'0427'});
  assert.equal(login.code,200);assert.equal(login.data.token.length,43);
  const library=await call(handler,'GET',null,login.data.token);
  assert.equal(library.code,200);assert.equal(library.data.resources.length,2);
  assert.equal(library.headers['Cache-Control'],'no-store, private');
  assert.equal((await call(handler,'DELETE',null,login.data.token)).code,200);
  assert.equal((await call(handler,'GET',null,login.data.token)).code,401);
});
test('wrong codes, malformed requests, and burst guessing are rejected',async()=>{
  const handler=createHandler({env:fixture,store:store()});
  for(const code of ['9999','427','04270',427,null])assert.equal((await call(handler,'POST',{code})).code,401);
  assert.equal((await call(handler,'POST',{code:'0427'})).code,429);
});
test('missing production secrets or durable store fails closed',async()=>{
  for(const env of [{}, {...fixture,AGENT_SESSION_SECRET:''},fixture]){
    assert.equal((await call(createHandler({env}),'POST',{code:'0427'})).code,503);
  }
});
test('expired sessions and rotated credentials revoke access',async()=>{
  let time=1000;const env={...fixture};const handler=createHandler({env,store:store(),now:()=>time});
  const login=await call(handler,'POST',{code:'0427'});
  time=login.data.expiresAt;
  assert.equal((await call(handler,'GET',null,login.data.token)).code,401);
  time=1000;const next=await call(handler,'POST',{code:'0427'});
  env.AGENT_ACCESS_CODE='1842';
  assert.equal((await call(handler,'GET',null,next.data.token)).code,401);
});
test('malicious resource URLs and broken catalog fail closed; no data is sent',async()=>{
  const env={...fixture,AGENT_RESOURCE_CATALOG:JSON.stringify([{type:'video',title:'Unsafe',url:'javascript:alert(1)'}])};
  const handler=createHandler({env,store:store()});
  const login=await call(handler,'POST',{code:'0427'});
  const response=await call(handler,'GET',null,login.data.token);
  assert.equal(response.code,503);assert.equal(response.data.resources,undefined);
});
test('production origin, HTTP methods, malformed JSON, and request size are checked',async()=>{
  const handler=createHandler({env:fixture,store:store()});
  assert.equal((await call(handler,'PUT')).code,405);
  assert.equal((await call(handler,'POST',{code:'0427'},'',{origin:'https://attacker.example'})).code,403);
  assert.equal((await call(handler,'POST','broken')).code,400);
  assert.equal((await call(handler,'POST',{code:'0427'},'',{'content-type':'text/plain'})).code,415);
  assert.equal((await call(handler,'POST','x'.repeat(1025))).code,413);
});
test('Redis limiter uses atomic shared counters, TTLs, opaque session keys and auth',async()=>{
  const original=globalThis.fetch;const calls=[];
  try {
    globalThis.fetch=async(url,options)=>{const cmd=JSON.parse(options.body);calls.push({url:String(url),options,cmd});return {ok:true,json:async()=>({result:cmd[0]==='EVAL'?1:cmd[0]==='GETEX'?JSON.stringify({version:'version',expiresAt:10000}):'OK'})};};
    const db=redisStore({KV_REST_API_URL:'https://example.com',KV_REST_API_TOKEN:'test-token'});
    assert.equal(await db.allow('hashed-ip'),true);
    assert.equal(calls[0].cmd[0],'EVAL');
    assert.match(calls[0].cmd[1],/EXPIRE/);assert.equal(calls[0].cmd[2],2);
    await db.set('opaque-token-hash',{version:'version',expiresAt:10000},7200);
    assert.deepEqual(calls[1].cmd.slice(-2),['EX',7200]);
    assert.deepEqual(await db.get('opaque-token-hash'),{version:'version',expiresAt:10000});
    assert.deepEqual(calls[2].cmd,['GETEX','opulence:agent:v1:session:opaque-token-hash','EX',7200]);
    await db.remove('opaque-token-hash');
    assert.deepEqual(calls[3].cmd,['DEL','opulence:agent:v1:session:opaque-token-hash']);
  }finally{globalThis.fetch=original;}
});
test('embedded media is catalog-allowlisted and requires a current session',async()=>{
  const env={...fixture,AGENT_RESOURCE_CATALOG:JSON.stringify([{type:'video',title:'Test embedded video',url:'https://example.com/video',embed:{id:'test-video',format:'video'}}])};
  let loaded=0;
  const handler=createHandler({env,store:store(),mediaLoader:async(embed,req,res)=>{loaded++;return res.status(200).json({loaded:embed.id});}});
  async function media(token,id='test-video'){
    const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
    await handler({method:'GET',url:'/?media='+id,headers:{authorization:token?'Bearer '+token:''}},res);return res;
  }
  assert.equal((await media('')).code,401);assert.equal(loaded,0);
  const login=await call(handler,'POST',{code:'0427'});
  assert.equal((await media(login.data.token,'unlisted')).code,404);assert.equal(loaded,0);
  assert.equal((await media(login.data.token)).data.loaded,'test-video');assert.equal(loaded,1);
  await call(handler,'DELETE',null,login.data.token);
  assert.equal((await media(login.data.token)).code,401);assert.equal(loaded,1);
  const unconfigured=createHandler({env,store:store()});
  const session=await call(unconfigured,'POST',{code:'0427'});
  const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
  await unconfigured({method:'GET',url:'/?media=test-video',headers:{authorization:'Bearer '+session.data.token}},res);
  assert.equal(res.code,503);
});
test('private PDF material needs no public URL and rejects a video format',async()=>{
  const item={type:'material',title:'Infinite Banking Strategy',embed:{id:'infinite-banking-strategy',format:'pdf'}};
  const env={...fixture,AGENT_RESOURCE_CATALOG:JSON.stringify([item])};
  const handler=createHandler({env,store:store()});
  const login=await call(handler,'POST',{code:'0427'});
  const response=await call(handler,'GET',null,login.data.token);
  assert.equal(response.code,200);
  assert.equal(response.data.resources[0].embed.format,'pdf');
  assert.equal(response.data.resources[0].url,undefined);
  env.AGENT_RESOURCE_CATALOG=JSON.stringify([{...item,embed:{...item.embed,format:'video'}}]);
  assert.equal((await call(handler,'GET',null,login.data.token)).code,503);
});
