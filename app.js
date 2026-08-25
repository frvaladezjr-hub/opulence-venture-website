// Opulence Venture Group — shared site behavior
(function () {
  'use strict';

  /* ---------- Icons ---------- */
  if (window.lucide) lucide.createIcons();

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggles = document.querySelectorAll('[data-theme-toggle]');
  var theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function paintToggles() {
    themeToggles.forEach(function (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      btn.innerHTML =
        theme === 'dark'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/></svg>';
    });
  }
  paintToggles();
  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      paintToggles();
    });
  });

  /* ---------- Header scroll behavior ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastY = window.scrollY;
    window.addEventListener(
      'scroll',
      function () {
        var y = window.scrollY;
        header.classList.toggle('site-header--scrolled', y > 8);
        if (y > lastY && y > 160) {
          header.classList.add('site-header--hidden');
        } else {
          header.classList.remove('site-header--hidden');
        }
        lastY = y;
      },
      { passive: true }
    );
  }

  /* ---------- Desktop nav dropdown ---------- */
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    var closeTimer = null;
    function close() {
      clearTimeout(closeTimer);
      dropdown.setAttribute('data-open', 'false');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function open() {
      clearTimeout(closeTimer);
      dropdown.setAttribute('data-open', 'true');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function scheduleClose() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(close, 250);
    }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.getAttribute('data-open') === 'true';
      isOpen ? close() : open();
    });
    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', scheduleClose);
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) close();
    });
    dropdown.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });

  /* ---------- Mobile menu ---------- */
  var mobileMenu = document.querySelector('.mobile-menu');
  var navToggle = document.querySelector('.nav-toggle');
  var mobileClose = document.querySelector('.mobile-menu-close');
  if (mobileMenu && navToggle) {
    function openMenu() {
      mobileMenu.setAttribute('data-open', 'true');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      mobileMenu.setAttribute('data-open', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    navToggle.addEventListener('click', openMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Mobile submenu accordion ---------- */
  document.querySelectorAll('[data-mobile-submenu-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var panel = trigger.nextElementSibling;
      var open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!open));
      if (panel) panel.style.display = open ? 'none' : 'flex';
    });
  });

  /* ---------- Accordion (FAQ / process) ---------- */
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      document.querySelectorAll('.accordion-item').forEach(function (other) {
        if (other !== item && other.closest('[data-accordion-group]') === item.closest('[data-accordion-group]')) {
          other.setAttribute('data-open', 'false');
          var op = other.querySelector('.accordion-panel');
          if (op) op.style.maxHeight = '0px';
        }
      });
      item.setAttribute('data-open', String(!isOpen));
      panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });

  /* ---------- Path cards (three primary client paths) ---------- */
  document.querySelectorAll('.path-card').forEach(function (card) {
    var trigger = card.querySelector('.path-card-trigger');
    var panel = card.querySelector('.path-card-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', function () {
      var isOpen = card.getAttribute('data-open') === 'true';
      card.setAttribute('data-open', String(!isOpen));
      panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.querySelector('#consultation-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var fields = form.querySelectorAll('[required]');
      fields.forEach(function (input) {
        var field = input.closest('.field');
        var invalid = !input.value.trim() || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
        if (field) field.setAttribute('data-invalid', String(invalid));
        if (invalid) valid = false;
      });
      if (!valid) {
        var firstInvalid = form.querySelector('[data-invalid="true"] input, [data-invalid="true"] select, [data-invalid="true"] textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var success = document.querySelector('#form-success');
      form.setAttribute('data-visible', 'false');
      form.style.display = 'none';
      if (success) {
        success.setAttribute('data-visible', 'true');
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    });
    form.querySelectorAll('input, textarea, select').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.setAttribute('data-invalid', 'false');
      });
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-current-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
