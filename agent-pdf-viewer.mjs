import * as pdfjs from './assets/js/pdf.min.mjs';

pdfjs.GlobalWorkerOptions.workerSrc=new URL('./assets/js/pdf.worker.min.mjs',import.meta.url).href;

// The caller passes authenticated bytes, never a public or credential-bearing URL.
export async function mountPdf({mount,blob,title,status,isActive}) {
  const loading=pdfjs.getDocument({data:new Uint8Array(await blob.arrayBuffer()),isEvalSupported:false,useSystemFonts:true});
  const pdf=await loading.promise;
  if(!isActive()){await pdf.destroy();return ()=>{};}
  const el=(tag,text,cls)=>{
    const node=document.createElement(tag);
    if(text)node.textContent=text;
    if(cls)node.className=cls;
    return node;
  };
  const viewer=el('section',null,'agent-pdf-viewer');
  viewer.setAttribute('aria-label',title+' PDF reader');
  const bar=el('div',null,'agent-pdf-toolbar');
  const previous=el('button','Previous','btn btn-outline');
  const next=el('button','Next','btn btn-outline');
  previous.type=next.type='button';
  previous.setAttribute('aria-label','Previous PDF page');
  next.setAttribute('aria-label','Next PDF page');
  const count=el('span',null,'agent-pdf-count');
  count.setAttribute('aria-live','polite');
  const zoom=el('select');
  zoom.setAttribute('aria-label','PDF zoom');
  for(const [value,label] of [['1','Fit width'],['1.25','125%'],['1.5','150%'],['2','200%']]){
    const option=el('option',label);option.value=value;zoom.append(option);
  }
  bar.append(previous,count,next,zoom);
  const viewport=el('div',null,'agent-pdf-viewport');
  viewport.tabIndex=0;viewport.setAttribute('aria-label','PDF page. Scroll to view zoomed content.');
  const canvas=el('canvas');
  canvas.setAttribute('aria-hidden','true');
  const text=el('div',null,'agent-pdf-text');
  viewport.append(canvas);viewer.append(bar,viewport,text);mount.prepend(viewer);
  let pageNumber=1,task=null,generation=0,disposed=false,resizeTimer;
  async function draw(){
    const turn=++generation;
    if(task){task.cancel();try{await task.promise;}catch{}task=null;}
    if(disposed||!isActive()||turn!==generation)return;
    const page=await pdf.getPage(pageNumber);
    if(disposed||!isActive()||turn!==generation)return;
    const natural=page.getViewport({scale:1});
    const width=Math.max(200,viewport.clientWidth-2)*Number(zoom.value);
    const scale=width/natural.width;
    const pixels=Math.min(window.devicePixelRatio||1,2);
    const view=page.getViewport({scale:scale*pixels});
    canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);
    canvas.style.width=width+'px';canvas.style.height=(natural.height*scale)+'px';
    task=page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport:view,background:'#ffffff'});
    await task.promise;
    if(disposed||turn!==generation)return;
    const words=await page.getTextContent();
    if(disposed||turn!==generation)return;
    text.textContent=words.items.map(item=>item.str||'').join(' ');
    count.textContent='Page '+pageNumber+' of '+pdf.numPages;
    previous.disabled=pageNumber===1;next.disabled=pageNumber===pdf.numPages;
    status.textContent='Read here, use the page and zoom controls, or download the original PDF.';
  }
  const render=()=>draw().catch(error=>{
    if(!disposed&&error.name!=='RenderingCancelledException')status.textContent='This page could not be rendered. You can still download the original PDF.';
  });
  previous.addEventListener('click',()=>{if(pageNumber>1){pageNumber--;viewport.scrollTop=0;viewport.scrollLeft=0;render();}});
  next.addEventListener('click',()=>{if(pageNumber<pdf.numPages){pageNumber++;viewport.scrollTop=0;viewport.scrollLeft=0;render();}});
  zoom.addEventListener('change',render);
  let lastWidth=viewport.clientWidth;
  const observer=new ResizeObserver(()=>{
    if(viewport.clientWidth===lastWidth)return;
    lastWidth=viewport.clientWidth;clearTimeout(resizeTimer);resizeTimer=setTimeout(render,100);
  });
  observer.observe(viewport);
  await render();
  return ()=>{
    disposed=true;generation++;clearTimeout(resizeTimer);observer.disconnect();
    if(task)task.cancel();pdf.destroy().catch(()=>{});viewer.remove();
  };
}
