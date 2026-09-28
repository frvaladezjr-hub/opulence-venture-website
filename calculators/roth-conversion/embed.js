/* Optional same-site embed mode. No financial data passes to the parent page. */
(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('embed') !== '1' || parent === window) return;
  document.documentElement.dataset.embedded = 'true';
  let scheduled = false;
  function reportHeight() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      parent.postMessage({
        type: 'opulence-roth-height',
        height: Math.ceil(document.body.getBoundingClientRect().height)
      }, '*');
    });
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || event.data?.type !== 'opulence-roth-theme') return;
    if (!['light', 'dark'].includes(event.data.theme)) return;
    document.documentElement.dataset.theme = event.data.theme;
    if (typeof event.data.background === 'string' && CSS.supports('color', event.data.background)) {
      document.documentElement.style.setProperty('--embed-background', event.data.background);
    }
    // App chart redraw observes the results element; resize it without changing layout.
    window.dispatchEvent(new Event('resize'));
    reportHeight();
  });
  new ResizeObserver(reportHeight).observe(document.body);
  document.fonts.ready.then(reportHeight);
  window.addEventListener('load', reportHeight);
  parent.postMessage({type: 'opulence-roth-ready'}, '*');
  reportHeight();
})();
