/* Independent calculation engine. All currency values remain unrounded until display. */
(function (root) {
  'use strict';
  const YEAR = 2026;
  const TAX = {
    mfj: {deduction:32200,additional:1650,limits:[24800,100800,211400,403550,512450,768700]},
    single: {deduction:16100,additional:2050,limits:[12400,50400,105700,201775,256225,640600]}
  };
  const RATES = [10,12,22,24,32,35,37];
  const IRMAA = {mfj:[218000,274000,342000,410000,750000],single:[109000,137000,171000,205000,500000]};
  const PART_B = [202.90,284.10,405.80,527.50,649.20,689.90];
  const PART_D = [0,14.50,37.50,60.40,83.30,91.00];
  const DIVISORS = {72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22,79:21.1,80:20.2,81:19.4,82:18.5,83:17.7,84:16.8,85:16,86:15.2,87:14.4,88:13.7,89:12.9,90:12.2,91:11.5,92:10.8,93:10.1,94:9.5,95:8.9};
  const defaults = {mode:'bracket',age:66,ira:900000,status:'mfj',spouse:65,income:181000,bracket:24,fixed:100000,percent:10,tax:24,irmaa:'1',bonus:0,rate:6,withdrawal:10,basis:'account',holdback:true,rmds:true,compare:false,peryear:false,portfolio:7,heir:24,horizon:90,annual:Array(10).fill(6)};
  function deduction(p,offset=0) {
    const t=TAX[p.status];
    return t.deduction+t.additional*((p.age+offset>=65?1:0)+(p.status==='mfj'&&p.spouse+offset>=65?1:0));
  }
  function rmdAge(p) {const birth=YEAR-p.age;return birth>=1960?75:birth>=1951?73:birth>=1950?72:70.5;}
  function distribution(balance,age,p) {return p.rmds&&age>=rmdAge(p)?balance/(DIVISORS[age]||27.4):0;}
  function irmaaActive(p,offset) {return p.age+offset>=63||(p.status==='mfj'&&p.spouse+offset>=63);}
  function crossing(magi,threshold,index) {return Number(index)===4?magi>=threshold:magi>threshold;}
  function project(p) {
    let ira=p.ira*(1+p.bonus/100),roth=0;
    const rows=[];
    for(let i=0;i<10;i++){
      const age=p.age+i,beginning=ira,rmd=distribution(beginning,age,p);
      const available=Math.max(0,beginning-rmd);
      const ceiling=TAX[p.status].limits[RATES.indexOf(p.bracket)];
      const bracketRoom=Math.max(0,ceiling+deduction(p,i)-p.income-rmd);
      let target=p.mode==='bracket'?bracketRoom:p.mode==='fixed'?p.fixed:available*p.percent/100;
      let irmaaLimited=false,withdrawalLimited=false;
      const threshold=p.irmaa==='none'?null:IRMAA[p.status][Number(p.irmaa)];
      if(p.mode==='bracket'&&threshold!==null&&irmaaActive(p,i)){
        const room=Math.max(0,threshold-1-p.income-rmd);
        irmaaLimited=target>room;target=Math.min(target,room);
      }
      const allowance=(p.basis==='greater'?Math.max(beginning,p.ira):beginning)*p.withdrawal/100;
      let gross=Math.min(Math.max(target,0),available);
      if(p.tax>0){
        const maximum=Math.max(0,allowance-rmd)/(p.tax/100);
        withdrawalLimited=gross>maximum+.001;gross=Math.min(gross,maximum);
      }
      if(i===0&&p.holdback){gross=0;irmaaLimited=false;withdrawalLimited=false;}
      const tax=gross*p.tax/100,net=gross-tax;
      const rate=(p.peryear?p.annual[i]:p.rate)/100;
      const iraCredit=(available-gross)*rate;
      ira=available-gross+iraCredit;
      const rothCredit=(roth+net)*rate;
      roth+=net+rothCredit;
      const magi=p.income+rmd+gross;
      const flagged=threshold!==null&&irmaaActive(p,i)&&crossing(magi,threshold,p.irmaa);
      rows.push({year:i+1,age,beginning,iraCredit,rmd,gross,tax,net,ending:ira,rothCredit,roth,magi,flagged,irmaaLimited,withdrawalLimited,rmdAboveAllowance:rmd>allowance+.01,rate});
    }
    const totals={};
    ['gross','tax','net','rmd','rothCredit','iraCredit'].forEach(k=>totals[k]=rows.reduce((sum,r)=>sum+r[k],0));
    return {rows,totals,ira,roth,rmdAge:rmdAge(p),initial:p.ira*(1+p.bonus/100)};
  }
  function compare(p,plan) {
    const endAge=Math.max(p.horizon,p.age+9),result=[];
    let convIRA=plan.initial,convRoth=0,convSide=0,holdIRA=p.ira,holdSide=0;
    for(let age=p.age;age<=endAge;age++){
      const i=age-p.age;
      let cRmd,cRate;
      if(i<10){
        const row=plan.rows[i];convIRA=row.ending;convRoth=row.roth;cRmd=row.rmd;cRate=row.rate;
      }else{
        cRate=p.rate/100;cRmd=distribution(convIRA,age,p);
        convIRA=(convIRA-cRmd)*(1+cRate);convRoth*=1+cRate;
      }
      convSide=(convSide+cRmd*(1-p.tax/100))*(1+cRate*.85);
      const hRmd=distribution(holdIRA,age,p);
      holdSide=(holdSide+hRmd*(1-p.tax/100))*(1+p.portfolio/100*.85);
      holdIRA=(holdIRA-hRmd)*(1+p.portfolio/100);
      result.push({age,conversionWealth:convRoth+convSide+convIRA*(1-p.heir/100),holdWealth:holdSide+holdIRA*(1-p.heir/100),conversionBalance:convIRA+convRoth,holdBalance:holdIRA,conversionSide:convSide,holdSide,holdRmd:hRmd});
    }
    return result;
  }
  const api={YEAR,TAX,RATES,IRMAA,PART_B,PART_D,DIVISORS,defaults,deduction,rmdAge,project,compare};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.RothModel=api;
})(typeof window!=='undefined'?window:globalThis);
