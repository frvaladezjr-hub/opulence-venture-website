(function () {
  'use strict';
  var form = document.getElementById('agent-login');
  if (!form) return;
  var byId = function(id) { return document.getElementById(id); };
  var forwarded = '__PORT_8010__';
  // Production uses the site's Vercel function. Private previews use the signed proxy.
  var endpoint = forwarded.startsWith('__')
    ? '/api/agent-resources'
    : new URL(forwarded + '/api/agent-resources', document.baseURI).href;
  var token = '';
  var resources = [];
  var kind = 'all';
  var expiryTimer;
  var busy = false;
  var epoch = 0;
  var mediaCleanup=[];

  function clearMedia() {
    mediaCleanup.forEach(function(cleanup){cleanup();});
    mediaCleanup=[];
  }

  function lock(message) {
    epoch++;
    token = '';
    resources = [];
    clearTimeout(expiryTimer);
    clearMedia();
    byId('agent-resource-grid').replaceChildren();
    byId('agent-resource-count').textContent = '';
    byId('agent-library').hidden = true;
    byId('agent-gate').hidden = false;
    byId('agent-search').value = '';
    byId('agent-code').value = '';
    byId('agent-code').type = 'password';
    byId('agent-show-code').textContent = 'Show';
    byId('agent-show-code').setAttribute('aria-label','Show passcode');
    byId('agent-show-code').setAttribute('aria-pressed','false');
    byId('agent-login-error').hidden = true;
    byId('agent-session-status').textContent = message || '';
    byId('agent-code').focus({preventScroll:true});
  }
  async function request(method, body, authorization) {
    var controller = new AbortController();
    var timeout = setTimeout(function(){controller.abort();},15000);
    try {
      var headers = {};
      if (body) headers['Content-Type'] = 'application/json';
      if (authorization) headers.Authorization = 'Bearer ' + authorization;
      var response = await fetch(endpoint, {
        method:method,headers:headers,body:body ? JSON.stringify(body) : undefined,
        credentials:'same-origin',cache:'no-store',signal:controller.signal
      });
      var data;
      try { data = await response.json(); } catch (_) { throw new Error('Access is temporarily unavailable. Please try again later.'); }
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many access attempts. Please wait 15 minutes before trying again.');
        if (response.status === 401) throw new Error(method === 'POST' ? 'That passcode was not recognized. Please try again.' : 'Your session has ended. Please enter the current passcode.');
        if (response.status === 503 || response.status === 422) throw new Error('Agent access is not available yet. Please contact your agency leader.');
        throw new Error('Unable to open the library. Please try again.');
      }
      return data;
    } catch(error) {
      if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  function element(tag, text, className) {
    var el=document.createElement(tag);
    if(text) el.textContent=text;
    if(className) el.className=className;
    return el;
  }
  function renderResources() {
    clearMedia();
    var query=byId('agent-search').value.trim().toLowerCase();
    var shown=resources.filter(function(item) {
      return (kind==='all'||item.type===kind) && (item.title+' '+item.description+' '+item.category).toLowerCase().includes(query);
    });
    var grid=byId('agent-resource-grid'); grid.replaceChildren();
    shown.forEach(function(item) {
      var card=element('article',null,'agent-resource-card');
      card.append(element('span',(item.type==='video'?'Video':'Material')+' · '+item.category,'agent-access-tag'));
      card.append(element('h3',item.title));
      card.append(element('p',item.description));
      if(item.embed && ['video','guide','pdf'].includes(item.embed.format)) {
        card.classList.add('agent-resource-embedded');
        var mount=element('div',null,'agent-media-mount');
        var load=element('button',item.embed.format==='pdf'?'View PDF':item.embed.format==='guide'?'Load narrated guide':'Load video','btn btn-outline');
        load.type='button';
        var status=element('p','','agent-media-status');
        status.setAttribute('role','status');
        var controller=null,objectUrl='',active=true,pdfCleanup=null;
        mediaCleanup.push(function(){
          active=false;
          if(controller)controller.abort();
          if(pdfCleanup)pdfCleanup();
          var video=mount.querySelector('video');
          if(video){video.pause();video.removeAttribute('src');video.load();}
          mount.replaceChildren();
          if(objectUrl)URL.revokeObjectURL(objectUrl);
        });
        load.addEventListener('click',async function(){
          load.disabled=true;status.textContent=item.embed.format==='pdf'?'Preparing PDF…':'Loading player…';
          controller=new AbortController();
          var timeout=setTimeout(function(){controller.abort();},60000);
          try {
            var response=await fetch(endpoint+'?media='+encodeURIComponent(item.embed.id),{
              headers:{Authorization:'Bearer '+token},credentials:'same-origin',
              cache:'no-store',signal:controller.signal
            });
            if(!response.ok)throw new Error(response.status===401?'Your session has ended. Sign in again to load this resource.':'This player is temporarily unavailable. Please try again.');
            var blob;
            if((response.headers.get('Content-Type')||'').includes('application/json')){
              var manifest=await response.json();
              if(manifest.transfer!=='chunks-v1'||!Number.isInteger(manifest.parts)||manifest.parts<1||manifest.parts>100||!Number.isInteger(manifest.size)||manifest.size<1||manifest.size>200*1024*1024)throw new Error('Invalid media response.');
              var pieces=[];
              for(var part=0;part<manifest.parts;part++){
                if(!active)return;
                status.textContent='Loading '+Math.round(part/manifest.parts*100)+'%…';
                var piece=await fetch(endpoint+'?media='+encodeURIComponent(item.embed.id)+'&part='+part,{
                  headers:{Authorization:'Bearer '+token},credentials:'same-origin',cache:'no-store',signal:controller.signal
                });
                if(!piece.ok)throw new Error(piece.status===401?'Your session has ended. Please sign in again.':'This resource could not be loaded. Please try again.');
                pieces.push(await piece.blob());
              }
              blob=new Blob(pieces,{type:manifest.mime});
              if(blob.size!==manifest.size)throw new Error('The download was incomplete. Please try again.');
            } else blob=await response.blob();
            if(!active)return;
            var expected=item.embed.format==='pdf'?'application/pdf':item.embed.format==='video'?'video/mp4':'text/html';
            if(!blob.type.startsWith(expected))throw new Error('The media could not be loaded.');
            objectUrl=URL.createObjectURL(blob);
            if(item.embed.format==='pdf'){
              var download=element('a','Download PDF','btn btn-outline');
              download.href=objectUrl;download.download=item.title.replace(/[^\w -]/g,'')+'.pdf';
              mount.append(download);
              try {
                var viewerModule=await import(new URL('./agent-pdf-viewer.mjs',document.baseURI).href);
                if(!active)return;
                pdfCleanup=await viewerModule.mountPdf({mount:mount,blob:blob,title:item.title,status:status,isActive:function(){return active;}});
                if(!active){pdfCleanup();return;}
                load.remove();
              } catch(pdfError) {
                if(active){load.remove();status.textContent='The inline reader is unavailable. You can still download the original PDF.';}
              }
              return;
            }
            var player;
            if(item.embed.format==='video'){
              player=element('video');player.controls=true;player.playsInline=true;player.preload='metadata';
              player.setAttribute('aria-label',item.title);
              player.addEventListener('error',function(){status.textContent='Your browser could not play this video. Please try another browser.';});
            } else {
              player=element('iframe');player.title=item.title+' narrated animation';
              player.setAttribute('sandbox','allow-scripts allow-popups allow-popups-to-escape-sandbox');
              player.setAttribute('allow','fullscreen');player.allowFullscreen=true;
            }
            player.src=objectUrl;mount.append(player);load.remove();
            status.textContent='Use the player controls to start playback.';
          } catch(error) {
            if(active){status.textContent=error.name==='AbortError'?'Loading timed out. Please try again.':error.message;load.disabled=false;}
          } finally {clearTimeout(timeout);}
        });
        card.append(load,mount,status);grid.append(card);return;
      }
      var link=element('a',item.type==='video'?'Watch video':'Open material','btn btn-outline');
      // The server permits HTTPS links only; repeat the check at the rendering boundary.
      try { if (new URL(item.url).protocol!=='https:') return; } catch(_) { return; }
      link.href=item.url; link.target='_blank'; link.rel='noopener noreferrer'; link.referrerPolicy='no-referrer';
      link.setAttribute('aria-label',(item.type==='video'?'Watch ':'Open ')+item.title+' (opens in a new tab)');
      card.append(link); grid.append(card);
    });
    byId('agent-resource-count').textContent=shown.length+' of '+resources.length+' resources';
    byId('agent-empty').hidden=shown.length>0;
    byId('agent-empty-title').textContent=resources.length ? 'No matching resources.' : 'Your library is ready to grow.';
    byId('agent-empty-description').textContent=resources.length
      ? 'Try a different search term or choose All resources.'
      : 'Approved materials and training videos will appear here as they are added. Check back with your agency leader for the first resources.';
  }
  byId('agent-show-code').addEventListener('click',function(){
    var show=byId('agent-code').type==='password';
    byId('agent-code').type=show?'text':'password';
    this.textContent=show?'Hide':'Show';
    this.setAttribute('aria-label',show?'Hide passcode':'Show passcode');
    this.setAttribute('aria-pressed',String(show));
  });
  form.addEventListener('submit',async function(event){
    event.preventDefault();
    if(busy) return;
    var code=byId('agent-code').value;
    var error=byId('agent-login-error');
    error.hidden=true;
    byId('agent-session-status').textContent='';
    if(!/^\d{4}$/.test(code)){
      error.textContent='Please enter exactly four digits.'; error.hidden=false;
      byId('agent-code').setAttribute('aria-invalid','true'); byId('agent-code').focus(); return;
    }
    byId('agent-code').removeAttribute('aria-invalid');
    busy=true; byId('agent-unlock').disabled=true; byId('agent-unlock').textContent='Checking access…';
    var turn=epoch;
    var issued='';
    try {
      var session=await request('POST',{code:code});
      issued=session.token;
      byId('agent-code').value='';
      if(!issued||!Number.isFinite(session.expiresAt)) throw new Error('Unable to confirm access.');
      var library=await request('GET',null,issued);
      if(turn!==epoch) { request('DELETE',null,issued).catch(function(){}); return; }
      if(!Array.isArray(library.resources)) throw new Error('Unable to load resources.');
      token=issued; resources=library.resources; kind='all';
      document.querySelectorAll('[data-resource-filter]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.resourceFilter==='all'));});
      renderResources();
      byId('agent-gate').hidden=true; byId('agent-library').hidden=false;
      byId('agent-library-title').focus({preventScroll:true});
      byId('agent-library').scrollIntoView({block:'start',behavior:'instant'});
      expiryTimer=setTimeout(function(){lock('Your session has expired. Please enter the passcode again.');},Math.max(0,session.expiresAt-Date.now()));
    } catch(failure) {
      if(issued) request('DELETE',null,issued).catch(function(){});
      if(turn===epoch) {
        error.textContent=failure.message || 'Unable to connect. Please try again.';error.hidden=false;
        error.tabIndex=-1;error.focus();
      }
    } finally {
      byId('agent-code').value='';
      busy=false;byId('agent-unlock').disabled=false;byId('agent-unlock').textContent='Unlock Agent Resources';
    }
  });
  byId('agent-signout').addEventListener('click',async function(){
    var current=token;lock('You have signed out.');
    try {await request('DELETE',null,current);} catch(_) {byId('agent-session-status').textContent='This page is locked. The server could not confirm sign-out; the previous session will expire automatically.';}
  });
  byId('agent-search').addEventListener('input',renderResources);
  document.querySelectorAll('[data-resource-filter]').forEach(function(button){
    button.addEventListener('click',function(){
      kind=this.dataset.resourceFilter;
      document.querySelectorAll('[data-resource-filter]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});
      renderResources();
    });
  });
  // Do not retain a library or access proof in a browser back/forward snapshot.
  window.addEventListener('pagehide',function(){lock();});
  window.addEventListener('pageshow',function(event){if(event.persisted)lock('Please enter the passcode to reopen the library.');});
})();
