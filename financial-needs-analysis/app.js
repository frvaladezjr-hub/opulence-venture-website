(function () {
  'use strict';

  /* ---------- Constants ---------- */
  const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  const OWNERS = ['Client', 'Spouse', 'Joint'];
  const YN = ['Yes', 'No'];

  const money = (label, extra) => Object.assign({ type: 'money', label, num: true }, extra || {});
  const text = (label, extra) => Object.assign({ type: 'text', label }, extra || {});
  const sel = (label, options, extra) => Object.assign({ type: 'select', label, options }, extra || {});
  const pct = (label, extra) => Object.assign({ type: 'pct', label, num: true }, extra || {});

  const acct = (types, ph) => ({
    layout: 'stack', start: 1, add: 'Add account', empty: 'No accounts added.',
    cols: {
      name: text('Investment / asset name', { ph, span: 2 }),
      type: sel('Account type', types),
      owner: sel('Owner', OWNERS),
      balance: money('Balance ($)'),
      monthly: money('Monthly ($)')
    }, totals: ['balance', 'monthly']
  });

  const REP = {
    dependents: {
      layout: 'stack', grid: 'g3', start: 1, add: 'Add dependent', empty: 'No dependents added.', title: 'Dependent',
      cols: {
        firstName: text('First name'), lastName: text('Last name'),
        relationship: sel('Relationship', ['Son', 'Daughter', 'Stepchild', 'Grandchild', 'Parent', 'Other relative', 'Other']),
        sex: sel('Sex', ['M', 'F']), dob: { type: 'date', label: 'Date of birth' },
        age: { type: 'computed', label: 'Age', fn: r => { const a = ageFrom(r.dob); return a === '' ? '—' : String(a); } },
        livesHome: sel('Lives with client?', YN), special: sel('Special needs or care?', YN),
        notes: text('Notes (school, health, support)', { span: 1 })
      }
    },
    bank: acct(['Checking', 'Savings', 'Money market', 'CD', 'Other'], 'e.g. Chase savings'),
    mutualstocks: acct(['Brokerage', 'Mutual fund', 'Individual stocks', 'ETF', 'Bonds', 'Crypto', 'Other'], 'e.g. Schwab brokerage'),
    qualified: acct(['401(k)', '403(b)', '457(b)', 'TSP', 'SEP IRA', 'SIMPLE IRA', 'Pension', 'Other'], 'e.g. Employer 401(k)'),
    ira: acct(['Traditional IRA', 'Rollover IRA', 'Inherited IRA', 'Non-qualified annuity', 'Other'], 'e.g. Rollover IRA'),
    roth: acct(['Roth IRA', 'Roth 401(k)', 'Roth 403(b)', 'Other'], 'e.g. Roth IRA'),
    cvlife: acct(['Whole life', 'Indexed UL', 'Universal life', 'Variable UL', 'Other'], 'e.g. IUL policy'),
    incomeAssets: {
      layout: 'table', start: 1, add: 'Add income source', empty: 'No income sources added.',
      cols: {
        name: text('Asset name', { ph: 'e.g. Social Security' }),
        type: sel('Type', ['Social Security', 'Pension', 'Annuity', 'Rental income', 'Dividends / interest', 'Business income', 'Other']),
        owner: sel('Owner', OWNERS),
        balance: money('Balance ($)'), monthly: money('Monthly income ($)'),
        yearly: { type: 'computed', label: 'Yearly income ($)', num: true, fn: r => fmt$(num(r.monthly) * 12) },
        bracket: pct('Tax bracket (%)')
      }, totals: []
    },
    goalsShort: { layout: 'stack', start: 0, add: 'Add goal', empty: '', cols: { desc: text('Other goal', { span: 2 }), amount: money('Amount ($)'), year: text('Target year', { ph: 'e.g. 2027' }) } },
    goalsMid: { layout: 'stack', start: 0, add: 'Add goal', empty: '', cols: { desc: text('Other goal', { span: 2 }), amount: money('Amount ($)'), year: text('Target year', { ph: 'e.g. 2029' }) } },
    goalsLong: { layout: 'stack', start: 0, add: 'Add goal', empty: '', cols: { desc: text('Other goal', { span: 2 }), amount: money('Amount ($)'), year: text('Target year', { ph: 'e.g. 2040' }) } },
    realestate: {
      layout: 'table', start: 0, add: 'Add property', empty: 'No properties added.',
      cols: { desc: text('Asset description', { ph: 'e.g. 123 Main St' }), type: sel('Type', ['Primary residence', 'Rental', 'Vacation home', 'Land', 'Commercial', 'Other']), owner: sel('Owner', OWNERS), value: money('Market value ($)'), basis: money('Cost basis ($)') },
      totals: ['value', 'basis']
    },
    vehicles: {
      layout: 'table', start: 0, add: 'Add vehicle or boat', empty: 'No vehicles or boats added.',
      cols: { desc: text('Asset description', { ph: 'e.g. 2022 F-150' }), type: sel('Type', ['Car', 'Truck', 'SUV', 'Motorcycle', 'Boat', 'RV / trailer', 'Other']), owner: sel('Owner', OWNERS), value: money('Market value ($)'), basis: money('Cost basis ($)') },
      totals: ['value', 'basis']
    },
    collectibles: {
      layout: 'table', start: 0, add: 'Add item', empty: 'No collectibles added.',
      cols: { desc: text('Asset description'), type: sel('Type', ['Jewelry', 'Art', 'Antiques', 'Coins / precious metals', 'Other']), owner: sel('Owner', OWNERS), value: money('Market value ($)'), basis: money('Cost basis ($)') },
      totals: ['value', 'basis']
    },
    liabilities: {
      layout: 'table', start: 0, add: 'Add debt', empty: 'No debts added.',
      cols: {
        type: sel('Debt type', ['Mortgage', 'HELOC', 'Auto loan', 'Credit card', 'Student loan', 'Personal loan', 'Business loan', 'Medical', 'Other']),
        lender: text('Lender / description'), owner: sel('Owner', OWNERS),
        balance: money('Balance ($)'), rate: pct('Rate (%)'), payment: money('Monthly payment ($)')
      }, totals: ['balance', 'payment']
    },
    coverage: {
      layout: 'table', start: 0, add: 'Add policy', empty: 'No existing policies added.',
      cols: {
        insured: { type: 'select', label: 'Insured', options: () => ['Client', 'Spouse'].concat(depNames()) },
        carrier: text('Carrier'),
        type: sel('Policy type', ['Term', 'Whole life', 'Universal life', 'Indexed UL', 'Group / employer', 'Disability', 'Long-term care', 'Other']),
        face: money('Death benefit ($)'), premium: money('Monthly premium ($)')
      }, totals: ['face', 'premium']
    },
    education: {
      layout: 'table', start: 0, add: 'Add education goal', empty: 'No education goals added.',
      cols: {
        dependent: { type: 'select', label: 'Dependent', options: () => depNames().concat(['Client', 'Spouse', 'Other']) },
        goal: sel('Education goal', ['Trade / vocational', 'Community college', '4-year public (in-state)', '4-year public (out-of-state)', '4-year private', 'Graduate school', 'Private K–12']),
        years: { type: 'num', label: 'Years until start', num: true },
        cost: money('Estimated total cost ($)', { tl: 'Estimated Cost' }), saved: money('Saved so far ($)', { tl: 'Saved' }),
        vehicle: sel('Savings vehicle', ['529 plan', 'Coverdell ESA', 'UTMA / UGMA', 'Savings', 'Life insurance', 'None']),
        gap: { type: 'computed', label: 'Funding gap ($)', num: true, fn: r => fmt$(Math.max(0, num(r.cost) - num(r.saved))) }
      }, totals: ['cost', 'saved']
    }
  };

  const GOAL_PRESETS = {
    short: ['Build emergency fund', 'Pay off credit cards / debt', 'Vacation / travel', 'Purchase a vehicle', 'Home improvement'],
    mid: ['Buy a home', 'Start or grow a business', "Children's education", 'Wedding / major event', 'Pay off student loans'],
    long: ['Retirement income', 'Pay off mortgage', 'Leave a legacy', 'Long-term care planning', 'Charitable giving']
  };

  /* ---------- State ---------- */
  let S = blank();
  function blank() {
    const r = {};
    for (const k in REP) r[k] = Array.from({ length: REP[k].start }, () => newRow(k));
    return { f: {}, r };
  }
  function newRow(k) { const o = { id: Math.random().toString(36).slice(2, 9) }; for (const c in REP[k].cols) o[c] = ''; return o; }

  /* ---------- Utils ---------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function num(v) { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : 0; }
  function fmt$(n) { const neg = n < 0; return (neg ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'); }
  function fmtPct(n) { return (Math.round(n * 10) / 10) + '%'; }
  function ageFrom(dob) {
    if (!dob) return '';
    const d = new Date(dob + 'T00:00:00'); if (isNaN(d)) return '';
    const t = new Date(); let a = t.getFullYear() - d.getFullYear();
    if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
    return a >= 0 && a < 130 ? a : '';
  }
  function depNames() {
    return S.r.dependents.map((d, i) => (d.firstName || d.lastName) ? (d.firstName + ' ' + d.lastName).trim() : 'Dependent ' + (i + 1));
  }
  const F = n => S.f[n] || '';

  /* ---------- Field builders ---------- */
  function fieldWrap(name, label, inner, o) {
    o = o || {};
    return `<div class="field ${o.span ? 'span-' + o.span : ''}" ${o.show ? `data-show="${o.show}"` : ''}>
      <label for="f_${name}">${esc(label)}${o.req ? '<span class="req-star" aria-hidden="true">*</span>' : ''}</label>${inner}
      ${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ''}<span class="field-error" id="err_${name}" hidden></span></div>`;
  }
  function inp(name, label, o) {
    o = o || {};
    const type = o.type === 'money' || o.type === 'pct' ? 'text' : (o.type || 'text');
    const cls = o.type === 'money' ? 'money' : o.type === 'pct' ? 'pctin' : '';
    const im = o.type === 'money' || o.type === 'pct' || o.type === 'number' ? ' inputmode="decimal"' : (o.type === 'tel' ? ' inputmode="tel"' : '');
    const ph = o.ph != null ? o.ph : (o.type === 'money' ? '$0' : o.type === 'pct' ? '0%' : '');
    return fieldWrap(name, label, `<input id="f_${name}" type="${type}" class="${cls}" data-f="${name}"${im} placeholder="${esc(ph)}"${o.req ? ' aria-required="true"' : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.ro ? ' readonly' : ''}>`, o);
  }
  function selF(name, label, options, o) {
    const opts = ['<option value="">Select</option>'].concat(options.map(x => `<option>${esc(x)}</option>`)).join('');
    return fieldWrap(name, label, `<select id="f_${name}" data-f="${name}">${opts}</select>`, o);
  }
  function area(name, label, o) {
    return fieldWrap(name, label, `<textarea id="f_${name}" data-f="${name}" placeholder="${esc((o && o.ph) || '')}"></textarea>`, o);
  }
  function radios(name, label, options, o) {
    o = o || {};
    const ch = options.map(v => `<label class="choice"><input type="radio" name="${name}" value="${esc(v)}" data-f="${name}"><span>${esc(v)}</span></label>`).join('');
    return `<fieldset class="inline-q ${o.span ? 'span-' + o.span : ''}" id="f_${name}" ${o.show ? `data-show="${o.show}"` : ''}><legend>${esc(label)}${o.req ? '<span class="req-star" aria-hidden="true">*</span>' : ''}</legend><div class="choices">${ch}</div><span class="field-error" id="err_${name}" hidden></span></fieldset>`;
  }
  function repBlock(key) { return `<div class="rep" data-rep="${key}"></div>`; }
  function out(key, initial) { return `<b data-out="${key}">${initial || '$0'}</b>`; }

  /* ---------- Section templates ---------- */
  const SECTIONS = [
    { id: 'sec-a', letter: 'A', nav: 'General', title: 'General Information' },
    { id: 'sec-b', letter: 'B', nav: 'Retirement', title: '5 Retirement Questions' },
    { id: 'sec-c', letter: 'C', nav: 'Goals', title: 'Financial Goals' },
    { id: 'sec-d', letter: 'D', nav: 'Tax Buckets', title: 'Asset Accumulation (Tax Buckets)' },
    { id: 'sec-e', letter: 'E', nav: 'Estate & Protection', title: 'Asset Accumulation (Preserve Your Estate)' },
    { id: 'sec-f', letter: 'F', nav: 'Education', title: 'Education Funding' },
    { id: 'sec-g', letter: 'G', nav: 'Next Step', title: 'Bringing It All Together' }
  ];
  const secHead = s => `<div class="section-title"><span class="letter">${s.letter}</span><h2>${esc(s.title)}</h2></div>`;

  function personCard(p, who) {
    const isC = p === 'client';
    const r = isC;
    return `<div class="card" ${isC ? '' : 'data-show="hasSpouse:Yes"'} id="card_${p}">
      <div class="card-head"><h3>${who}${r ? ' <span class="req">*</span>' : ''}</h3></div>
      <div class="grid">
        ${inp(p + '.firstName', 'First Name', { req: true })}
        ${inp(p + '.middleInitial', 'Middle Initial', { ph: 'M.', max: 2 })}
        ${inp(p + '.lastName', 'Last Name', { req: true })}
        ${radios(p + '.sex', 'Sex', ['M', 'F'])}
        ${inp(p + '.dob', 'Date of Birth', { type: 'date' })}
        ${radios(p + '.tobacco', 'Do you currently use tobacco or nicotine products on a regular basis?', YN, { req: isC })}
        ${isC ? inp('client.homeAddr', 'Home Address') + inp('client.homeCity', 'City') + selF('client.homeState', 'State', STATES) + inp('client.homeZip', 'Zip', { type: 'text', max: 10 }) : ''}
        ${inp(p + '.cellPhone', 'Cell Phone', { type: 'tel', req: isC, ph: '(555) 555-5555' })}
        ${inp(p + '.email', 'Email', { type: 'email', req: isC, ph: 'name@email.com' })}
      </div>
      <div class="sub-head" style="margin-top:22px">Employment <small>Optional</small></div>
      <div class="grid four">
        ${selF(p + '.employment', 'Employment status', ['Employed', 'Self-employed / business owner', 'Retired', 'Not employed', 'Homemaker', 'Student'])}
        ${inp(p + '.employer', 'Employer / business')}
        ${inp(p + '.occupation', 'Occupation / title')}
        ${inp(p + '.income', 'Annual income', { type: 'money' })}
        ${inp(p + '.workPhone', 'Work phone', { type: 'tel' })}
        ${inp(p + '.workEmail', 'Work email', { type: 'email' })}
        ${selF(p + '.benefits', 'Employer retirement plan?', ['Yes', 'No', 'Not sure'])}
        ${selF(p + '.groupLife', 'Group life insurance at work?', ['Yes', 'No', 'Not sure'])}
      </div>
    </div>`;
  }

  function bucket(cls, title, desc, a, b) {
    const acc = (k, t) => `<div class="acct"><h4>${t}</h4>${repBlock(k)}</div>`;
    return `<div class="bucket ${cls}"><h3>${title}</h3><p>${desc}</p>${acc(a[0], a[1])}${acc(b[0], b[1])}
      <div class="bucket-totals"><div><span>Total Balance</span>${out(cls + '.bal')}</div><div><span>Total Monthly Contribution</span>${out(cls + '.mo')}</div></div></div>`;
  }

  function goalCol(h, key, title, sub) {
    const ph = 'Ideas: ' + GOAL_PRESETS[h].join(', ') + '…';
    return `<div class="goal-col"><h3>${title}</h3><p class="card-sub">${sub}</p>
      <textarea class="goal-notes" id="f_goals.notes.${h}" data-f="goals.notes.${h}" aria-label="${esc(title)} goal notes" placeholder="${esc(ph)}"></textarea></div>`;
  }


  function buildForm() {
    const s = SECTIONS;
    const html = `
    <section class="section" id="${s[0].id}">${secHead(s[0])}
      <div class="question-row">${radios('hasSpouse', 'Does the client have a spouse/partner?', YN)}
        ${selF('marital', 'Marital status', ['Married', 'Domestic partner', 'Single', 'Divorced', 'Widowed', 'Separated'])}</div>
      ${personCard('client', 'Client')}
      ${personCard('spouse', 'Spouse / Partner')}
      <div class="card">
        ${radios('hasDependents', 'Any dependents?', YN)}
        <div data-show="hasDependents:Yes" style="margin-top:16px">
          <p class="card-sub" style="margin-bottom:12px">Add each child or other person who relies on the client financially. Names added here appear in the education and insurance dropdowns.</p>
          ${repBlock('dependents')}
        </div>
      </div>
    </section>

    <section class="section" id="${s[1].id}">${secHead(s[1])}
      <div class="card tint">
        <h3 style="margin-bottom:16px">Your Retirement Vision</h3>
        <div class="field" style="margin-bottom:18px"><span class="label">1. What is your current age and what age would you like to retire?</span>
          <div class="grid four" style="margin-top:4px">
            ${inp('ret.currentAge', 'Current age', { type: 'number', ph: '', hint: 'Fills in from date of birth' })}
            ${inp('ret.retireAge', 'Retire at age', { type: 'number', ph: '' })}
            <div class="field"><span class="label">Years until retirement</span><input type="text" readonly data-outv="ret.years" value="—" aria-label="Years until retirement"></div>
          </div></div>
        <div class="grid two" style="margin-bottom:18px">
          ${inp('ret.savings', '2. How much money would you need to have saved up to retire on your terms?', { type: 'money', span: 'all' })}
          ${inp('ret.monthly', '3. What would you need as a monthly income to be able to retire comfortably?', { type: 'money', span: 'all' })}
        </div>
        ${area('ret.picture', '', { ph: 'Travel, family, hobbies, where they live, how they spend a typical week…' })}
        <div class="final-q">
          <h3>Final Question</h3>
          <p class="script">If we could put a plan in place that would allow you to retire at age <span class="fill" data-fill="age">______</span> with <span class="fill" data-fill="savings">______</span> saved up, and it paid you <span class="fill" data-fill="yearly">______</span> in income every year in retirement, and it also allowed you to accomplish all the goals we discussed, is there any reason why you wouldn't let our Firm implement that for you for FREE?</p>
          <p class="hint" style="margin:8px 0 16px">The bracketed values above fill in automatically from your answers to questions 1–3. Leave any blank to see “______”.</p>
          ${radios('ret.reason', 'Any reason not to move forward?', YN)}
          <div class="reveal" data-show="ret.reason:Yes" style="margin-top:14px">${area('ret.reasonWhy', 'What would keep you from moving forward?')}</div>
        </div>
      </div>
    </section>

    <section class="section" id="${s[2].id}">${secHead(s[2])}
      <p class="section-intro">Write down the client’s goals in their own words — what they want, rough amounts and when.</p>
      <div class="goal-cols">
        ${goalCol('short', 'goalsShort', 'Short-term', 'Within the next 1–2 years')}
        ${goalCol('mid', 'goalsMid', 'Mid-term', '3–5 years from now')}
        ${goalCol('long', 'goalsLong', 'Long-term', '5+ years from now')}
      </div>
      <div class="card" style="margin-top:16px"><div class="grid">
        ${inp('goals.doingToday', 'What are you doing today to reach it?', { span: 2 })}
        ${inp('goals.monthly', 'Monthly amount you could set aside', { type: 'money' })}
      </div></div>
    </section>

    <section class="section" id="${s[3].id}">${secHead(s[3])}
      <div class="buckets">
        ${bucket('taxable', 'Taxable', 'Assets are generally positioned for current or short-term needs that can best be served with highly liquid investment instruments.', ['bank', 'Bank Savings/CDs'], ['mutualstocks', 'Mutual Funds / Stocks'])}
        ${bucket('deferred', 'Tax Deferred', 'Assets are for long-term needs. Invested in less-liquid investments where any growth or interest is ultimately taxable at distribution.', ['qualified', '401(k) or qualified plans'], ['ira', 'IRA or non qualified plans'])}
        ${bucket('exempt', 'Tax Exempt', 'Assets are positioned for the future since they receive preferential tax treatment during accumulation and at distribution.', ['roth', 'Roth IRA'], ['cvlife', 'Cash Value Life Insurance'])}
      </div>
      <div class="stats-wrap">
        <div class="stats">
          <div class="stat"><div class="k">Total Balance</div><div class="v" data-out="inv.bal">$0</div></div>
          <div class="stat"><div class="k">Total Monthly Contributions</div><div class="v" data-out="inv.mo">$0</div></div>
          <div class="stat"><div class="k"><i class="legend-dot mix-taxable"></i>Taxable</div><div class="v" data-out="pct.taxable">0%</div></div>
          <div class="stat"><div class="k"><i class="legend-dot mix-deferred"></i>Tax Deferred</div><div class="v" data-out="pct.deferred">0%</div></div>
          <div class="stat"><div class="k"><i class="legend-dot mix-exempt"></i>Tax Exempt</div><div class="v" data-out="pct.exempt">0%</div></div>
        </div>
        <div class="mixbar" aria-hidden="true"><i class="mix-taxable" data-bar="taxable" style="width:0"></i><i class="mix-deferred" data-bar="deferred" style="width:0"></i><i class="mix-exempt" data-bar="exempt" style="width:0"></i></div>
      </div>
      <div class="card tint">
        <h3>Income Assets</h3>
        <p class="card-sub" style="margin-bottom:14px">Add each income-producing asset. Yearly income is calculated automatically as monthly × 12. Net income is calculated after applying the tax bracket (net = income × (1 − bracket%)).</p>
        ${repBlock('incomeAssets')}
      </div>
      <p class="disclaimer">Please note the following: Certain events and distributions may be subject to taxation and individuals would be responsible for the appropriate liability. This piece provides general information regarding the Internal Revenue Code and does not take into consideration specific state laws. Opulence Venture Group does not provide tax advice and strongly recommends that clients consult a tax advisor concerning any tax issues relating to their investments.</p>
    </section>

    <section class="section" id="${s[4].id}">${secHead(s[4])}
      <div class="card">
        <div class="question-row">
          <div>${radios('est.will', 'Do you have a Will?', YN)}<div class="reveal" data-show="est.will:Yes" style="margin-top:10px">${inp('est.willDate', 'Year last updated', { type: 'text', ph: 'e.g. 2019', max: 4 })}</div></div>
          <div>${radios('est.trust', 'Do you have a Trust?', YN)}<div class="reveal" data-show="est.trust:Yes" style="margin-top:10px"><div class="grid two">${selF('est.trustType', 'Trust type', ['Revocable living trust', 'Irrevocable trust', 'Testamentary trust', 'Special needs trust', 'ILIT', 'Not sure'])}${inp('est.trustYear', 'Year last updated', { ph: 'e.g. 2021', max: 4 })}</div></div></div>
          <div>${radios('est.lump', 'Do you expect any lump sums or inheritance in the near future?', YN)}<div class="reveal" data-show="est.lump:Yes" style="margin-top:10px"><div class="grid two">${inp('est.lumpAmt', 'Estimated amount', { type: 'money' })}${inp('est.lumpNotes', 'Source / timing')}</div></div></div>
          <div>${radios('est.poa', 'Do you have a power of attorney and healthcare directive?', ['Yes', 'No', 'Not sure'])}</div>
        </div>
      </div>
      <div class="card"><div class="sub-head">Real Estate Owned Free &amp; Clear</div>${repBlock('realestate')}</div>
      <div class="card"><div class="sub-head">Vehicles and Boats Owned Free and Clear</div>${repBlock('vehicles')}</div>
      <div class="card"><div class="sub-head">Collectibles, Antiques, Jewelry, etc.</div>${repBlock('collectibles')}</div>
      <div class="card"><div class="sub-head">Debts &amp; Liabilities <small>Mortgages, loans and credit cards</small></div>${repBlock('liabilities')}</div>
      <div class="card"><div class="sub-head">Existing Insurance Coverage <small>Life, disability and long-term care policies already in force</small></div>${repBlock('coverage')}</div>
    </section>

    <section class="section" id="${s[5].id}">${secHead(s[5])}
      <p class="section-intro">List each education goal. Choose the dependent from the dropdown; names come from Section A.</p>
      <div class="card">${repBlock('education')}</div>
    </section>

    <section class="section" id="${s[6].id}">${secHead(s[6])}
      <div class="snapshot">
        <div class="snap primary"><div class="k">Estimated net worth</div><div class="v" data-out="snap.net">$0</div><div class="s">All assets minus debts</div></div>
        <div class="snap"><div class="k">Investable assets</div><div class="v" data-out="snap.inv">$0</div><div class="s">All three tax buckets</div></div>
        <div class="snap"><div class="k">Total debts</div><div class="v" data-out="snap.debt">$0</div><div class="s" data-out="snap.debtPay">$0 / month in payments</div></div>
        <div class="snap"><div class="k">Retirement income gap</div><div class="v" data-out="snap.gap">$0</div><div class="s">Monthly goal minus net income assets</div></div>
        <div class="snap"><div class="k">Existing life coverage</div><div class="v" data-out="snap.cov">$0</div><div class="s" data-out="snap.covCount">0 policies</div></div>
        <div class="snap"><div class="k">Education funding gap</div><div class="v" data-out="snap.edu">$0</div><div class="s">Estimated cost minus saved</div></div>
      </div>
      <div class="card">
        <h3>Your Next Step</h3>
        <p style="margin:12px 0 6px">The next step is for us to sit down, go over what we found, and walk you through the options that make the most sense for you.</p>
        <p style="margin-bottom:16px">When would you like to schedule that follow-up?</p>
        <div class="grid">
          ${inp('next.time1', 'Preferred day / time', { type: 'datetime-local' })}
          ${inp('next.time2', 'Backup day / time', { type: 'datetime-local' })}
          ${selF('next.format', 'Meeting format', ['In person', 'Zoom / video', 'Phone'])}
          ${inp('next.agent', 'Agent name')}
          ${inp('next.agentEmail', 'Agent email', { type: 'email' })}
          ${area('next.notes', 'Agent notes', { span: 2, ph: 'Key concerns, follow-up items, documents to request…' })}
        </div>
      </div>
      <div class="submit-row"><button class="btn btn-primary" type="button" data-review>Review &amp; Submit ✓</button></div>
    </section>`;
    $('#form').innerHTML = html;
    // Q4 label with live age
    const q4 = $('label[for="f_ret.picture"]');
    q4.innerHTML = '4. If you retired at age <span data-fill="age4">______</span>, what would you want your retirement to look like? Paint that picture for me.';
    $('#sectionNav').innerHTML = SECTIONS.map(x => `<a href="#${x.id}" data-nav="${x.id}">${x.letter} · ${esc(x.nav)}</a>`).join('');
  }

  /* ---------- Repeaters ---------- */
  function cellInput(key, i, c, col, row) {
    const v = row[c] == null ? '' : row[c];
    const aria = `aria-label="${esc(col.label)} ${i + 1}"`;
    const da = `data-r="${key}" data-i="${i}" data-c="${c}"`;
    if (col.type === 'computed') return `<input type="text" readonly tabindex="-1" data-comp="${key}.${i}.${c}" value="${esc(col.fn(row))}" ${aria}>`;
    if (col.type === 'select') {
      const opts = typeof col.options === 'function' ? col.options() : col.options;
      const list = opts.slice(); if (v && list.indexOf(v) < 0) list.push(v);
      return `<select ${da} ${aria}><option value="">Select</option>${list.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    }
    if (col.type === 'date') return `<input type="date" ${da} ${aria} value="${esc(v)}">`;
    const cls = col.type === 'money' ? 'money' : col.type === 'pct' ? 'pctin' : '';
    const ph = col.ph || (col.type === 'money' ? '$0' : col.type === 'pct' ? '0%' : '');
    const im = col.num ? ' inputmode="decimal"' : '';
    return `<input type="text" class="${cls}" ${da} ${aria}${im} placeholder="${esc(ph)}" value="${esc(v)}">`;
  }

  function renderRep(key) {
    const box = $(`[data-rep="${key}"]`); if (!box) return;
    const cfg = REP[key], rows = S.r[key], cols = Object.entries(cfg.cols);
    let body = '';
    if (cfg.layout === 'table') {
      const head = cols.map(([, c]) => `<th class="${c.num ? 'num' : ''}">${esc(c.label)}</th>`).join('') + '<th><span class="sr-only">Remove</span></th>';
      const tr = rows.map((r, i) => `<tr>${cols.map(([k, c]) => `<td class="${c.num ? 'num' : ''}" data-label="${esc(c.label)}">${cellInput(key, i, k, c, r)}</td>`).join('')}
        <td class="del"><button type="button" class="icon-btn" data-del="${key}" data-i="${i}" aria-label="Remove row ${i + 1}">×</button></td></tr>`).join('');
      body = rows.length ? `<div class="table-scroll"><table class="rep-table"><thead><tr>${head}</tr></thead><tbody>${tr}</tbody></table></div>` : (cfg.empty ? `<div class="rep-empty">${cfg.empty}</div>` : '');
    } else {
      body = rows.map((r, i) => `<div class="stack-row ${cfg.grid || ''}">
        ${cfg.title ? `<div class="stack-head"><h4>${cfg.title} ${i + 1}</h4></div>` : ''}
        <button type="button" class="icon-btn stack-del" data-del="${key}" data-i="${i}" aria-label="Remove ${cfg.title ? cfg.title.toLowerCase() : 'row'} ${i + 1}">×</button>
        <div class="stack-grid">${cols.map(([k, c]) => `<label class="stack-field ${c.span === 2 ? 'wide' : ''}"><span>${esc(c.label)}</span>${cellInput(key, i, k, c, r)}</label>`).join('')}</div></div>`).join('')
        || (cfg.empty ? `<div class="rep-empty">${cfg.empty}</div>` : '');
    }
    const tot = (cfg.totals || []).map(t => `<span>Total ${esc(cfg.cols[t].tl || cfg.cols[t].label.replace(/ \(\$\)/, ''))}: ${out(`rep.${key}.${t}`)}</span>`).join('');
    const extra = key === 'incomeAssets' ? `<span>Total Net Monthly Income: ${out('inc.netMo')}</span><span>Total Net Yearly Income: ${out('inc.netYr')}</span>`
      : key === 'education' ? `<span>Total Funding Gap: ${out('edu.gap')}</span>` : '';
    const showTotals = cfg.layout === 'table' || key === 'dependents' ? (tot || extra) : '';
    box.innerHTML = body + `<div class="rep-foot"><button type="button" class="btn-add" data-add="${key}"><span aria-hidden="true">+</span> ${esc(cfg.add)}</button>${showTotals ? `<div class="rep-totals">${tot}${extra}</div>` : ''}</div>`;
  }
  const renderAllReps = () => Object.keys(REP).forEach(renderRep);

  /* ---------- Compute ---------- */
  function sum(key, col) { return S.r[key].reduce((a, r) => a + num(r[col]), 0); }
  function compute() {
    const c = {};
    const b = { taxable: ['bank', 'mutualstocks'], deferred: ['qualified', 'ira'], exempt: ['roth', 'cvlife'] };
    let tb = 0, tm = 0;
    for (const k in b) {
      c[k + '.bal'] = b[k].reduce((a, x) => a + sum(x, 'balance'), 0);
      c[k + '.mo'] = b[k].reduce((a, x) => a + sum(x, 'monthly'), 0);
      tb += c[k + '.bal']; tm += c[k + '.mo'];
    }
    c['inv.bal'] = tb; c['inv.mo'] = tm;
    for (const k in b) c['pct.' + k] = tb ? c[k + '.bal'] / tb * 100 : 0;
    let netMo = 0;
    S.r.incomeAssets.forEach(r => { netMo += num(r.monthly) * (1 - Math.min(100, num(r.bracket)) / 100); });
    c['inc.netMo'] = netMo; c['inc.netYr'] = netMo * 12;
    c['inc.balance'] = sum('incomeAssets', 'balance');
    for (const k in REP) (REP[k].totals || []).forEach(t => { c[`rep.${k}.${t}`] = sum(k, t); });
    c['edu.gap'] = S.r.education.reduce((a, r) => a + Math.max(0, num(r.cost) - num(r.saved)), 0);
    const physical = sum('realestate', 'value') + sum('vehicles', 'value') + sum('collectibles', 'value');
    c['snap.inv'] = tb;
    c['snap.debt'] = sum('liabilities', 'balance');
    c['snap.debtPay'] = sum('liabilities', 'payment');
    c['snap.net'] = tb + c['inc.balance'] + physical - c['snap.debt'];
    c['snap.assets'] = tb + c['inc.balance'] + physical;
    c['snap.gap'] = Math.max(0, num(F('ret.monthly')) - netMo);
    const life = S.r.coverage.filter(r => !/Disability|Long-term/.test(r.type));
    c['snap.cov'] = life.reduce((a, r) => a + num(r.face), 0);
    c['snap.covCount'] = S.r.coverage.length;
    c['snap.edu'] = c['edu.gap'];
    const ca = num(F('ret.currentAge')), ra = num(F('ret.retireAge'));
    c['ret.years'] = F('ret.currentAge') && F('ret.retireAge') ? Math.max(0, ra - ca) : null;
    return c;
  }

  function paint() {
    const c = compute();
    $$('[data-out]').forEach(el => {
      const k = el.dataset.out; let v = c[k];
      if (k.startsWith('pct.')) el.textContent = fmtPct(v || 0);
      else if (k === 'snap.debtPay') el.textContent = fmt$(v) + ' / month in payments';
      else if (k === 'snap.covCount') el.textContent = v + (v === 1 ? ' policy' : ' policies') + ' on file';
      else el.textContent = fmt$(v || 0);
    });
    ['taxable', 'deferred', 'exempt'].forEach(k => { const el = $(`[data-bar="${k}"]`); if (el) el.style.width = (c['pct.' + k] || 0) + '%'; });
    const yrs = $('[data-outv="ret.years"]'); if (yrs) yrs.value = c['ret.years'] == null ? '—' : c['ret.years'] + ' years';
    const age = F('ret.retireAge'), sav = num(F('ret.savings')), mo = num(F('ret.monthly'));
    const fills = { age: age || '______', age4: age || '______', savings: sav ? fmt$(sav) : '______', yearly: mo ? fmt$(mo * 12) : '______' };
    $$('[data-fill]').forEach(el => { el.textContent = fills[el.dataset.fill]; });
    // conditional sections
    $$('[data-show]').forEach(el => { const [n, v] = el.dataset.show.split(':'); el.hidden = F(n) !== v; });
    // goal amount enable
    $$('input[type=checkbox][data-f^="goal."]').forEach(cb => { const a = $(`[data-f="${cb.dataset.f}.amt"]`); if (a) a.disabled = !cb.checked; });
    // computed cells
    $$('[data-comp]').forEach(el => { const [k, i, col] = el.dataset.comp.split('.'); const r = S.r[k][+i]; if (r) el.value = REP[k].cols[col].fn(r); });
    ['snap.net', 'snap.gap'].forEach(k => { const el = $(`[data-out="${k}"]`); if (el) el.classList.toggle('neg', k === 'snap.net' && c[k] < 0); });
  }

  /* ---------- Persistence (in-memory; use data file to keep a copy) ---------- */
  let dirty = false;
  function save() { dirty = true; const st = $('#saveStatus'); if (st) st.textContent = 'Unsaved changes'; }
  function importData(obj) {
    const d = obj && obj.data ? obj.data : obj;
    if (!d || !d.f || !d.r) throw new Error('bad');
    S = blank(); S.f = d.f; for (const k in REP) if (Array.isArray(d.r[k])) S.r[k] = d.r[k];
    buildForm(); hydrateFields(); renderAllReps(); paint(); navObserver();
    $$('[data-f].money,[data-f].pctin').forEach(fmtField);
  }
  function hydrateFields() {
    $$('[data-f]').forEach(el => {
      const v = S.f[el.dataset.f] || '';
      if (el.type === 'radio') el.checked = el.value === v;
      else if (el.type === 'checkbox') el.checked = v === 'Yes';
      else el.value = v;
    });
  }

  /* ---------- Events ---------- */
  function fmtField(el) {
    if (el.classList.contains('money')) { const raw = String(el.value).trim(); el.value = raw === '' ? '' : fmt$(num(raw)); }
    else if (el.classList.contains('pctin')) { const raw = String(el.value).trim(); el.value = raw === '' ? '' : (Math.min(100, num(raw))) + '%'; }
  }
  function onInput(e) {
    const el = e.target;
    if (el.dataset.f) {
      const n = el.dataset.f;
      if (el.type === 'checkbox') S.f[n] = el.checked ? 'Yes' : '';
      else if (el.type === 'radio') { if (el.checked) S.f[n] = el.value; }
      else S.f[n] = el.value;
      if (n === 'client.dob') {
        const a = ageFrom(el.value);
        if (a !== '' && (!S.f['ret.currentAge'] || S.f._ageAuto)) { S.f['ret.currentAge'] = String(a); S.f._ageAuto = true; const ca = $('[data-f="ret.currentAge"]'); if (ca) ca.value = a; }
      }
      if (n === 'ret.currentAge') S.f._ageAuto = false;
      if (n === 'hasSpouse' && el.value === 'Yes' && !S.f.marital) { S.f.marital = 'Married'; $('[data-f="marital"]').value = 'Married'; }
      if (n === 'hasDependents' && el.value === 'Yes' && !S.r.dependents.length) { S.r.dependents.push(newRow('dependents')); renderRep('dependents'); }
      clearErr(n);
    } else if (el.dataset.r) {
      const { r: key, i, c } = el.dataset; const row = S.r[key][+i]; if (!row) return;
      row[c] = el.value;
      if (key === 'dependents' && e.type === 'change' && (c === 'firstName' || c === 'lastName')) { renderRep('education'); renderRep('coverage'); }
    } else return;
    paint(); save();
  }
  function onClick(e) {
    const add = e.target.closest('[data-add]'), del = e.target.closest('[data-del]');
    if (add) {
      const k = add.dataset.add; S.r[k].push(newRow(k)); renderRep(k);
      const last = $$(`[data-r="${k}"][data-i="${S.r[k].length - 1}"]`)[0]; if (last) last.focus();
      afterRepChange(k);
    } else if (del) {
      const k = del.dataset.del; S.r[k].splice(+del.dataset.i, 1); renderRep(k);
      const btn = $(`[data-add="${k}"]`); if (btn) btn.focus();
      afterRepChange(k);
    } else if (e.target.closest('[data-review]')) openReview();
    else if (e.target.closest('[data-close]')) closeModals();
  }
  function afterRepChange(k) { if (k === 'dependents') { renderRep('education'); renderRep('coverage'); } paint(); save(); }

  /* ---------- Validation ---------- */
  const REQUIRED = [
    ['client.firstName', 'Client first name'], ['client.lastName', 'Client last name'],
    ['client.tobacco', 'Client tobacco / nicotine use'], ['client.cellPhone', 'Client cell phone'], ['client.email', 'Client email']
  ];
  function validate() {
    const errs = [];
    REQUIRED.forEach(([n, l]) => { if (!F(n).trim()) errs.push([n, l + ' is required']); });
    if (F('client.email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F('client.email'))) errs.push(['client.email', 'Client email doesn’t look valid']);
    if (F('next.agentEmail') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F('next.agentEmail'))) errs.push(['next.agentEmail', 'Agent email doesn’t look valid']);
    if (F('hasSpouse') === 'Yes') { if (!F('spouse.firstName').trim()) errs.push(['spouse.firstName', 'Spouse first name is required']); if (!F('spouse.lastName').trim()) errs.push(['spouse.lastName', 'Spouse last name is required']); }
    const ca = num(F('ret.currentAge')), ra = num(F('ret.retireAge'));
    if (F('ret.currentAge') && F('ret.retireAge') && ra < ca) errs.push(['ret.retireAge', 'Retirement age is lower than current age']);
    $$('.field-error').forEach(x => { x.hidden = true; });
    $$('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
    errs.forEach(([n, m]) => {
      const er = $(`#err_${CSS.escape(n)}`); if (er) { er.textContent = m; er.hidden = false; }
      const el = $(`#f_${CSS.escape(n)}`); if (el) el.setAttribute('aria-invalid', 'true');
    });
    return errs;
  }
  function clearErr(n) { const er = document.getElementById('err_' + n); if (er) er.hidden = true; const el = document.getElementById('f_' + n); if (el) el.removeAttribute('aria-invalid'); }

  /* ---------- Summary model ---------- */
  function kvRows(pairs) { return pairs.filter(([, v]) => v !== '' && v != null && v !== '$0' && v !== '—'); }
  function repTable(key, title) {
    const rows = S.r[key].filter(r => Object.keys(REP[key].cols).some(c => REP[key].cols[c].type !== 'computed' && String(r[c] || '').trim()));
    if (!rows.length) return null;
    const cols = Object.entries(REP[key].cols);
    return { title, head: cols.map(([, c]) => c.label), body: rows.map(r => cols.map(([k, c]) => c.type === 'computed' ? c.fn(r) : c.type === 'money' ? (r[k] ? fmt$(num(r[k])) : '') : (r[k] || ''))) };
  }
  function person(p) {
    const name = [F(p + '.firstName'), F(p + '.middleInitial'), F(p + '.lastName')].filter(Boolean).join(' ');
    return kvRows([['Name', name], ['Sex', F(p + '.sex')], ['Date of birth', F(p + '.dob') ? new Date(F(p + '.dob') + 'T00:00:00').toLocaleDateString() + ' (age ' + ageFrom(F(p + '.dob')) + ')' : ''],
      ['Tobacco / nicotine', F(p + '.tobacco')],
      ['Home address', p === 'client' ? [F('client.homeAddr'), F('client.homeCity'), [F('client.homeState'), F('client.homeZip')].filter(Boolean).join(' ')].filter(Boolean).join(', ') : ''],
      ['Cell phone', F(p + '.cellPhone')], ['Email', F(p + '.email')], ['Employment', F(p + '.employment')], ['Employer', F(p + '.employer')], ['Occupation', F(p + '.occupation')],
      ['Annual income', F(p + '.income') ? fmt$(num(F(p + '.income'))) : ''], ['Work phone', F(p + '.workPhone')], ['Work email', F(p + '.workEmail')],
      ['Employer retirement plan', F(p + '.benefits')], ['Group life at work', F(p + '.groupLife')]]);
  }
  function fmtDT(v) { if (!v) return ''; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  function summary() {
    const c = compute(), out = [];
    const A = { title: 'A — General Information', groups: [] };
    A.groups.push({ sub: 'Household', kv: kvRows([['Spouse / partner', F('hasSpouse')], ['Marital status', F('marital')], ['Dependents', F('hasDependents')]]) });
    A.groups.push({ sub: 'Client', kv: person('client') });
    if (F('hasSpouse') === 'Yes') A.groups.push({ sub: 'Spouse / Partner', kv: person('spouse') });
    if (F('hasDependents') === 'Yes') { const t = repTable('dependents', 'Dependents'); if (t) A.groups.push({ table: t }); }
    out.push(A);
    out.push({ title: 'B — Retirement Questions', groups: [{ kv: kvRows([['Current age', F('ret.currentAge')], ['Retire at age', F('ret.retireAge')], ['Years until retirement', c['ret.years'] == null ? '' : String(c['ret.years'])],
      ['Savings needed to retire', F('ret.savings') ? fmt$(num(F('ret.savings'))) : ''], ['Monthly income needed', F('ret.monthly') ? fmt$(num(F('ret.monthly'))) : ''],
      ['Yearly income needed', F('ret.monthly') ? fmt$(num(F('ret.monthly')) * 12) : ''], ['Retirement picture', F('ret.picture')],
      ['Any reason not to move forward?', F('ret.reason')], ['Reason', F('ret.reasonWhy')]]) }] });
    const G = { title: 'C — Financial Goals', groups: [] };
    G.groups.push({ kv: kvRows([['Short-term (1–2 years)', F('goals.notes.short')], ['Mid-term (3–5 years)', F('goals.notes.mid')], ['Long-term (5+ years)', F('goals.notes.long')]]) });
    G.groups.push({ kv: kvRows([['Doing today', F('goals.doingToday')], ['Monthly set-aside', F('goals.monthly') ? fmt$(num(F('goals.monthly'))) : '']]) });
    out.push(G);
    const D = { title: 'D — Asset Accumulation (Tax Buckets)', groups: [] };
    [['bank', 'Taxable — Bank Savings/CDs'], ['mutualstocks', 'Taxable — Mutual Funds / Stocks'], ['qualified', 'Tax Deferred — 401(k) or qualified plans'], ['ira', 'Tax Deferred — IRA or non qualified plans'], ['roth', 'Tax Exempt — Roth IRA'], ['cvlife', 'Tax Exempt — Cash Value Life Insurance']]
      .forEach(([k, t]) => { const tb = repTable(k, t); if (tb) D.groups.push({ table: tb }); });
    D.groups.push({ kv: [['Taxable', fmt$(c['taxable.bal']) + ' (' + fmtPct(c['pct.taxable']) + ')'], ['Tax deferred', fmt$(c['deferred.bal']) + ' (' + fmtPct(c['pct.deferred']) + ')'], ['Tax exempt', fmt$(c['exempt.bal']) + ' (' + fmtPct(c['pct.exempt']) + ')'], ['Total balance', fmt$(c['inv.bal'])], ['Total monthly contributions', fmt$(c['inv.mo'])]] });
    const ia = repTable('incomeAssets', 'Income Assets'); if (ia) { D.groups.push({ table: ia }); D.groups.push({ kv: [['Total net monthly income', fmt$(c['inc.netMo'])], ['Total net yearly income', fmt$(c['inc.netYr'])]] }); }
    out.push(D);
    const E = { title: 'E — Preserve Your Estate', groups: [{ kv: kvRows([['Will', F('est.will')], ['Will last updated', F('est.willDate')], ['Trust', F('est.trust')], ['Trust type', F('est.trustType')], ['Trust last updated', F('est.trustYear')],
      ['Expects lump sum / inheritance', F('est.lump')], ['Estimated amount', F('est.lumpAmt') ? fmt$(num(F('est.lumpAmt'))) : ''], ['Source / timing', F('est.lumpNotes')], ['POA & healthcare directive', F('est.poa')]]) }] };
    [['realestate', 'Real Estate Owned Free & Clear'], ['vehicles', 'Vehicles and Boats Owned Free and Clear'], ['collectibles', 'Collectibles, Antiques, Jewelry, etc.'], ['liabilities', 'Debts & Liabilities'], ['coverage', 'Existing Insurance Coverage']]
      .forEach(([k, t]) => { const tb = repTable(k, t); if (tb) E.groups.push({ table: tb }); });
    out.push(E);
    const ed = repTable('education', 'Education goals');
    out.push({ title: 'F — Education Funding', groups: ed ? [{ table: ed }, { kv: [['Total funding gap', fmt$(c['edu.gap'])]] }] : [{ kv: [] }] });
    out.push({ title: 'G — Bringing It All Together', groups: [{ kv: [['Estimated net worth', fmt$(c['snap.net'])], ['Investable assets', fmt$(c['snap.inv'])], ['Total debts', fmt$(c['snap.debt'])], ['Monthly retirement income gap', fmt$(c['snap.gap'])], ['Existing life coverage', fmt$(c['snap.cov'])], ['Education funding gap', fmt$(c['snap.edu'])]] },
      { kv: kvRows([['Preferred day / time', fmtDT(F('next.time1'))], ['Backup day / time', fmtDT(F('next.time2'))], ['Meeting format', F('next.format')], ['Agent', F('next.agent')], ['Agent email', F('next.agentEmail')], ['Agent notes', F('next.notes')]]) }] });
    return out;
  }

  /* ---------- Review modal ---------- */
  let lastFocus;
  function openReview() {
    const errs = validate();
    const secs = summary();
    let h = '';
    if (errs.length) h += `<div class="rv-errors"><strong>A few required items are missing.</strong> Fix these before submitting:<ul>${errs.map(([n, m]) => `<li><a href="#f_${esc(n)}" data-jump="${esc(n)}">${esc(m)}</a></li>`).join('')}</ul></div>`;
    secs.forEach(s => {
      const inner = s.groups.map(g => {
        if (g.table) return `<h4>${esc(g.table.title)}</h4><div class="table-scroll"><table class="rv-table"><thead><tr>${g.table.head.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${g.table.body.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        return (g.sub ? `<h4>${esc(g.sub)}</h4>` : '') + (g.sub && !(g.kv && g.kv.length) ? '<p class="hint">Nothing entered.</p>' : '') + (g.kv && g.kv.length ? `<div class="rv-kv">${g.kv.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : '');
      }).join('');
      h += `<div class="rv-sec"><h3>${esc(s.title)}</h3>${inner || '<p class="hint">Nothing entered.</p>'}</div>`;
    });
    h += `<p class="rv-note">“Submit to Opulence” sends this summary, a PDF copy and the data file to Opulence Venture Group. You can also download your own copies below.</p>`;
    $('#reviewBody').innerHTML = h;
    const sb = $('#submitBtn'); sb.hidden = false; sb.disabled = false; sb.textContent = 'Submit to Opulence';
    lastFocus = document.activeElement;
    $('#reviewModal').hidden = false; document.body.style.overflow = 'hidden';
    $('#reviewModal .icon-btn').focus();
  }
  function closeModals() { $$('.modal').forEach(m => { m.hidden = true; }); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }

  /* ---------- Exports ---------- */
  function fileBase() {
    const n = [F('client.lastName'), F('client.firstName')].filter(Boolean).join('-').replace(/[^A-Za-z0-9-]/g, '') || 'Client';
    return `Opulence-FNA-${n}-${new Date().toISOString().slice(0, 10)}`;
  }
  function downloadBlob(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function downloadJSON() { dirty = false; $('#saveStatus').textContent = 'Data file downloaded'; downloadBlob(new Blob([JSON.stringify({ app: 'Opulence FNA', version: 1, savedAt: new Date().toISOString(), data: S }, null, 2)], { type: 'application/json' }), fileBase() + '.json'); }

  let logoData = null;
  function loadLogo() {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { try { const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; cv.getContext('2d').drawImage(img, 0, 0); logoData = { url: cv.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight }; } catch (e) { logoData = null; } };
    img.src = 'assets/logo-wordmark-onwhite.png';
  }
  function downloadPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) { alertInline('The PDF tool didn’t load. Check your connection and try again, or use “Download data file”.'); return; }
    downloadBlob(buildPDF().output('blob'), fileBase() + '.pdf');
  }
  function buildPDF() {
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(), M = 44; const NAVY = [0, 68, 106];
    let y = 44;
    if (logoData) { const h = 22, w = h * logoData.w / logoData.h; doc.addImage(logoData.url, 'PNG', M, y - 6, w, h); }
    else { doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...NAVY); doc.text('OPULENCE VENTURE GROUP', M, y + 10); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(95, 110, 121);
    doc.text('Prepared ' + new Date().toLocaleDateString(), W - M, y + 8, { align: 'right' });
    y += 42;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...NAVY); doc.text('Financial Needs Analysis', M, y);
    y += 16; doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(53, 62, 68);
    const nm = [F('client.firstName'), F('client.lastName')].filter(Boolean).join(' ') + (F('hasSpouse') === 'Yes' && F('spouse.firstName') ? ' & ' + [F('spouse.firstName'), F('spouse.lastName')].filter(Boolean).join(' ') : '');
    doc.text(nm || 'Client', M, y);
    doc.setDrawColor(...NAVY); doc.setLineWidth(2); doc.line(M, y + 10, W - M, y + 10); y += 26;
    const ensure = need => { if (y + need > doc.internal.pageSize.getHeight() - 50) { doc.addPage(); y = 50; } };
    summary().forEach(s => {
      ensure(60);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text(s.title.toUpperCase(), M, y); y += 6;
      doc.setLineWidth(.75); doc.line(M, y, W - M, y); y += 8;
      let any = false;
      s.groups.forEach(g => {
        if (g.table) {
          any = true; ensure(40);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...NAVY); doc.text(g.table.title, M, y + 8); y += 12;
          doc.autoTable({ startY: y, head: [g.table.head], body: g.table.body, margin: { left: M, right: M }, styles: { fontSize: 8, cellPadding: 4, textColor: [53, 62, 68], lineColor: [216, 224, 230], lineWidth: .5 }, headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [247, 250, 252] } });
          y = doc.lastAutoTable.finalY + 10;
        } else if (g.kv && g.kv.length) {
          any = true;
          doc.autoTable({ startY: y, head: g.sub ? [[{ content: g.sub, colSpan: 2 }]] : undefined, body: g.kv, margin: { left: M, right: M }, theme: 'plain', styles: { fontSize: 8.5, cellPadding: 3.5, textColor: [53, 62, 68] }, headStyles: { textColor: NAVY, fontStyle: 'bold', fontSize: 9.5 }, columnStyles: { 0: { cellWidth: 190, textColor: [95, 110, 121] } }, didDrawCell: d => { if (d.section === 'body') { doc.setDrawColor(237, 241, 244); doc.setLineWidth(.5); doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height); } } });
          y = doc.lastAutoTable.finalY + 8;
        }
      });
      if (!any) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(95, 110, 121); doc.text('Nothing entered.', M, y + 8); y += 16; }
      y += 10;
    });
    ensure(70);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(95, 110, 121);
    const disc = 'Please note the following: Certain events and distributions may be subject to taxation and individuals would be responsible for the appropriate liability. This piece provides general information regarding the Internal Revenue Code and does not take into consideration specific state laws. Opulence Venture Group does not provide tax advice and strongly recommends that clients consult a tax advisor concerning any tax issues relating to their investments. This analysis is for information gathering and is not a recommendation or offer of any product.';
    doc.text(doc.splitTextToSize(disc, W - 2 * M), M, y);
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(140, 150, 158); doc.text('Opulence Venture Group · Financial Needs Analysis · Confidential', M, doc.internal.pageSize.getHeight() - 24); doc.text('Page ' + i + ' of ' + pages, W - M, doc.internal.pageSize.getHeight() - 24, { align: 'right' }); }
    return doc;
  }
  function alertInline(msg) { const b = $('#reviewBody'); const d = document.createElement('div'); d.className = 'rv-errors'; d.textContent = msg; b.prepend(d); b.scrollTop = 0; }

  /* ---------- Submit ---------- */
  const SUBMIT_URL = window.FNA_SUBMIT_URL || '/api/fna';
  async function submitFNA() {
    const btn = $('#submitBtn');
    const errs = validate();
    if (errs.length) { openReview(); return; }
    btn.disabled = true; btn.textContent = 'Submitting…';
    let pdf = '';
    try { if (window.jspdf && window.jspdf.jsPDF) pdf = buildPDF().output('datauristring').split(',')[1]; } catch (e) { pdf = ''; }
    const payload = {
      client: { firstName: F('client.firstName'), lastName: F('client.lastName'), email: F('client.email'), cell: F('client.cellPhone'), state: F('client.state') },
      spouse: F('hasSpouse') === 'Yes' ? [F('spouse.firstName'), F('spouse.lastName')].filter(Boolean).join(' ') : '',
      agent: { name: F('next.agent'), email: F('next.agentEmail') },
      sections: summary(),
      fileBase: fileBase(),
      pdf,
      data: { app: 'Opulence FNA', version: 1, savedAt: new Date().toISOString(), data: S },
      company: ($('#fna_hp') || {}).value || ''
    };
    try {
      const res = await fetch(SUBMIT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      dirty = false; $('#saveStatus').textContent = 'Submitted';
      $('#reviewBody').innerHTML = `<div class="rv-success"><div class="rv-check" aria-hidden="true">✓</div><h3>Financial Needs Analysis received</h3><p>Thank you. Opulence Venture Group has received ${esc([F('client.firstName'), F('client.lastName')].filter(Boolean).join(' ') || 'this client')}’s analysis and will follow up about next steps.</p><p class="hint">You can still download a PDF or data file for your records.</p></div>`;
      btn.hidden = true;
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Try again';
      alertInline('The form couldn’t be submitted right now. Please try again, or use “Download PDF” and email it to info@opulenceinvestments.net.');
    }
  }

  /* ---------- Section nav highlighting ---------- */
  function navObserver() {
    const links = {}; $$('[data-nav]').forEach(a => { links[a.dataset.nav] = a; });
    const io = new IntersectionObserver(ents => {
      ents.forEach(en => { if (en.isIntersecting) { $$('[data-nav]').forEach(a => a.classList.remove('active')); const a = links[en.target.id]; if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } } });
    }, { rootMargin: '-35% 0px -60% 0px' });
    SECTIONS.forEach(s => io.observe(document.getElementById(s.id)));
  }

  /* ---------- Init ---------- */
  function init() {
    buildForm(); hydrateFields(); renderAllReps(); paint();
    $$('[data-f].money,[data-f].pctin').forEach(fmtField);
    const form = $('#form');
    form.addEventListener('input', onInput); form.addEventListener('change', onInput);
    form.addEventListener('focusout', e => { if (e.target.matches('.money,.pctin')) { fmtField(e.target); onInput({ target: e.target, type: 'change' }); } });
    document.addEventListener('click', onClick);
    $('#reviewBody').addEventListener('click', e => { const j = e.target.closest('[data-jump]'); if (!j) return; e.preventDefault(); closeModals(); const el = document.getElementById('f_' + j.dataset.jump); if (el) { el.scrollIntoView({ block: 'center' }); const f = el.matches('input,select,textarea') ? el : el.querySelector('input'); if (f) f.focus({ preventScroll: true }); } });
    $('#pdfBtn').addEventListener('click', downloadPDF);
    $('#submitBtn').addEventListener('click', submitFNA);
    $('#jsonBtn').addEventListener('click', downloadJSON);
    $('#clearBtn').addEventListener('click', () => { lastFocus = document.activeElement; $('#confirmModal').hidden = false; $('#confirmClear').focus(); });
    $('#confirmClear').addEventListener('click', () => {
      S = blank(); closeModals(); buildForm(); hydrateFields(); renderAllReps(); paint(); navObserver(); window.scrollTo(0, 0);
      $('#saveStatus').textContent = 'Form cleared';
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && $$('.modal').some(m => !m.hidden)) closeModals(); });
    $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModals(); }));
    navObserver(); loadLogo();
    $('#openBtn').addEventListener('click', () => $('#openFile').click());
    $('#openFile').addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      file.text().then(t => { importData(JSON.parse(t)); $('#saveStatus').textContent = 'Opened ' + file.name; dirty = false; })
        .catch(() => { $('#saveStatus').textContent = 'That file couldn’t be opened'; });
      e.target.value = '';
    });
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
