import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {createFiaHandler,validateSubmission,buildMessages} from '../api/fia-illustration.mjs';

const token='a'.repeat(43),key=createHash('sha256').update(token).digest('hex');
const env={AGENT_ACCESS_CODE:'1234',AGENT_SESSION_SECRET:'test-only-'.repeat(5),RESEND_API_KEY:'mock-only',MAIL_FROM:'Opulence Test <test@example.com>'};
const version=createHmac('sha256',env.AGENT_SESSION_SECRET).update('version:'+env.AGENT_ACCESS_CODE).digest('hex');
const body={agentName:'Test Agent',agentEmail:'agent@example.com',clientName:'Test Client',age:'55',state:'CA',gender:'Female',currentAccount:'Traditional IRA',moneyType:'Qualified (pre-tax)',amount:'250000',company:'',goal:'Income',incomeAge:'65',requestId:'f07f11c1-2272-48aa-8075-f31da6897628'};
function store(overrides={}){return {get:async k=>k===key?{version,expiresAt:Date.now()+60000}:null,allowSubmission:async()=>true,...overrides};}
async function call(options={},changes={}){
  const req={method:'POST',headers:{host:'example.com',origin:'https://example.com',authorization:'Bearer '+token,'content-type':'application/json'},body,...changes};
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(b){this.body=b;return this;}};
  await createFiaHandler({env,store:store(),send:async()=>{},...options})(req,res);return res;
}
test('validates income, accumulation, optional company, and all money statuses',()=>{
  for(const moneyType of ['Qualified (pre-tax)','Roth','Non-qualified (after-tax)'])assert.equal(validateSubmission({...body,moneyType}).moneyType,moneyType);
  assert.equal(validateSubmission({...body,goal:'Accumulation',incomeAge:'junk'}).incomeAge,'');
  assert.equal(validateSubmission(body).company,'');
});
test('rejects invalid fields and injection into headers',()=>{
  for(const change of [{agentEmail:'bad'},{agentName:'x\r\nBcc: other@example.com'},{clientName:''},{age:'121'},{age:'1.5'},{age:'-1'},{state:'XX'},{gender:'unknown'},{moneyType:'x'},{amount:'0'},{amount:'-12'},{amount:'1e6'},{amount:'1.234'},{amount:'1000000001'},{goal:'Other'},{incomeAge:'54'},{incomeAge:''},{requestId:'bad'}]){
    assert.throws(()=>validateSubmission({...body,...change}),JSON.stringify(change));
  }
});
test('authorization, expiry and passcode rotation are enforced',async()=>{
  assert.equal((await call({}, {headers:{host:'example.com'}})).code,401);
  assert.equal((await call({store:store({get:async()=>({version,expiresAt:1})})})).code,401);
  assert.equal((await call({env:{...env,AGENT_ACCESS_CODE:'4321'}})).code,401);
});
test('rejects foreign origins, wrong methods, content types, and oversized bodies',async()=>{
  assert.equal((await call({}, {headers:{host:'example.com',origin:'https://evil.example'}})).code,403);
  assert.equal((await call({}, {method:'DELETE'})).code,405);
  assert.equal((await call({}, {headers:{host:'example.com',authorization:'Bearer '+token}})).code,415);
  assert.equal((await call({}, {body:'x'.repeat(8193)})).code,413);
  assert.equal((await call({}, {body:'{'})).code,400);
});
test('preview validates but never sends mail',async()=>{
  let sent=0;const result=await call({preview:true,send:async()=>sent++});
  assert.equal(result.code,200);assert.equal(result.body.preview,true);assert.equal(sent,0);
  assert.equal((await call({preview:true},{body:{...body,age:'bad'}})).code,400);
});
test('production sends fixed recipient notification and agent acknowledgement',async()=>{
  const sent=[];const result=await call({send:async(m,k)=>sent.push({m,k})});
  assert.equal(result.code,200);assert.equal(result.body.confirmationEmail,true);
  assert.deepEqual(sent[0].m.to,['info@opulenceinvestments.net']);assert.equal(sent[0].m.reply_to,body.agentEmail);
  assert.deepEqual(sent[1].m.to,[body.agentEmail]);assert.ok(!sent[1].m.html.includes(body.clientName));
  const retried=[];await call({send:async(m,k)=>retried.push(k)});
  assert.deepEqual(retried,sent.map(x=>x.k));assert.notEqual(sent[0].k,sent[1].k);
});
test('delivery failures never pretend submission succeeded',async()=>{
  const first=await call({send:async()=>{throw new Error('provider failed');}});
  assert.equal(first.code,502);assert.equal(first.body.ok,undefined);
  let n=0;const second=await call({send:async()=>{if(++n===2)throw new Error('confirmation failed');}});
  assert.equal(second.code,200);assert.equal(second.body.confirmationEmail,false);
});
test('rate limits and missing email configuration fail closed',async()=>{
  assert.equal((await call({store:store({allowSubmission:async()=>false})})).code,429);
  assert.equal((await call({env:{...env,RESEND_API_KEY:''}})).code,503);
  assert.equal((await call({store:store({get:async()=>{throw new Error('offline');}})})).code,503);
});
test('email HTML escapes user content',()=>{
  const {internal}=buildMessages({...body,clientName:'<img src=x onerror=alert(1)>'},env.MAIL_FROM);
  assert.ok(internal.html.includes('&lt;img'));assert.ok(!internal.html.includes('<img'));
});
test('gender excludes Not specified',()=>{
  for(const gender of ['Female','Male'])assert.equal(validateSubmission({...body,gender}).gender,gender);
  assert.throws(()=>validateSubmission({...body,gender:'Not specified'}));
});
test('follow up date is optional, calendar-valid, and included in request email',async()=>{
  assert.equal(validateSubmission(body).followUpDate,'');
  assert.equal(validateSubmission({...body,followUpDate:''}).followUpDate,'');
  for(const followUpDate of ['2026-11-06','2028-02-29'])assert.equal(validateSubmission({...body,followUpDate}).followUpDate,followUpDate);
  for(const followUpDate of ['2026-02-29','2026-02-30','2026-13-01','2026-00-01','0000-01-01','11/06/2026','bad'])assert.throws(()=>validateSubmission({...body,followUpDate}));
  const sent=[];const result=await call({send:async m=>sent.push(m)},{body:{...body,followUpDate:'2026-11-06'}});
  assert.equal(result.code,200);
  assert.ok(sent[0].html.includes('2026-11-06'));
  assert.ok(sent[0].text.includes('Follow up date: 2026-11-06'));
});
test('authorized configuration reports dry-run accurately',async()=>{
  assert.deepEqual((await call({preview:true},{method:'GET'})).body,{preview:true,available:true});
  assert.deepEqual((await call({},{method:'GET'})).body,{preview:false,available:true});
});
