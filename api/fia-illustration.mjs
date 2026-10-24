import {createHash} from 'node:crypto';
import {authorizeAgent,redisStore} from './agent-resources.mjs';
import {STATES,MONEY_TYPES,GENDERS,GOALS} from '../fia-options.mjs';

const TO='info@opulenceinvestments.net';
const sha=value=>createHash('sha256').update(value).digest('hex');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateSubmission(body){
  if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Please complete the form.');
  const text=(key,max,optional=false)=>{
    const value=body[key];
    if(optional&&(value==null||value===''))return '';
    if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u001f\u007f]/.test(value))throw new Error('Please check '+key+'.');
    return value.trim();
  };
  const d={
    agentName:text('agentName',120),agentEmail:text('agentEmail',160),
    clientName:text('clientName',120),age:text('age',3),state:text('state',2),
    gender:text('gender',30),currentAccount:text('currentAccount',160),
    moneyType:text('moneyType',40),amount:text('amount',20),
    company:text('company',120,true),goal:text('goal',20),
    incomeAge:body.goal==='Income'?text('incomeAge',3):'',
    requestId:text('requestId',36)
  };
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.agentEmail))throw new Error('Enter a valid agent email.');
  if(!/^\d{1,3}$/.test(d.age)||+d.age<0||+d.age>120)throw new Error('Age must be a whole number from 0 to 120.');
  if(!STATES.some(s=>s[0]===d.state)||!GENDERS.includes(d.gender)||!MONEY_TYPES.includes(d.moneyType)||!GOALS.includes(d.goal))throw new Error('Choose a valid state, gender, account tax status, and goal.');
  if(!/^\d+(\.\d{1,2})?$/.test(d.amount)||+d.amount<=0||+d.amount>1000000000)throw new Error('Enter a dollar amount greater than zero and no more than $1 billion.');
  if(d.goal==='Income'&&(!/^\d{1,3}$/.test(d.incomeAge)||+d.incomeAge<+d.age||+d.incomeAge>120))throw new Error('Income start age must be at least the current age and no greater than 120.');
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(d.requestId))throw new Error('Please refresh the form and try again.');
  return d;
}
export function buildMessages(d,from){
  const reference='FIA-'+d.requestId.slice(0,8).toUpperCase();
  const rows=[
    ['Agent',d.agentName],['Agent email',d.agentEmail],['Client',d.clientName],['Age',d.age],
    ['State',STATES.find(s=>s[0]===d.state)?.[1]||d.state],['Gender',d.gender],
    ['Current account / plan',d.currentAccount],['Account tax status',d.moneyType],
    ['Dollar amount',new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(+d.amount)],
    ['Company of choice',d.company||'No preference'],
    ['Goal',d.goal==='Income'?'Income starting at age '+d.incomeAge:'Accumulation']
  ];
  const table=rows.map(([k,v])=>`<tr><th style="padding:10px;text-align:left;border-bottom:1px solid #c9d6e2;">${esc(k)}</th><td style="padding:10px;border-bottom:1px solid #c9d6e2;">${esc(v)}</td></tr>`).join('');
  const html=(title,intro,detail)=>`<!doctype html><html><body style="margin:0;background:#f5f8fb;font:14px/1.6 Arial,sans-serif;color:#0f1e2e;padding:24px;"><div style="max-width:640px;margin:auto;background:white;border:1px solid #c9d6e2;border-radius:4px;overflow:hidden;"><header style="background:#0f1e2e;color:white;padding:24px;"><div>OPULENCE VENTURE GROUP</div><h1 style="font-size:24px;margin:8px 0;">${title}</h1></header><div style="padding:24px;"><p>${intro}</p><p>Reference: <strong>${reference}</strong></p>${detail}<p style="color:#4b5d6f;font-size:12px;">An illustration request is not an application, recommendation, or guarantee of product availability or returns.</p></div></div></body></html>`;
  const internal={from,to:[TO],reply_to:d.agentEmail,subject:`FIA Illustration Request - ${reference}`,
    html:html('New FIA Illustration Request','An agent has submitted a request for review.',`<table style="width:100%;border-collapse:collapse;font-size:13px;">${table}</table>`),
    text:`New FIA Illustration Request\nReference: ${reference}\n${rows.map(([k,v])=>k+': '+v).join('\n')}`};
  // Keep sensitive client/account details out of the agent acknowledgement.
  const confirmation={from,to:[d.agentEmail],reply_to:TO,subject:`FIA Illustration Request received - ${reference}`,
    html:html('Your request was received',`Thank you, ${esc(d.agentName)}. Your FIA illustration request has been submitted to our team. We will review it and follow up with next steps.`,`<p>For questions, reply to this email or contact ${TO} and include your reference number.</p>`),
    text:`Thank you, ${d.agentName}. Your FIA illustration request has been received.\nReference: ${reference}\nOur team will review it and follow up. For questions, contact ${TO}.`};
  return {internal,confirmation,reference};
}
async function deliver(env,message,idempotencyKey){
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},
    body:JSON.stringify(message),signal:AbortSignal.timeout(12000)
  });
  if(!response.ok)throw new Error('Mail provider did not accept the request');
  const data=await response.json();
  if(!data.id)throw new Error('Mail acceptance could not be confirmed');
}
export function createFiaHandler({env=process.env,store=null,preview=false,now=Date.now,send=null}={}){
  return async(req,res)=>{
    res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
    if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'});}
    if(!preview&&req.headers.origin){
      try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Invalid origin.'});}
      catch{return res.status(403).json({error:'Invalid origin.'});}
    }
    try{
      const db=store||redisStore(env);
      if(!await authorizeAgent(req,{env,store:db,now}))return res.status(401).json({error:'Your session has ended. Sign in again before submitting.'});
      if(req.method==='GET')return res.status(200).json({preview,available:preview||Boolean(env.RESEND_API_KEY)});
      if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return res.status(415).json({error:'JSON required.'});
      const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
      if(Buffer.byteLength(raw)>8192)return res.status(413).json({error:'Request too large.'});
      let d;
      try{d=validateSubmission(JSON.parse(raw));}
      catch(error){return res.status(400).json({error:error instanceof SyntaxError?'Invalid form data.':error.message});}
      const identity=sha(String(req.headers.authorization));
      if(!await db.allowSubmission(identity)){res.setHeader('Retry-After','900');return res.status(429).json({error:'Too many requests. Please wait 15 minutes.'});}
      const {internal,confirmation,reference}=buildMessages(d,env.MAIL_FROM||'Opulence Venture Group <onboarding@resend.dev>');
      if(preview)return res.status(200).json({ok:true,preview:true,reference,confirmationEmail:false});
      if(!env.RESEND_API_KEY)return res.status(503).json({error:'Email delivery is not configured. Your request has not been submitted.'});
      const key='fia-'+d.requestId+'-'+sha(JSON.stringify(d));
      const sendMail=send||((m,k)=>deliver(env,m,k));
      try{await sendMail(internal,key+'-team');}
      catch{return res.status(502).json({error:'We could not confirm submission. Your entries are still here; please retry. Repeat attempts for unchanged entries use the same request reference.'});}
      let confirmationEmail=true;
      try{await sendMail(confirmation,key+'-agent');}catch{confirmationEmail=false;}
      return res.status(200).json({ok:true,reference,confirmationEmail});
    }catch{return res.status(503).json({error:'Request service temporarily unavailable. Please try again later.'});}
  };
}
export default createFiaHandler();
