import {STATES,MONEY_TYPES,GENDERS,GOALS} from './fia-options.mjs';

export function mountFiaForm({endpoint,getToken,onExpired}){
  const panel=document.getElementById('fia-panel'),open=document.getElementById('fia-open');
  if(!panel||!open)return {reset(){}};
  const input=(name,label,type='text',extra='')=>`<div class="fia-field"><label for="fia-${name}">${label}</label><input id="fia-${name}" name="${name}" type="${type}" required ${extra}></div>`;
  const select=(name,label,options)=>`<div class="fia-field"><label for="fia-${name}">${label}</label><select id="fia-${name}" name="${name}" required><option value="">Select…</option>${options.map(o=>Array.isArray(o)?`<option value="${o[0]}">${o[1]}</option>`:`<option>${o}</option>`).join('')}</select></div>`;
  panel.innerHTML=`
    <div class="fia-heading"><div><span class="agent-access-tag">Agent request</span><h3 id="fia-title" tabindex="-1">FIA Illustration Request</h3><p>Request a fixed indexed annuity illustration for your client. All fields are required unless marked optional.</p></div><button type="button" class="fia-close" id="fia-close">Close form</button></div>
    <p class="fia-preview-note" id="fia-preview-note" hidden>Preview mode: you can test this form, but no emails will be sent.</p>
    <form id="fia-request-form">
      <fieldset class="fia-fields"><legend>Agent information</legend><div class="fia-grid">
      ${input('agentName','Agent name','text','maxlength="120" autocomplete="name"')}
      ${input('agentEmail','Agent email','email','maxlength="160" autocomplete="email"')}
      <div class="fia-field fia-follow-up"><label for="fia-followUpDate">Follow up date (optional)</label><input id="fia-followUpDate" name="followUpDate" type="date" min="1000-01-01" max="9999-12-31"></div>
      </div><p class="fia-help">Used for follow-up and your submission confirmation.</p></fieldset>
      <fieldset class="fia-fields"><legend>Client information</legend><div class="fia-grid">
      ${input('clientName','Client name','text','maxlength="120" autocomplete="off"')}
      ${input('age','Client age','number','min="0" max="120" step="1" inputmode="numeric"')}
      ${select('state','State of residence',STATES)}
      ${select('gender','Gender',GENDERS)}
      </div></fieldset>
      <fieldset class="fia-fields"><legend>Account and illustration details</legend><div class="fia-grid">
      ${input('currentAccount','Current account / plan','text','maxlength="160" placeholder="e.g., Traditional IRA, 401(k), savings" autocomplete="off"')}
      ${select('moneyType','Account tax status',MONEY_TYPES)}
      ${input('amount','Dollar amount (USD)','number','min="0.01" max="1000000000" step="0.01" inputmode="decimal" placeholder="250000"')}
      <div class="fia-field"><label for="fia-company">Company of choice (optional)</label><input id="fia-company" name="company" type="text" maxlength="120" placeholder="Leave blank for no preference" autocomplete="off"></div>
      ${select('goal','Goal',GOALS)}
      <div class="fia-field" id="fia-income-field" hidden><label for="fia-incomeAge">Income start age</label><input id="fia-incomeAge" name="incomeAge" type="number" min="0" max="120" step="1" inputmode="numeric" disabled></div>
      </div></fieldset>
      <p class="fia-help">Do not include Social Security numbers, account numbers, or other sensitive identifiers. This request is for illustration purposes only and is not an application or a guarantee of product availability or returns.</p>
      <p class="fia-help">Submit only client information you are authorized to share. In the live site, this form emails the details to info@opulenceinvestments.net.</p>
      <p id="fia-error" role="alert" hidden></p>
      <div class="fia-actions"><button type="submit" class="btn btn-primary" id="fia-submit">Submit illustration request</button><span class="fia-help" id="fia-delivery-note">Delivery: info@opulenceinvestments.net</span></div>
    </form>
    <div id="fia-success" class="fia-success" role="status" tabindex="-1" hidden><h4 id="fia-success-title"></h4><p id="fia-success-message"></p><p id="fia-reference" class="fia-help"></p><button type="button" class="btn btn-outline" id="fia-another">Start another request</button></div>`;
  const byId=id=>document.getElementById('fia-'+id);
  const form=byId('request-form'),error=byId('error'),submit=byId('submit'),income=byId('incomeAge'),success=byId('success');
  let requestId=crypto.randomUUID(),controller=null,revision=0;
  const syncGoal=()=>{
    const active=byId('goal').value==='Income';
    byId('income-field').hidden=!active;income.disabled=!active;income.required=active;
    income.min=byId('age').value||'0';
    if(!active)income.value='';
  };
  byId('goal').addEventListener('change',syncGoal);
  byId('age').addEventListener('input',syncGoal);
  function reset(){
    revision++;if(controller)controller.abort();controller=null;
    form.reset();syncGoal();requestId=crypto.randomUUID();
    form.querySelectorAll('fieldset').forEach(field=>{field.disabled=false;});
    submit.disabled=false;submit.textContent='Submit illustration request';
    error.hidden=true;error.textContent='';success.hidden=true;form.hidden=false;
    byId('success-message').textContent='';byId('reference').textContent='';
    panel.hidden=true;open.setAttribute('aria-expanded','false');
  }
  function close(){panel.hidden=true;open.setAttribute('aria-expanded','false');open.focus();}
  byId('close').addEventListener('click',close);
  open.addEventListener('click',async()=>{
    if(!getToken())return;
    if(!panel.hidden){close();return;}
    panel.hidden=false;open.setAttribute('aria-expanded','true');byId('title').focus();
    const current=revision;
    try{
      const response=await fetch(endpoint,{headers:{Authorization:'Bearer '+getToken()},cache:'no-store'});
      const data=await response.json();
      if(current!==revision)return;
      if(response.status===401){onExpired();return;}
      byId('preview-note').hidden=!data.preview;
      byId('delivery-note').textContent=data.preview?'Preview only. No email will be sent.':'Delivery: info@opulenceinvestments.net';
      if(data.preview)submit.textContent='Test illustration request';
    }catch{/* A submission still receives a clear service error if unavailable. */}
  });
  byId('another').addEventListener('click',()=>{
    reset();panel.hidden=false;open.setAttribute('aria-expanded','true');
    if(!byId('preview-note').hidden)submit.textContent='Test illustration request';
    byId('agentName').focus();
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(submit.disabled||!form.reportValidity())return;
    error.hidden=true;const current=revision;
    const body={...Object.fromEntries(new FormData(form)),requestId};
    controller=new AbortController();const timeout=setTimeout(()=>controller?.abort(),45000);
    submit.disabled=true;submit.textContent='Submitting…';
    form.querySelectorAll('fieldset').forEach(field=>{field.disabled=true;});
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+getToken()},body:JSON.stringify(body),cache:'no-store',signal:controller.signal});
      let data;try{data=await response.json();}catch{throw new Error('We could not confirm submission. Please try again.');}
      if(current!==revision)return;
      if(response.status===401){onExpired();return;}
      if(!response.ok||!data.ok)throw new Error(data.error||'We could not confirm submission. Please try again.');
      form.hidden=true;success.hidden=false;
      byId('success-title').textContent=data.preview?'Preview test complete':'Your request has been submitted';
      byId('success-message').textContent=data.preview
        ?'Your entries passed validation. This is a preview test only; no email was sent and no illustration request was submitted.'
        :data.confirmationEmail
          ?'Your request has been accepted for sending to info@opulenceinvestments.net. A confirmation email has also been queued for you. Our team will follow up with next steps.'
          :'Your request has been accepted for sending to info@opulenceinvestments.net, but we could not send your confirmation email. Please keep the reference below; you do not need to submit again.';
      byId('reference').textContent=(data.preview?'Test reference: ':'Reference: ')+data.reference;
      success.focus();form.reset();syncGoal();
    }catch(e){
      if(current!==revision)return;
      error.textContent=e.name==='AbortError'?'We could not confirm submission before the request timed out. Your entries are still here; please retry.':e.message;
      error.hidden=false;error.scrollIntoView({block:'center'});
    }finally{
      clearTimeout(timeout);
      if(current===revision){controller=null;submit.disabled=false;form.querySelectorAll('fieldset').forEach(field=>{field.disabled=false;});submit.textContent=byId('preview-note').hidden?'Submit illustration request':'Test illustration request';}
    }
  });
  return {reset};
}
