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

  /* ---------- Roth conversion tax estimator ---------- */
  var rothCalc = document.querySelector('[data-roth-calculator]');
  if (rothCalc) {
    var ROTH_BRACKETS = {
      single: [[0, 12400, 0.10], [12400, 50400, 0.12], [50400, 105700, 0.22], [105700, 201775, 0.24], [201775, 256225, 0.32], [256225, 640600, 0.35], [640600, Infinity, 0.37]],
      mfj: [[0, 24800, 0.10], [24800, 100800, 0.12], [100800, 211400, 0.22], [211400, 403550, 0.24], [403550, 512450, 0.32], [512450, 768700, 0.35], [768700, Infinity, 0.37]],
      hoh: [[0, 17700, 0.10], [17700, 67450, 0.12], [67450, 105700, 0.22], [105700, 201775, 0.24], [201775, 256200, 0.32], [256200, 640600, 0.35], [640600, Infinity, 0.37]]
    };
    var rothCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    var rothTaxForIncome = function (income, brackets) {
      var tax = 0;
      for (var i = 0; i < brackets.length; i++) {
        var lo = brackets[i][0], hi = brackets[i][1], rate = brackets[i][2];
        if (income > lo) {
          tax += (Math.min(income, hi) - lo) * rate;
        } else {
          break;
        }
      }
      return tax;
    };

    var rothBracketForIncome = function (income, brackets) {
      for (var i = 0; i < brackets.length; i++) {
        if (income <= brackets[i][1]) return brackets[i][2];
      }
      return brackets[brackets.length - 1][2];
    };

    var rothBtn = rothCalc.querySelector('[data-roth-calculate]');
    if (rothBtn) {
      rothBtn.addEventListener('click', function () {
        var statusEl = rothCalc.querySelector('#roth-filing-status');
        var incomeEl = rothCalc.querySelector('#roth-income');
        var conversionEl = rothCalc.querySelector('#roth-conversion');
        var resultEl = rothCalc.querySelector('[data-roth-result]');
        var brackets = ROTH_BRACKETS[statusEl.value] || ROTH_BRACKETS.single;

        var income = Math.max(0, parseFloat(incomeEl.value) || 0);
        var conversion = Math.max(0, parseFloat(conversionEl.value) || 0);

        var baseTax = rothTaxForIncome(income, brackets);
        var totalTax = rothTaxForIncome(income + conversion, brackets);
        var conversionTax = Math.max(0, totalTax - baseTax);
        var marginalRate = conversion > 0 ? (conversionTax / conversion) * 100 : 0;
        var bracketBefore = rothBracketForIncome(income, brackets) * 100;
        var bracketAfter = rothBracketForIncome(income + conversion, brackets) * 100;

        rothCalc.querySelector('[data-roth-out-tax]').textContent = rothCurrency.format(conversionTax);
        rothCalc.querySelector('[data-roth-out-rate]').textContent = marginalRate.toFixed(1) + '%';
        rothCalc.querySelector('[data-roth-out-before]').textContent = bracketBefore.toFixed(0) + '%';
        rothCalc.querySelector('[data-roth-out-after]').textContent = bracketAfter.toFixed(0) + '%';
        resultEl.hidden = false;
      });
    }
  }

  /* ---------- FICA savings estimator (Irongate partner card) ---------- */
  var ficaCalc = document.querySelector('[data-fica-calculator]');
  if (ficaCalc) {
    var ficaCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    var ficaBtn = ficaCalc.querySelector('[data-fica-calculate]');
    if (ficaBtn) {
      ficaBtn.addEventListener('click', function () {
        var employeesEl = ficaCalc.querySelector('#fica-employees');
        var resultEl = ficaCalc.querySelector('[data-fica-result]');
        var employees = Math.max(0, parseInt(employeesEl.value, 10) || 0);
        var savings = employees * 1186;

        ficaCalc.querySelector('[data-fica-out-savings]').textContent = 'Up to ' + ficaCurrency.format(savings);
        resultEl.hidden = false;
      });
    }
  }
})();
