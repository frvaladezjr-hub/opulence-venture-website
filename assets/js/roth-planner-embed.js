/* Page-specific bridge: resizing, appearance, and accessible accordion state. */
(() => {
  'use strict';
  const frame = document.querySelector('[data-roth-planner-frame]');
  if (!frame) return;
  const item = frame.closest('.accordion-item');
  const panel = frame.closest('.accordion-panel');
  const inner = frame.closest('.accordion-panel-inner');
  const group = item.closest('[data-accordion-group]');
  item.id = 'roth-conversion-planning';
  panel.id = 'roth-conversion-planning-panel';
  inner.style.maxWidth = 'none';
  item.querySelector('.accordion-trigger').setAttribute('aria-controls', panel.id);

  function resizePanel() {
    if (item.dataset.open === 'true') panel.style.maxHeight = panel.scrollHeight + 'px';
  }
  function sendTheme() {
    frame.contentWindow?.postMessage({
      type: 'opulence-roth-theme',
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
      background: getComputedStyle(frame.closest('section') || document.body).backgroundColor
    }, '*');
  }
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || !event.data) return;
    if (event.data.type === 'opulence-roth-ready') sendTheme();
    if (event.data.type !== 'opulence-roth-height') return;
    const height = Number(event.data.height);
    if (!Number.isFinite(height) || height < 100 || height > 60000) return;
    const pixels = Math.ceil(height) + 'px';
    if (frame.style.height !== pixels) frame.style.height = pixels;
    resizePanel();
  });
  new MutationObserver(sendTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });
  new MutationObserver(() => {
    group.querySelectorAll('.accordion-item').forEach(accordion => {
      accordion.querySelector('.accordion-trigger')?.setAttribute(
        'aria-expanded', String(accordion.dataset.open === 'true')
      );
    });
    resizePanel();
  }).observe(group, {subtree: true, attributes: true, attributeFilter: ['data-open']});
  new ResizeObserver(resizePanel).observe(inner);
  frame.addEventListener('load', sendTheme);
  if (window.location.hash === '#roth-conversion-planning') {
    item.querySelector('.accordion-trigger').click();
    item.scrollIntoView({block: 'start'});
  }
})();
