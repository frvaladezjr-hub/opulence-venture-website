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

  /* ---------- Required Minimum Distribution (RMD) Projector ---------- */
  /*
   * Configuration block — update here if the IRS changes RMD starting ages
   * or the Uniform Lifetime Table divisors. Nothing below this config object
   * should need to change if the underlying IRS rules are revised.
   */
  var RMD_CONFIG = {
    // RMD required-beginning-age cohorts by birth year, per the SECURE Act
    // and SECURE 2.0 Act (IRC Section 401(a)(9); see IRS Pub. 590-B).
    startingAgeByBirthYear: [
      { maxYear: 1950, age: 72 },   // born 1950 or earlier
      { maxYear: 1959, age: 73 },   // born 1951-1959
      { maxYear: Infinity, age: 75 } // born 1960 or later
    ],
    // IRS Uniform Lifetime Table (Table III), Treasury Reg. Section 1.401(a)(9)-9,
    // effective for distribution years beginning on/after Jan 1, 2022.
    // Source: IRS Publication 590-B, Appendix B, Table III.
    lifeExpectancyDivisors: {
      72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
      79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
      86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
      93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
      100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
      107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
      114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0
    },
    finalProjectionAge: 95,
    defaultRatePercent: 7,
    minBirthYear: 1920,
    maxRatePercent: 20,
    minRatePercent: -20
  };

  function rmdStartingAge(birthYear) {
    var cohorts = RMD_CONFIG.startingAgeByBirthYear;
    for (var i = 0; i < cohorts.length; i++) {
      if (birthYear <= cohorts[i].maxYear) return cohorts[i].age;
    }
    return cohorts[cohorts.length - 1].age;
  }

  function rmdDivisorForAge(age) {
    var table = RMD_CONFIG.lifeExpectancyDivisors;
    if (table[age] !== undefined) return table[age];
    var clamped = Math.max(72, Math.min(120, age));
    return table[clamped] !== undefined ? table[clamped] : 2.0;
  }

  document.querySelectorAll('[data-rmd-projector]').forEach(function (rmdCalc) {
    var rmdCurrencyWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    var rmdChartInstance = null;

    var birthYearEl = rmdCalc.querySelector('input[id^="rmd-birth-year"]');
    var balanceEl = rmdCalc.querySelector('input[id^="rmd-balance-2"]');
    var rateEl = rmdCalc.querySelector('input[id^="rmd-rate"]');
    var resultEl = rmdCalc.querySelector('[data-rmd-result]');
    var calcBtn = rmdCalc.querySelector('[data-rmd-calculate]');
    var resetBtn = rmdCalc.querySelector('[data-rmd-reset]');
    var tableBody = rmdCalc.querySelector('[data-rmd-table-body]');
    var chartCanvas = rmdCalc.querySelector('[data-rmd-chart]');

    function parseCurrencyInput(value) {
      var cleaned = String(value || '').replace(/[^0-9.\-]/g, '');
      var num = parseFloat(cleaned);
      return isNaN(num) ? NaN : num;
    }

    function formatBalanceField() {
      var num = parseCurrencyInput(balanceEl.value);
      if (!isNaN(num) && num >= 0) {
        balanceEl.value = rmdCurrencyWhole.format(num);
      }
    }
    if (balanceEl) {
      balanceEl.addEventListener('blur', formatBalanceField);
    }

    function setFieldError(fieldName, hasError) {
      var field = rmdCalc.querySelector('[data-rmd-field="' + fieldName + '"]');
      if (field) field.setAttribute('data-invalid', hasError ? 'true' : 'false');
    }

    function clearErrors() {
      ['birthYear', 'balance', 'rate'].forEach(function (f) { setFieldError(f, false); });
    }

    function themeColors() {
      var styles = getComputedStyle(document.documentElement);
      return {
        primary: styles.getPropertyValue('--color-primary').trim() || '#1f5c8c',
        warning: styles.getPropertyValue('--color-warning').trim() || '#8a4a1f',
        border: styles.getPropertyValue('--color-border').trim() || '#c9d6e2',
        text: styles.getPropertyValue('--color-text-muted').trim() || '#4b5d6f'
      };
    }

    function buildProjection(birthYear, balance, ratePercent) {
      var currentYear = new Date().getFullYear();
      var currentAge = currentYear - birthYear;
      var startAge = rmdStartingAge(birthYear);
      var rate = ratePercent / 100;
      var finalAge = RMD_CONFIG.finalProjectionAge;

      var rows = [];
      var firstRmd = null;
      var beginBalance = balance;
      var age = currentAge;
      var year = currentYear;

      while (age <= finalAge) {
        var isRmdYear = age >= startAge;
        var growth = beginBalance * rate;
        var rmdAmount = 0;
        if (isRmdYear) {
          var divisor = rmdDivisorForAge(age);
          rmdAmount = divisor > 0 ? beginBalance / divisor : 0;
        }
        var endBalance = beginBalance + growth - rmdAmount;
        if (endBalance < 0) endBalance = 0;

        rows.push({
          year: year, age: age, begin: beginBalance, growth: growth,
          rmd: rmdAmount, end: endBalance, isFirstRmdYear: false
        });

        if (isRmdYear && !firstRmd) {
          firstRmd = { year: year, age: age, amount: rmdAmount, balanceAtStart: beginBalance };
        }

        beginBalance = endBalance;
        age++; year++;
      }

      if (firstRmd) {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].year === firstRmd.year) { rows[i].isFirstRmdYear = true; break; }
        }
      }

      return { currentAge: currentAge, startAge: startAge, firstRmd: firstRmd, rows: rows };
    }

    function renderTable(rows) {
      var html = '';
      rows.forEach(function (r) {
        html += '<tr' + (r.isFirstRmdYear ? ' data-rmd-first-year="true"' : '') + '>' +
          '<td>' + r.year + '</td>' +
          '<td>' + r.age + '</td>' +
          '<td>' + rmdCurrencyWhole.format(r.begin) + '</td>' +
          '<td>' + rmdCurrencyWhole.format(r.growth) + '</td>' +
          '<td>' + (r.rmd > 0 ? rmdCurrencyWhole.format(r.rmd) : '&mdash;') + '</td>' +
          '<td>' + rmdCurrencyWhole.format(r.end) + '</td>' +
          '</tr>';
      });
      tableBody.innerHTML = html;
    }

    function renderChart(rows) {
      if (!window.Chart || !chartCanvas) return;
      var colors = themeColors();
      var labels = rows.map(function (r) { return r.age; });
      var balances = rows.map(function (r) { return Math.round(r.end); });
      var rmds = rows.map(function (r) { return Math.round(r.rmd); });

      if (rmdChartInstance) {
        rmdChartInstance.data.labels = labels;
        rmdChartInstance.data.datasets[0].data = balances;
        rmdChartInstance.data.datasets[1].data = rmds;
        rmdChartInstance.data.datasets[0].borderColor = colors.primary;
        rmdChartInstance.data.datasets[1].borderColor = colors.warning;
        rmdChartInstance.options.scales.x.ticks.color = colors.text;
        rmdChartInstance.options.scales.y.ticks.color = colors.text;
        rmdChartInstance.options.scales.x.grid.color = colors.border;
        rmdChartInstance.options.scales.y.grid.color = colors.border;
        rmdChartInstance.options.plugins.legend.labels.color = colors.text;
        rmdChartInstance.update();
        return;
      }

      rmdChartInstance = new window.Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Projected Account Balance',
              data: balances,
              borderColor: colors.primary,
              backgroundColor: 'transparent',
              tension: 0.25,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: 'y'
            },
            {
              label: 'Estimated Annual RMD',
              data: rmds,
              borderColor: colors.warning,
              backgroundColor: 'transparent',
              tension: 0.25,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'bottom', labels: { color: colors.text, boxWidth: 14 } },
            tooltip: {
              callbacks: {
                title: function (items) { return 'Age ' + items[0].label; },
                label: function (item) { return item.dataset.label + ': ' + rmdCurrencyWhole.format(item.parsed.y); }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Age', color: colors.text },
              ticks: { color: colors.text },
              grid: { color: colors.border }
            },
            y: {
              title: { display: true, text: 'Dollars', color: colors.text },
              ticks: {
                color: colors.text,
                callback: function (value) { return rmdCurrencyWhole.format(value); }
              },
              grid: { color: colors.border }
            }
          }
        }
      });
    }

    function showFormError(message) {
      var errorBanner = rmdCalc.querySelector('[data-rmd-form-error]');
      if (!errorBanner) {
        errorBanner = document.createElement('p');
        errorBanner.setAttribute('data-rmd-form-error', '');
        errorBanner.style.color = 'var(--color-error)';
        errorBanner.style.fontSize = 'var(--text-sm)';
        errorBanner.style.marginTop = 'var(--space-4)';
        rmdCalc.querySelector('.rmd-projector-actions').insertAdjacentElement('afterend', errorBanner);
      }
      errorBanner.textContent = message;
      errorBanner.hidden = !message;
    }

    if (calcBtn) {
      calcBtn.addEventListener('click', function () {
        clearErrors();
        showFormError('');

        var currentYear = new Date().getFullYear();
        var birthYear = Math.round(parseFloat(birthYearEl.value));
        var balance = parseCurrencyInput(balanceEl.value);
        var ratePercent = parseFloat(rateEl.value);

        var hasError = false;

        if (isNaN(birthYear) || birthYear < RMD_CONFIG.minBirthYear || birthYear > currentYear) {
          setFieldError('birthYear', true);
          hasError = true;
        } else {
          var age = currentYear - birthYear;
          if (age > RMD_CONFIG.finalProjectionAge) {
            setFieldError('birthYear', true);
            hasError = true;
            showFormError('Please enter a birth year that results in a current age of ' + RMD_CONFIG.finalProjectionAge + ' or younger, since this tool projects through age ' + RMD_CONFIG.finalProjectionAge + '.');
          }
        }

        if (isNaN(balance) || balance < 0) {
          setFieldError('balance', true);
          hasError = true;
        }

        if (isNaN(ratePercent) || ratePercent < RMD_CONFIG.minRatePercent || ratePercent > RMD_CONFIG.maxRatePercent) {
          setFieldError('rate', true);
          hasError = true;
        }

        if (hasError) {
          resultEl.hidden = true;
          return;
        }

        formatBalanceField();

        var projection = buildProjection(birthYear, balance, ratePercent);

        rmdCalc.querySelector('[data-rmd-out-current-age]').textContent = projection.currentAge;
        rmdCalc.querySelector('[data-rmd-out-start-age]').textContent = projection.startAge;

        if (projection.firstRmd) {
          rmdCalc.querySelector('[data-rmd-out-first-year]').textContent = projection.firstRmd.year;
          rmdCalc.querySelector('[data-rmd-out-balance-at-start]').textContent = rmdCurrencyWhole.format(projection.firstRmd.balanceAtStart);
          rmdCalc.querySelector('[data-rmd-out-first-amount]').textContent = rmdCurrencyWhole.format(projection.firstRmd.amount);
        } else {
          rmdCalc.querySelector('[data-rmd-out-first-year]').textContent = 'Beyond age ' + RMD_CONFIG.finalProjectionAge;
          rmdCalc.querySelector('[data-rmd-out-balance-at-start]').textContent = String.fromCharCode(8212);
          rmdCalc.querySelector('[data-rmd-out-first-amount]').textContent = String.fromCharCode(8212);
        }

        renderTable(projection.rows);
        renderChart(projection.rows);
        resultEl.hidden = false;
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        birthYearEl.value = '';
        balanceEl.value = '';
        rateEl.value = RMD_CONFIG.defaultRatePercent;
        clearErrors();
        showFormError('');
        resultEl.hidden = true;
        if (rmdChartInstance) {
          rmdChartInstance.destroy();
          rmdChartInstance = null;
        }
      });
    }

    // Keep chart colors in sync when the user toggles light/dark mode.
    var lastRows = null;
    var origRenderChart = renderChart;
    renderChart = function (rows) {
      lastRows = rows;
      origRenderChart(rows);
    };
    var themeObserver = new MutationObserver(function () {
      if (rmdChartInstance && lastRows) renderChart(lastRows);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  });

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

  /* ---------- Careers inquiry form ---------- */
  var careersForm = document.querySelector('[data-careers-form]');
  if (careersForm) {
    careersForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var fields = careersForm.querySelectorAll('[required]');
      fields.forEach(function (input) {
        var field = input.closest('.field');
        var invalid = !input.value.trim() || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
        if (field) field.setAttribute('data-invalid', String(invalid));
        if (invalid) valid = false;
      });
      if (!valid) {
        var firstInvalid = careersForm.querySelector('[data-invalid="true"] input, [data-invalid="true"] select, [data-invalid="true"] textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var name = careersForm.querySelector('#careers-name').value.trim();
      var email = careersForm.querySelector('#careers-email').value.trim();
      var phone = careersForm.querySelector('#careers-phone').value.trim();
      var interest = careersForm.querySelector('#careers-interest').value;
      var message = careersForm.querySelector('#careers-message').value.trim();

      var bodyLines = [
        'Name: ' + name,
        'Email: ' + email,
        'Phone: ' + (phone || 'Not provided'),
        "Interested in: " + interest,
        '',
        'Message:',
        message || 'Not provided'
      ];
      var subject = 'Careers Inquiry \u2014 ' + interest;
      var mailto = 'mailto:info@opulenceventuregroup.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));
      window.location.href = mailto;

      var success = document.querySelector('[data-careers-form-success]');
      careersForm.style.display = 'none';
      if (success) {
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    });
    careersForm.querySelectorAll('input, textarea, select').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.setAttribute('data-invalid', 'false');
      });
    });
  }
})();
