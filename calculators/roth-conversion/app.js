/* UI state is memory-only. Nothing is transmitted or stored by the calculator. */
(() => {
  'use strict';
  const M=window.RothModel,$=id=>document.getElementById(id);
  const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
  const dollars=n=>money.format(n);
  const decimal=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
  const modes={bracket:'Fill the Tax Bracket',fixed:'Fixed Dollar Amount',percent:'Percent of Account Value'};
  let mode='bracket',view='wealth',lastPlan=null,lastParams=null,comparison=[];
  const checks=['holdback','rmds','compare','peryear'];
  const strings=['status','irmaa','basis'];
  const numeric=['age','ira','spouse','income','bracket','fixed','percent','tax','bonus','rate','withdrawal','portfolio','heir','horizon'];
  const amountLimits={ira:1e9,income:1e9,fixed:1e9};
  for(let i=0;i<10;i++){
    const field=document.createElement('div');field.className='field';
    field.innerHTML=`<label for="annual-${i}">Year ${i+1} %</label><input id="annual-${i}" type="number" min="0" max="30" step="0.1" value="6" required>`;
    $('annual-grid').append(field);
  }
  function parse(value){return Number(String(value).replace(/[$,\s]/g,''));}
  function getParams(){
    const p={mode};
    numeric.forEach(id=>p[id]=parse($(id).value));
    strings.forEach(id=>p[id]=$(id).value);
    checks.forEach(id=>p[id]=$(id).checked);
    p.annual=Array.from({length:10},(_,i)=>parse($(`annual-${i}`).value));
    return p;
  }
  function setParams(p){
    mode=Object.hasOwn(modes,p.mode)?p.mode:'bracket';
    numeric.forEach(id=>{if(Number.isFinite(Number(p[id])))$(id).value=p[id];});
    strings.forEach(id=>{if(Array.from($(id).options).some(o=>o.value===String(p[id])))$(id).value=p[id];});
    checks.forEach(id=>$(id).checked=!!p[id]);
    for(let i=0;i<10;i++)$(`annual-${i}`).value=Number.isFinite(p.annual?.[i])?p.annual[i]:6;
    document.querySelectorAll('[data-money]').forEach(el=>el.value=decimal.format(parse(el.value)));
  }
  function syncControls(){
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));
    ['bracket','fixed','percent'].forEach(id=>$(id+'-field').hidden=mode!==id);
    $('spouse-field').hidden=$('status').value==='single';
    $('annual-fields').hidden=!$('peryear').checked;
    $('comparison-inputs').hidden=!$('compare').checked;
    $('tax-hint').textContent=mode==='bracket'?'Matches your target bracket. Adjust for state tax.':'Withheld from each gross conversion; not actual tax due.';
    const t=M.IRMAA[$('status').value],labels=['Below the first surcharge','Allow one tier','Allow two tiers','Allow three tiers','Allow four tiers'];
    for(let i=0;i<5;i++)$('irmaa').options[i+1].textContent=`${labels[i]} (below ${dollars(t[i])})`;
    $('strategy-label').textContent=modes[mode];
  }
  function validate(){
    const errors=[];
    document.querySelectorAll('#calculator input').forEach(el=>{
      el.removeAttribute('aria-invalid');
      if(el.type==='checkbox'||el.closest('[hidden]'))return;
      const raw=el.value.trim(),value=parse(raw);
      let error='';
      const name=el.labels?.[0]?.childNodes[0]?.textContent.trim()||'Value';
      if(raw===''||!Number.isFinite(value)||(!el.hasAttribute('data-money')&&!el.checkValidity()))error=`${name}: enter a valid number${el.min!==''?` from ${el.min} to ${el.max}`:''}.`;
      if(el.hasAttribute('data-money')&&(value<0||value>amountLimits[el.id]))error=`${name}: enter an amount from 0 to 1,000,000,000.`;
      if(error){errors.push(error);el.setAttribute('aria-invalid','true');}
    });
    $('errors').hidden=!errors.length;
    $('errors').replaceChildren();
    if(errors.length){const ul=document.createElement('ul');errors.forEach(error=>{const li=document.createElement('li');li.textContent=error;ul.append(li);});$('errors').append(ul);}
    return errors.length===0;
  }
  function renderReferences(p){
    const data=M.TAX[p.status],ded=M.deduction(p);
    $('reference-status').textContent=(p.status==='mfj'?'Married filing jointly':'Single')+' · Linked to your inputs';
    $('deduction').textContent=dollars(ded);
    const added=ded-data.deduction;
    let html=`<tr class="deduction-row"><td>0%</td><td>First ${dollars(ded)} of income <span class="tag">Standard deduction${added?' + age 65 addition':''}</span></td></tr>`;
    M.RATES.forEach((rate,i)=>{
      const range=i===0?`Up to ${dollars(data.limits[0])}`:i===6?`Over ${dollars(data.limits[5])}`:`${dollars(data.limits[i-1]+1)} to ${dollars(data.limits[i])}`;
      const common=rate===22||rate===24;
      html+=`<tr class="${common?'bracket-highlight':''}"><td>${rate}%</td><td>${range}${common?' <span class="tag">Common conversion ceiling</span>':''}</td></tr>`;
    });
    $('brackets-body').innerHTML=html;
    const t=M.IRMAA[p.status];
    $('irmaa-body').innerHTML=M.PART_B.map((b,i)=>{
      const range=i===0?`Up to ${dollars(t[0])}`:i===5?`${dollars(t[4])} and above`:i===4?`Over ${dollars(t[3])}, below ${dollars(t[4])}`:`Over ${dollars(t[i-1])} to ${dollars(t[i])}`;
      return `<tr class="${i===1?'cliff':''}"><td>${range}${i===0?' <span class="tag">Standard</span>':i===1?' <span class="tag red">First surcharge cliff</span>':''}</td><td>$${b.toFixed(2)}</td><td>${i?' +$'+M.PART_D[i].toFixed(2):'No add-on'}</td></tr>`;
    }).join('');
  }
  function valueCell(n,positive=false,dash=false){return `<td${positive?' class="positive"':''}>${dash&&Math.abs(n)<.005?'–':dollars(n)}</td>`;}
  function observations(p,plan){
    const rows=plan.rows,end=rows.at(-1);
    const paragraphs=[
      `Starting from a <strong>${dollars(p.ira)}</strong> Traditional IRA, the premium bonus brings the initial account value to <strong>${dollars(plan.initial)}</strong>. ${p.holdback?'Year 1 takes no conversion while the account earns its first hypothetical credit. ':''}Conversions follow a 10-year schedule, with withholding deducted from each gross conversion.`,
      `The plan moves <strong>${dollars(plan.totals.net)}</strong> into the Roth after <strong>${dollars(plan.totals.tax)}</strong> of withholding. Hypothetical Roth credits total <strong>${dollars(plan.totals.rothCredit)}</strong>. Withholding is not a determination of actual taxes owed.`
    ];
    if(mode==='bracket')paragraphs.push(`The target is the top of the <strong>${p.bracket}% bracket</strong>. Conversion room is the taxable-income ceiling plus the applicable standard deduction, less other income and RMDs.`);
    if(rows.some(r=>r.irmaaLimited))paragraphs.push(`The selected IRMAA ceiling limits at least one conversion. Bracket mode targets MAGI one dollar below <strong>${dollars(M.IRMAA[p.status][Number(p.irmaa)])}</strong>, using 2026 thresholds throughout.`);
    const flagged=rows.filter(r=>r.flagged).map(r=>r.year);
    if(flagged.length)paragraphs.push(`<span class="negative">Your selected IRMAA ceiling is crossed in Year${flagged.length>1?'s':''} ${flagged.join(', ')}. Highlighted rows may affect Medicare premiums two years later; surcharge dollars are not deducted from these results.</span>`);
    if(rows.some(r=>r.withdrawalLimited))paragraphs.push('The free withdrawal allowance limits at least one conversion because withholding plus RMDs would exceed the modeled allowance. The model reduces conversions automatically.');
    if(rows.some(r=>r.rmdAboveAllowance))paragraphs.push('<span class="negative">At least one RMD exceeds the modeled free withdrawal allowance. The RMD is still taken; confirm any RMD waiver or surrender-charge treatment with the carrier.</span>');
    if(plan.totals.rmd>0)paragraphs.push(`The modeled RMD starting age is <strong>${plan.rmdAge}</strong>. Required distributions total <strong>${dollars(plan.totals.rmd)}</strong> across this plan and are not converted. The main balance chart excludes RMD proceeds; the optional comparison reinvests after-tax RMDs for both paths.`);
    if(!p.rmds)paragraphs.push('<span class="negative">RMD modeling is turned off. This is a what-if illustration and may overstate conversion capacity when required distributions apply.</span>');
    if(p.age<60)paragraphs.push('<span class="negative">You entered an age below 60. The model does not include any additional tax on withheld or distributed amounts before age 59½. Review early-distribution and Roth five-year rules before acting.</span>');
    paragraphs.push(end.ending<.5?'The modeled Traditional IRA is depleted by the end of this schedule. Qualified Roth withdrawals may be tax-free; applicable holding-period and distribution rules still apply.':`At age <strong>${end.age}</strong>, <strong>${dollars(end.ending)}</strong> remains in the Traditional IRA. Further conversions, distributions, or leaving the balance invested would require additional planning.`);
    $('observations').innerHTML=paragraphs.map(t=>`<p>${t}</p>`).join('');
  }
  function drawChart(id,labels,series){
    const canvas=$(id),rect=canvas.getBoundingClientRect();
    if(rect.width<1)return;
    const dpr=window.devicePixelRatio||1;
    canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    const width=rect.width,height=rect.height,left=58,right=16,top=20,bottom=30;
    const plotW=width-left-right,plotH=height-top-bottom;
    const css=getComputedStyle(document.documentElement);
    const color=v=>css.getPropertyValue(v).trim();
    const highest=Math.max(1,...series.flatMap(s=>s.values)),power=Math.pow(10,Math.floor(Math.log10(highest)));
    const maximum=Math.ceil(highest/power*2)/2*power;
    const x=i=>left+i/(labels.length-1)*plotW,y=n=>top+plotH*(1-n/maximum);
    ctx.font='11px Inter, sans-serif';ctx.lineWidth=1;
    for(let i=0;i<=4;i++){
      const v=maximum*i/4,yp=y(v);
      ctx.strokeStyle=color('--line');ctx.beginPath();ctx.moveTo(left,yp);ctx.lineTo(width-right,yp);ctx.stroke();
      ctx.fillStyle=color('--muted');ctx.textAlign='right';ctx.fillText(v>=1e6?'$'+decimal.format(v/1e6)+'M':v>=1e3?'$'+decimal.format(v/1e3)+'K':dollars(v),left-9,yp+4);
    }
    const step=Math.max(1,Math.ceil(labels.length/(width<450?5:10)));
    ctx.textAlign='center';
    labels.forEach((label,i)=>{
      const isLast=i===labels.length-1;
      const clearOfLast=x(labels.length-1)-x(i)>38;
      if(isLast||(i%step===0&&clearOfLast))ctx.fillText(label,x(i),height-8);
    });
    series.forEach(s=>{
      const stroke=color(s.color);
      ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.beginPath();
      s.values.forEach((v,i)=>i===0?ctx.moveTo(x(i),y(v)):ctx.lineTo(x(i),y(v)));ctx.stroke();
      s.values.forEach((v,i)=>{ctx.beginPath();ctx.arc(x(i),y(v),labels.length>15?2:3,0,Math.PI*2);ctx.fillStyle=stroke;ctx.fill();});
    });
  }
  function drawAll(){
    if(!lastPlan||$('result-content').hidden)return;
    drawChart('plan-chart',lastPlan.rows.map(r=>'Yr '+r.year),[{values:lastPlan.rows.map(r=>r.ending),color:'--navy'},{values:lastPlan.rows.map(r=>r.roth),color:'--green'}]);
    if(!$('comparison').hidden){
      drawChart('compare-chart',comparison.map(r=>r.age),[{values:comparison.map(r=>view==='wealth'?r.conversionWealth:r.conversionBalance),color:'--green'},{values:comparison.map(r=>view==='wealth'?r.holdWealth:r.holdBalance),color:'--navy'}]);
    }
  }
  function renderComparison(p,plan){
    $('comparison').hidden=!p.compare;
    if(!p.compare)return;
    comparison=M.compare(p,plan);
    const end=comparison.at(-1),diff=end.conversionWealth-end.holdWealth;
    $('compare-convert').textContent=dollars(end.conversionWealth);
    $('compare-hold').textContent=dollars(end.holdWealth);
    $('compare-difference').textContent=(diff>=0?'+':'−')+dollars(Math.abs(diff));
    $('compare-difference').className=diff>=0?'positive':'negative';
    document.querySelectorAll('.comparison-age').forEach(el=>el.textContent=`After-tax family wealth at age ${end.age}`);
    $('difference-caption').textContent=diff>=0?'More projected wealth with conversion':'More projected wealth without conversion';
    $('comparison-caption').textContent=view==='wealth'?'After-tax family wealth: Roth and reinvested RMD proceeds, plus the IRA after the heirs’ tax-rate discount.':'Account balances only: Roth plus remaining IRA versus the unconverted IRA. Summary cards still show after-tax wealth.';
    $('comparison-note').textContent=`Through age ${end.age}, ${diff>=0?'the conversion plan':'the do-nothing path'} ends ahead by ${dollars(Math.abs(diff))} under these assumptions. Both paths reinvest after-tax RMD proceeds from the first year. No additional conversions are modeled after Year 10. Different growth, tax, contract, or inheritance assumptions can change which approach comes out ahead.`;
    $('comparison-body').innerHTML=comparison.map(r=>`<tr><td>${r.age}</td>${valueCell(r.conversionWealth)}${valueCell(r.holdWealth)}${valueCell(r.conversionBalance)}${valueCell(r.holdBalance)}</tr>`).join('');
  }
  function render(){
    syncControls();
    const valid=validate();
    $('result-content').hidden=!valid;
    $('empty').hidden=valid;
    $('export').disabled=!valid;$('share').disabled=!valid;
    if(!valid){$('empty').textContent='Correct the highlighted inputs to update your projected plan.';return;}
    const p=getParams();renderReferences(p);
    if(p.ira===0){
      lastPlan=null;$('result-content').hidden=true;$('empty').hidden=false;
      $('empty').textContent='Enter a Traditional IRA balance greater than zero to build your projected plan.';
      $('export').disabled=true;return;
    }
    const plan=M.project(p);lastPlan=plan;lastParams=p;
    $('empty').hidden=true;$('result-content').hidden=false;
    $('roth-total').textContent=dollars(plan.roth);$('tax-total').textContent=dollars(plan.totals.tax);$('ira-total').textContent=dollars(plan.ira);
    $('roth-caption').textContent=`At age ${p.age+9}, after 10 illustrated years`;
    $('ira-caption').textContent=plan.ira<.5?'Traditional IRA depleted within the plan':'Still pre-tax after Year 10';
    $('schedule-body').innerHTML=plan.rows.map(r=>`<tr${r.flagged?' class="flagged"':''}><td>${r.year}</td><td>${r.age}</td>${valueCell(r.beginning)}${valueCell(r.iraCredit,true,true)}${valueCell(r.rmd,false,true)}${valueCell(r.gross,false,true)}${valueCell(r.tax,false,true)}${valueCell(r.net,false,true)}${valueCell(r.ending)}${valueCell(r.rothCredit,true,true)}<td><strong>${dollars(r.roth)}</strong></td></tr>`).join('');
    $('schedule-foot').innerHTML=`<tr><td colspan="5">Totals</td>${valueCell(plan.totals.gross)}${valueCell(plan.totals.tax)}${valueCell(plan.totals.net)}${valueCell(plan.ira)}${valueCell(plan.totals.rothCredit,true)}${valueCell(plan.roth,true)}</tr>`;
    observations(p,plan);renderComparison(p,plan);drawAll();
  }
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.mode;if(mode==='bracket')$('tax').value=$('bracket').value;
    $('share-box').hidden=true;render();
  }));
  $('calculator').addEventListener('submit',e=>e.preventDefault());
  $('calculator').addEventListener('input',()=>{$('share-box').hidden=true;render();});
  $('calculator').addEventListener('change',e=>{
    if(e.target.id==='bracket'&&mode==='bracket')$('tax').value=$('bracket').value;
    if(e.target.id==='peryear'&&e.target.checked)for(let i=0;i<10;i++)$(`annual-${i}`).value=$('rate').value;
    render();
  });
  document.querySelectorAll('[data-money]').forEach(el=>el.addEventListener('blur',()=>{
    if(el.value.trim()!==''&&Number.isFinite(parse(el.value)))el.value=decimal.format(parse(el.value));
  }));
  $('reset').addEventListener('click',()=>{view='wealth';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));setParams(M.defaults);$('share-box').hidden=true;render();});
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));
    renderComparison(lastParams,lastPlan);drawAll();
  }));
  $('theme').addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme!=='dark';
    document.documentElement.dataset.theme=dark?'dark':'light';
    $('theme').setAttribute('aria-label',`Switch to ${dark?'light':'dark'} appearance`);drawAll();
  });
  $('export').addEventListener('click',()=>{
    if(!lastPlan)return;
    const p=lastParams;
    const metadata=[['Opulence Venture Group - Roth conversion illustration'],['Educational estimate; not tax advice'],['Reference year',2026],['Strategy',modes[p.mode]],...numeric.map(k=>[k,p[k]]),...strings.map(k=>[k,p[k]]),...checks.map(k=>[k,p[k]]),['Annual credits',p.annual.join('; ')],[]];
    const rows=[['Year','Age','Beginning IRA','Index credit to IRA','RMD','Gross conversion','Tax withheld','Net to Roth','Ending IRA','Index credit to Roth','Roth balance'],...lastPlan.rows.map(r=>[r.year,r.age,...['beginning','iraCredit','rmd','gross','tax','net','ending','rothCredit','roth'].map(k=>r[k].toFixed(2))])];
    const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const csv=[...metadata,...rows].map(r=>r.map(quote).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='opulence-roth-conversion-plan.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('share').addEventListener('click',async()=>{
    const url=new URL(window.location.href);url.hash='';url.search='';
    url.searchParams.set('scenario',JSON.stringify(getParams()));
    $('share-url').value=url.href;$('share-box').hidden=false;
    const local=window.location.protocol==='file:';
    $('share-status').textContent=local?'Local-file link: works only with this file on this device. Host the calculator to share scenario links across devices.':'Select and copy the link above if your browser does not allow automatic copying.';
    try{await navigator.clipboard.writeText(url.href);if(!local)$('share-status').textContent='Scenario link copied.';}catch{$('share-url').focus();$('share-url').select();}
  });
  function loadScenario(){
    const raw=new URLSearchParams(window.location.search).get('scenario');
    if(!raw)return false;
    try{
      const data=JSON.parse(raw);
      if(!data||typeof data!=='object'||Array.isArray(data))return false;
      setParams({...M.defaults,...data});return true;
    }catch{return false;}
  }
  if(!loadScenario())setParams(M.defaults);
  if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark';$('theme').setAttribute('aria-label','Switch to light appearance');}
  new ResizeObserver(()=>drawAll()).observe($('results'));
  window.addEventListener('resize',drawAll);
  render();
})();
