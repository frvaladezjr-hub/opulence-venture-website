import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import head, header, footer, breadcrumb, cta_band, related_services, SERVICE_ITEMS, BASE_URL

OUT = os.path.join(os.path.dirname(__file__), "..")

ORG_JSONLD = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Opulence Venture Group",
  "url": "{BASE_URL}/",
  "logo": "{BASE_URL}/assets/images/logo-icon-onwhite.png",
  "description": "Business consulting and advanced financial planning firm helping business owners, professionals, and families coordinate business strategy, tax efficiency, retirement planning, risk management, and wealth transfer."
}}
</script>"""

def page(filename, title, description, og_image, body, jsonld="", active=None):
    html = head(title, description, filename, og_image=og_image, jsonld=jsonld)
    html += "<body>\n"
    html += header(active if active else filename)
    html += '<main id="main">\n'
    html += body
    html += "\n</main>\n"
    html += footer()
    with open(os.path.join(OUT, filename), "w") as f:
        f.write(html)
    print("wrote", filename)


# ==========================================================================
# HOME
# ==========================================================================
home_body = """
<section class="hero">
  <div class="hero-media">
    <img src="assets/images/hero-skyline.webp" alt="" loading="eager" decoding="async" width="1920" height="1280" />
  </div>
  <div class="container--wide hero-content">
    <div class="eyebrow">Business &amp; Wealth Strategy</div>
    <h1>Strategic Planning for Your Business, Wealth &amp; Legacy</h1>
    <p class="hero-support">Helping business owners and families coordinate the moving pieces of business, tax, retirement, risk management and wealth transfer.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="contact.html#consultation-form">Schedule a Consultation</a>
      <a class="btn btn-outline btn-lg" href="#what-we-do">Explore Our Services</a>
    </div>
  </div>
</section>

<section class="section" id="who-we-help">
  <div class="container--wide">
    <div class="grid" style="grid-template-columns:1fr;gap:var(--space-12);" >
      <div class="reveal">
        <div class="eyebrow">Who We Help</div>
        <h2 class="section-title" style="margin-top:var(--space-3);">Built for the complexity of real financial lives</h2>
        <p class="section-lede" style="margin-top:var(--space-5);">We work with individuals, families, and business owners whose financial lives involve more than one moving part &mdash; where business decisions, tax exposure, retirement timing, and legacy goals all influence one another.</p>
      </div>
      <div class="reveal" style="display:grid;grid-template-columns:1fr;gap:0;border-top:1px solid var(--color-divider);">
        <div class="grid grid--2" style="gap:0;">
          <div>
            <div class="audience-card"><span class="index">01</span><strong>Business Owners</strong><span class="text-muted">Structuring, protecting, and eventually transitioning what you've built.</span></div>
            <div class="audience-card"><span class="index">02</span><strong>Entrepreneurs</strong><span class="text-muted">Founders navigating growth, cash flow, and long-term structure decisions.</span></div>
            <div class="audience-card"><span class="index">03</span><strong>Professionals</strong><span class="text-muted">High-earning professionals seeking coordinated tax and retirement strategy.</span></div>
            <div class="audience-card"><span class="index">04</span><strong>High-Income Families</strong><span class="text-muted">Households balancing income, taxes, and long-term wealth goals.</span></div>
          </div>
          <div>
            <div class="audience-card"><span class="index">05</span><strong>Real Estate Investors</strong><span class="text-muted">Owners weighing entity structure, cash flow, and tax positioning.</span></div>
            <div class="audience-card"><span class="index">06</span><strong>Veterans &amp; First Responders</strong><span class="text-muted">Public-service professionals planning around benefits and retirement.</span></div>
            <div class="audience-card"><span class="index">07</span><strong>Approaching Retirement</strong><span class="text-muted">Individuals evaluating income, risk, and tax sequencing before retiring.</span></div>
            <div class="audience-card"><span class="index">08</span><strong>Legacy-Focused Families</strong><span class="text-muted">Families coordinating estate plans and multi-generational wealth transfer.</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--surface" id="what-we-do">
  <div class="container--wide">
    <div class="eyebrow reveal">What We Do</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);max-width:36ch;">Two disciplines, coordinated as one strategy</h2>
    <p class="section-lede reveal" style="margin-top:var(--space-5);margin-bottom:var(--space-16);">Opulence Venture Group brings business consulting and advanced financial planning together, so decisions in one area are made with the others in view.</p>

    <div class="grid grid--2 reveal" style="align-items:center;margin-bottom:var(--space-20);">
      <div>
        <img src="assets/images/consulting-desk.webp" alt="Documents and planning materials on an executive desk" loading="lazy" decoding="async" width="1200" height="900" style="border-radius:var(--radius-lg);" />
      </div>
      <div>
        <div class="eyebrow">Business Consulting</div>
        <h3 style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:400;margin-top:var(--space-3);margin-bottom:var(--space-4);">Strategy for how your business is built and run</h3>
        <p class="text-muted" style="margin-bottom:var(--space-6);">We help business owners evaluate structure, efficiency, and continuity decisions that are often addressed too late &mdash; or not at all.</p>
        <ul class="chip-list" style="margin-bottom:var(--space-6);">
          <li class="chip">Structure Optimization</li>
          <li class="chip">Tax-Efficiency Planning</li>
          <li class="chip">Succession Planning</li>
          <li class="chip">Key-Person &amp; Buy-Sell</li>
        </ul>
        <a class="btn btn-outline" href="business-consulting.html">Explore Business Consulting</a>
      </div>
    </div>

    <div class="grid grid--2 reveal" style="align-items:center;">
      <div style="order:2;">
        <img src="assets/images/planning-abstract.webp" alt="Abstract representation of long-term financial growth" loading="lazy" decoding="async" width="1200" height="900" style="border-radius:var(--radius-lg);" />
      </div>
      <div style="order:1;">
        <div class="eyebrow">Advanced Financial Planning</div>
        <h3 style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:400;margin-top:var(--space-3);margin-bottom:var(--space-4);">Strategy for your retirement, taxes, and estate</h3>
        <p class="text-muted" style="margin-bottom:var(--space-6);">We help individuals and families design coordinated approaches to retirement income, tax exposure, and wealth transfer.</p>
        <ul class="chip-list" style="margin-bottom:var(--space-6);">
          <li class="chip">Retirement Planning</li>
          <li class="chip">Roth Conversion Planning</li>
          <li class="chip">Asset Optimization</li>
          <li class="chip">Estate &amp; Legacy Planning</li>
        </ul>
        <a class="btn btn-outline" href="advanced-financial-planning.html">Explore Advanced Financial Planning</a>
      </div>
    </div>
  </div>
</section>

<section class="section" id="process">
  <div class="container">
    <div class="eyebrow reveal">Our Planning Process</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);max-width:32ch;">A coordinated process, not a single transaction</h2>
    <div class="reveal">
      <div class="process-step">
        <span class="step-index">01</span>
        <div><h3>Discovery &amp; Assessment</h3><p class="text-muted">We start by understanding your business, income, existing structures, and long-term goals in detail.</p></div>
      </div>
      <div class="process-step">
        <span class="step-index">02</span>
        <div><h3>Strategic Analysis</h3><p class="text-muted">We evaluate opportunities across tax, retirement, risk management, and estate planning that may align with your goals.</p></div>
      </div>
      <div class="process-step">
        <span class="step-index">03</span>
        <div><h3>Plan Design</h3><p class="text-muted">We help design a coordinated strategy intended to address these moving pieces together rather than in isolation.</p></div>
      </div>
      <div class="process-step">
        <span class="step-index">04</span>
        <div><h3>Implementation &amp; Coordination</h3><p class="text-muted">We work alongside your CPA, attorney, and other advisors to help support implementation of the plan.</p></div>
      </div>
      <div class="process-step">
        <span class="step-index">05</span>
        <div><h3>Ongoing Review</h3><p class="text-muted">Plans are revisited over time as your business, family, and applicable regulations evolve.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section section--surface" id="business-solutions">
  <div class="container--wide">
    <div class="eyebrow reveal">For Business Owners</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);max-width:34ch;">Business Solutions</h2>
    <p class="section-lede reveal" style="margin-top:var(--space-5);margin-bottom:var(--space-12);">Strategies designed around the cash flow, structure, and risk considerations unique to owning a business.</p>
    <div class="grid grid--4 reveal">
      <div class="solution-card">
        <h3>Business Cash-Flow Planning</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Aligning business liquidity with tax and reinvestment goals.</p>
      </div>
      <div class="solution-card">
        <h3>Entity Structure Analysis</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Reviewing whether your current structure still fits your goals.</p>
      </div>
      <div class="solution-card">
        <h3>Executive Compensation</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Designing compensation and benefit strategies for key leaders.</p>
      </div>
      <div class="solution-card">
        <h3>Succession &amp; Risk Management</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Planning for continuity, key-person risk, and eventual transition.</p>
      </div>
    </div>
    <div class="reveal" style="margin-top:var(--space-10);">
      <a class="btn btn-outline" href="business-owner-strategies.html">See All Business Owner Strategies</a>
    </div>
  </div>
</section>

<section class="section" id="wealth-solutions">
  <div class="container--wide">
    <div class="eyebrow reveal">For Individuals &amp; Families</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);max-width:34ch;">Wealth &amp; Retirement Solutions</h2>
    <p class="section-lede reveal" style="margin-top:var(--space-5);margin-bottom:var(--space-12);">Coordinated approaches to retirement income, wealth transfer, and legacy &mdash; designed around your family's specific circumstances.</p>
    <div class="grid grid--4 reveal">
      <div class="solution-card">
        <h3>Retirement Income Planning</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Sequencing income sources designed to help support your retirement.</p>
      </div>
      <div class="solution-card">
        <h3>Estate Planning Coordination</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Working with your attorney to align documents with your broader plan.</p>
      </div>
      <div class="solution-card">
        <h3>Wealth Transfer Strategies</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Approaches designed to help transfer assets efficiently to the next generation.</p>
      </div>
      <div class="solution-card">
        <h3>Life Insurance Strategies</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Evaluating protection and planning strategies suited to your goals.</p>
      </div>
    </div>
    <div class="reveal" style="margin-top:var(--space-10);">
      <a class="btn btn-outline" href="wealth-legacy.html">See All Wealth &amp; Legacy Strategies</a>
    </div>
  </div>
</section>

<section class="section section--dark" id="why-us">
  <div class="container--wide">
    <div class="grid grid--2" style="gap:var(--space-16);align-items:start;">
      <div class="reveal">
        <div class="eyebrow">Why Opulence Venture Group</div>
        <h2 class="section-title" style="margin-top:var(--space-3);">An integrated perspective, not a single product</h2>
        <p class="body-lg" style="margin-top:var(--space-5);color:#a89f8a;">Many firms specialize in a single product or transaction. We approach planning as a coordinated set of decisions &mdash; business, tax, retirement, risk, and legacy &mdash; considered together over time.</p>
        <div class="quote-block" style="margin-top:var(--space-10);">
          <p>&ldquo;The right strategy isn't found in any single product. It's found in how the pieces fit together.&rdquo;</p>
          <cite>Opulence Venture Group</cite>
        </div>
      </div>
      <div class="reveal">
        <div class="stat-card" style="border-top:1px solid oklch(from #eee9dd l c h / 0.16);">
          <div class="stat-value" style="font-size:var(--text-lg);color:#f6f3ea;">Cross-Disciplinary Coordination</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#a89f8a;">Business, tax, retirement, and estate strategy considered as one plan.</p>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="font-size:var(--text-lg);color:#f6f3ea;">Independent, Strategy-First Approach</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#a89f8a;">Planning built around your goals, not a single product.</p>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="font-size:var(--text-lg);color:#f6f3ea;">Long-Term Advisory Relationship</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#a89f8a;">Plans are designed to be revisited as your life and business evolve.</p>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="font-size:var(--text-lg);color:#f6f3ea;">Coordinated Advisor Network</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#a89f8a;">We work alongside your CPA, attorney, and other trusted advisors.</p>
        </div>
      </div>
    </div>
  </div>
</section>

__CTA__
"""

home_body = home_body.replace("__CTA__", cta_band(
    "Let's build a plan around your goals",
    "Schedule a complimentary consultation to discuss your business, wealth, and legacy planning priorities.",
    secondary_label="Learn About Our Process",
    secondary_href="index.html#process",
))

page(
    "index.html",
    "Opulence Venture Group | Business Consulting &amp; Advanced Financial Planning",
    "Opulence Venture Group helps business owners, professionals, and families coordinate business strategy, tax-efficient planning, retirement, risk management, and wealth transfer.",
    "assets/images/hero-skyline.webp",
    home_body,
    jsonld=ORG_JSONLD,
    active="index.html",
)

# ==========================================================================
# ABOUT
# ==========================================================================
about_body = """
<section class="page-header">
  <div class="page-header-media"><img src="assets/images/about-office.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    __BREADCRUMB__
    <div class="page-header-content">
      <div class="eyebrow">About Opulence Venture Group</div>
      <h1>Strategic planning, built around how your life and business actually work</h1>
      <p>We help clients see their business, tax, retirement, and legacy decisions as connected parts of a single strategy &mdash; not a series of separate transactions.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="eyebrow reveal">Our Mission</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);max-width:30ch;">Planning that connects the pieces, not just the products</h2>
    <p class="body-lg reveal" style="margin-top:var(--space-6);">Opulence Venture Group was founded on a simple observation: business owners and high-income families are regularly advised on individual pieces of their financial life &mdash; a policy here, a tax return there, an estate document somewhere else &mdash; without anyone coordinating how those pieces work together. Our role is to help close that gap.</p>
    <p class="body-lg reveal" style="margin-top:var(--space-6);">We work as strategic planning partners, helping clients evaluate business structure, tax efficiency, retirement design, risk management, and wealth transfer as one coordinated plan, developed alongside their existing CPA, attorney, and other professional advisors.</p>
  </div>
</section>

<section class="section section--surface">
  <div class="container--wide">
    <div class="eyebrow reveal">Our Approach</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-12);max-width:30ch;">What guides how we work</h2>
    <div class="grid grid--3 reveal">
      <div class="solution-card">
        <h3>Strategy Before Product</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">We start with your goals and circumstances, then evaluate which strategies and tools may be appropriate &mdash; not the reverse.</p>
      </div>
      <div class="solution-card">
        <h3>Coordinated, Not Siloed</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Business, tax, retirement, and estate decisions are reviewed together, since a change in one area often affects the others.</p>
      </div>
      <div class="solution-card">
        <h3>Educational First</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">We aim to help you understand the reasoning behind a strategy, including its trade-offs, before any decision is made.</p>
      </div>
      <div class="solution-card">
        <h3>Built for the Long Term</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">Plans are designed to be reviewed and adjusted as your business, family, and applicable regulations change.</p>
      </div>
      <div class="solution-card">
        <h3>Collaborative by Design</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">We work alongside your existing CPA, attorney, and other advisors rather than in place of them.</p>
      </div>
      <div class="solution-card">
        <h3>Individual Circumstances Vary</h3>
        <p class="text-muted" style="font-size:var(--text-sm);">We tailor recommendations to your specific situation; no strategy is presented as suitable for everyone.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container--wide">
    <div class="grid grid--2 reveal" style="align-items:center;">
      <div>
        <div class="eyebrow">Who We Work With</div>
        <h2 class="section-title" style="margin-top:var(--space-3);margin-bottom:var(--space-5);max-width:28ch;">Clients who value coordinated, long-term thinking</h2>
        <p class="text-muted">Our clients include business owners, entrepreneurs, professionals, high-income families, real estate investors, veterans and first responders, individuals approaching retirement, and families focused on estate and legacy planning.</p>
        <div class="chip-list" style="margin-top:var(--space-6);">
          <span class="chip">Business Owners</span>
          <span class="chip">Professionals</span>
          <span class="chip">Real Estate Investors</span>
          <span class="chip">Veterans &amp; First Responders</span>
          <span class="chip">Pre-Retirees</span>
          <span class="chip">Legacy-Focused Families</span>
        </div>
      </div>
      <div>
        <img src="assets/images/consulting-desk.webp" alt="Planning documents and pen on an executive desk" loading="lazy" decoding="async" width="1200" height="900" style="border-radius:var(--radius-lg);" />
      </div>
    </div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>This page is provided for general educational purposes and does not constitute tax, legal, or investment advice. Strategies referenced may not be suitable for every individual, and individual circumstances vary. Please consult a qualified, licensed professional before making decisions regarding your specific situation.</p>
  </div>
</section>

__CTA__
"""

about_body = about_body.replace("__BREADCRUMB__", breadcrumb("About", "about.html"))
about_body = about_body.replace("__CTA__", cta_band(
    "Ready to talk through your goals?",
    "Schedule a complimentary consultation with Opulence Venture Group.",
    secondary_label="Explore Our Services",
    secondary_href="business-consulting.html",
))

page(
    "about.html",
    "About Opulence Venture Group | Business &amp; Wealth Strategy Firm",
    "Learn how Opulence Venture Group helps business owners and families coordinate business, tax, retirement, and legacy planning into one strategic plan.",
    "assets/images/about-office.webp",
    about_body,
)

# ==========================================================================
# SERVICE PAGE TEMPLATE
# ==========================================================================

def accordion_group(group_id, items):
    html = f'<div data-accordion-group="{group_id}">'
    for title, body in items:
        html += f"""<div class="accordion-item" data-open="false">
      <button class="accordion-trigger" aria-expanded="false">
        <span>{title}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <div class="accordion-panel">
        <div class="accordion-panel-inner"><p>{body}</p></div>
      </div>
    </div>"""
    html += "</div>"
    return html


def build_service_page(filename, eyebrow, h1, intro_paragraphs, audience_chips, focus_items, feature_image, feature_alt, quote, meta_title, meta_description):
    intro_html = "".join(f'<p class="body-lg reveal" style="margin-top:var(--space-6);">{p}</p>' for p in intro_paragraphs)
    chips_html = "".join(f'<span class="chip">{c}</span>' for c in audience_chips)
    body = f"""
<section class="page-header">
  <div class="page-header-media"><img src="{feature_image}" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    {breadcrumb(h1.split(':')[0], filename)}
    <div class="page-header-content">
      <div class="eyebrow">{eyebrow}</div>
      <h1>{h1}</h1>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="eyebrow reveal">Overview</div>
    {intro_html}
    <div class="chip-list reveal" style="margin-top:var(--space-8);">{chips_html}</div>
  </div>
</section>

<section class="section section--surface">
  <div class="container">
    <div class="eyebrow reveal">Areas of Focus</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);max-width:32ch;">What we help you plan for</h2>
    <div class="reveal">{accordion_group(filename, focus_items)}</div>
  </div>
</section>

<section class="section">
  <div class="container--wide">
    <div class="grid grid--2 reveal" style="align-items:center;">
      <div>
        <img src="{feature_image}" alt="{feature_alt}" loading="lazy" decoding="async" width="1200" height="900" style="border-radius:var(--radius-lg);" />
      </div>
      <div class="quote-block">
        <p>&ldquo;{quote}&rdquo;</p>
        <cite>Opulence Venture Group</cite>
      </div>
    </div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>The information on this page is educational in nature and does not constitute tax, legal, or investment advice. Strategies discussed may not be available or suitable in every situation, and outcomes are not guaranteed. Individual circumstances vary &mdash; please consult a qualified, licensed tax, legal, or financial professional before implementing any strategy.</p>
  </div>
</section>

{related_services(filename)}

__CTA__
"""
    body = body.replace("__CTA__", cta_band(
        "Let's discuss what this could look like for you",
        "Schedule a complimentary consultation to explore strategies suited to your situation.",
    ))
    page(filename, meta_title, meta_description, feature_image, body)


# ---- Business Consulting --------------------------------------------------
build_service_page(
    filename="business-consulting.html",
    eyebrow="Business Consulting",
    h1="Business Consulting",
    intro_paragraphs=[
        "Running a business involves a long list of structural, tax, and continuity decisions &mdash; many of which are made once and rarely revisited. Our business consulting work is designed to help you evaluate those decisions with a longer-term view.",
        "We work with business owners to review how their business is structured, how key employees and executives are retained and compensated, and how the business would continue to operate if something unexpected happened to a key person or owner.",
    ],
    audience_chips=["Business Owners", "Entrepreneurs", "Partners &amp; Co-Owners", "Executive Teams"],
    focus_items=[
        ("Business Structure Optimization", "A review of your entity structure and how it aligns with your current tax situation, liability exposure, and growth plans."),
        ("Tax-Efficiency Planning", "Identifying business-level strategies that may help improve tax efficiency, subject to applicable rules and your specific facts."),
        ("Employee Retention Strategies", "Designing benefit and incentive strategies intended to help attract and retain key talent."),
        ("Business Succession Planning", "Planning for how ownership and leadership will transition, whether to family, partners, employees, or an outside buyer."),
        ("Key-Person Planning", "Evaluating strategies designed to help protect the business against the loss of an owner or critical employee."),
        ("Buy-Sell Planning", "Reviewing buy-sell agreements and their funding mechanisms to help support a smooth ownership transition."),
        ("Executive Benefit Strategies", "Designing supplemental benefit strategies intended to help retain and reward key executives."),
    ],
    feature_image="assets/images/consulting-desk.webp",
    feature_alt="Fountain pen resting on business planning documents",
    quote="A business built without a succession or continuity plan is a plan left to chance.",
    meta_title="Business Consulting | Opulence Venture Group",
    meta_description="Business structure optimization, tax-efficiency planning, succession, key-person, and buy-sell strategies for business owners from Opulence Venture Group.",
)

# ---- Advanced Financial Planning -------------------------------------------
build_service_page(
    filename="advanced-financial-planning.html",
    eyebrow="Advanced Financial Planning",
    h1="Advanced Financial Planning",
    intro_paragraphs=[
        "Advanced financial planning goes beyond a single account or product. It looks at how your retirement income, tax exposure, insurance strategies, and estate goals interact over time &mdash; and how decisions made today may affect outcomes decades from now.",
        "We help professionals, high-income families, and individuals approaching retirement design coordinated strategies around the assets and income sources they already have.",
    ],
    audience_chips=["High-Income Families", "Professionals", "Pre-Retirees", "Legacy-Focused Families"],
    focus_items=[
        ("Retirement Planning", "Evaluating how your current savings, income sources, and timeline align with your retirement goals."),
        ("Asset Optimization", "Reviewing how assets are positioned across account types with an eye toward tax efficiency and long-term goals."),
        ("Tax-Efficient Wealth Strategies", "Identifying strategies that may help manage your tax exposure over time, subject to applicable rules."),
        ("Life Insurance Planning", "Evaluating protection and planning strategies suited to your income replacement and legacy goals."),
        ("Annuity Planning", "Reviewing whether annuity strategies may have a role in your retirement income plan, including their costs and terms."),
        ("Roth Conversion Planning", "Analyzing whether converting pre-tax assets may align with your long-term tax and income goals."),
        ("Estate &amp; Legacy Planning", "Coordinating with your attorney to help align your financial plan with your estate planning documents."),
    ],
    feature_image="assets/images/planning-abstract.webp",
    feature_alt="Abstract representation of long-term financial growth",
    quote="Retirement income planning is less about any single account and more about how all of them work together.",
    meta_title="Advanced Financial Planning | Opulence Venture Group",
    meta_description="Retirement planning, asset optimization, tax-efficient wealth strategies, Roth conversion planning, and estate coordination from Opulence Venture Group.",
)

# ---- Business Owner Strategies ---------------------------------------------
build_service_page(
    filename="business-owner-strategies.html",
    eyebrow="Business Owner Strategies",
    h1="Business Owner Strategies",
    intro_paragraphs=[
        "Owning a business changes how nearly every financial decision should be evaluated &mdash; from how cash flows through the business, to how executives are compensated, to how risk is managed across the organization.",
        "We help business owners look at these decisions holistically, so cash-flow, compensation, benefits, and risk-management strategies are designed to work together rather than in isolation.",
    ],
    audience_chips=["Business Owners", "Founders", "Family-Owned Businesses", "Real Estate Investors"],
    focus_items=[
        ("Business Cash-Flow Planning", "Reviewing how business cash flow is managed and reinvested with tax and growth objectives in mind."),
        ("Entity Structure Analysis", "Evaluating whether your current business entity structure still aligns with your goals as the business evolves."),
        ("Executive Compensation", "Designing compensation strategies intended to help attract, motivate, and retain key leadership."),
        ("Employee Benefits", "Reviewing benefit offerings and how they align with retention goals and budget considerations."),
        ("Business Succession", "Planning for ownership and leadership transition, whether internal or to an outside party."),
        ("Risk Management", "Identifying strategies designed to help manage key-person, liability, and continuity risks facing the business."),
    ],
    feature_image="assets/images/succession-handshake.webp",
    feature_alt="Close-up of a handshake between business partners",
    quote="A strong business deserves a plan for what happens next &mdash; not just for what's happening now.",
    meta_title="Business Owner Strategies | Opulence Venture Group",
    meta_description="Business cash-flow planning, entity structure analysis, executive compensation, employee benefits, succession, and risk management strategies for business owners.",
)

# ---- Wealth & Legacy ---------------------------------------------------------
build_service_page(
    filename="wealth-legacy.html",
    eyebrow="Wealth &amp; Legacy",
    h1="Wealth &amp; Legacy",
    intro_paragraphs=[
        "Building wealth is only part of the equation &mdash; preserving it, drawing income from it efficiently, and eventually transferring it are equally important considerations.",
        "We help families coordinate retirement income, estate planning, and wealth transfer strategies so their legacy goals are reflected across their full financial picture.",
    ],
    audience_chips=["Families", "Retirees", "Multi-Generational Households", "Legacy-Focused Individuals"],
    focus_items=[
        ("Estate Planning Coordination", "Working alongside your estate planning attorney to help align your financial plan with your estate documents."),
        ("Wealth Transfer", "Reviewing strategies designed to help transfer assets to the next generation in a coordinated way."),
        ("Retirement Income Planning", "Sequencing income sources with the goal of supporting your lifestyle throughout retirement."),
        ("Legacy Planning", "Clarifying your legacy goals and how your financial and estate plans may help support them."),
        ("Life Insurance Strategies", "Evaluating how life insurance strategies may fit into your broader wealth transfer and legacy goals."),
    ],
    feature_image="assets/images/legacy-heirloom.webp",
    feature_alt="Antique pocket watch and fountain pen representing legacy planning",
    quote="Legacy planning isn't just about what you leave behind &mdash; it's about how clearly your wishes are carried out.",
    meta_title="Wealth &amp; Legacy Planning | Opulence Venture Group",
    meta_description="Estate planning coordination, wealth transfer, retirement income planning, and legacy strategies for families from Opulence Venture Group.",
)

# ==========================================================================
# RESOURCES
# ==========================================================================
resources_body = """
<section class="page-header">
  <div class="page-header-media"><img src="assets/images/resources-desk.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    __BREADCRUMB__
    <div class="page-header-content">
      <div class="eyebrow">Resources</div>
      <h1>Planning insights for business owners &amp; families</h1>
      <p>Educational perspectives on business strategy, tax-efficient planning, and legacy decisions. Every situation is different &mdash; use these as a starting point for a conversation, not a substitute for one.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="eyebrow reveal">Planning Topics</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);max-width:32ch;">Topics worth a closer look</h2>
    <div class="reveal">__TOPICS__</div>
  </div>
</section>

<section class="section section--surface">
  <div class="container">
    <div class="eyebrow reveal">Frequently Asked Questions</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);max-width:32ch;">Common questions we hear</h2>
    <div class="reveal">__FAQ__</div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>The content on this page is provided for general educational purposes only and does not constitute tax, legal, or investment advice. Tax laws and regulations referenced are subject to change and may affect individual circumstances differently. Please consult a qualified, licensed tax, legal, or financial professional regarding your specific situation before making any decisions.</p>
  </div>
</section>

__CTA__
"""

resources_body = resources_body.replace("__BREADCRUMB__", breadcrumb("Resources", "resources.html"))
resources_body = resources_body.replace("__TOPICS__", accordion_group("topics", [
    ("Understanding Roth Conversion Timing", "The tax impact of a Roth conversion can vary significantly depending on your current income, future tax expectations, and the timing of the conversion. A coordinated review can help you evaluate whether a conversion strategy may align with your broader retirement and tax goals."),
    ("Questions to Consider Before a Business Sale", "A business sale involves more than negotiating a price. Structure, tax treatment, timing, and post-sale planning can all significantly affect the outcome, and are worth evaluating well before a transaction is finalized."),
    ("How Buy-Sell Agreements Support Business Continuity", "A properly designed and funded buy-sell agreement can help provide clarity for owners, partners, and their families if an owner passes away, becomes disabled, or exits the business."),
    ("Coordinating Estate Plans with Business Succession", "For business owners, estate planning and succession planning are closely connected. Reviewing both together can help avoid gaps between what your estate documents say and what actually happens to your business."),
    ("Tax Considerations for Real Estate Investors", "Entity structure, depreciation strategy, and cash-flow planning can all affect the tax efficiency of a real estate portfolio, and are worth revisiting as a portfolio grows."),
    ("Retirement Income Planning for Business Owners", "Business owners often lack a traditional pension or employer retirement plan, which makes coordinated planning around business cash flow, personal savings, and eventual business sale proceeds especially important."),
]))
resources_body = resources_body.replace("__FAQ__", accordion_group("faq", [
    ("What is the difference between business consulting and advanced financial planning?", "Business consulting generally focuses on how your business is structured and run, while advanced financial planning generally focuses on your personal retirement, tax, and estate strategy. Many clients benefit from both, since business and personal finances are often closely connected."),
    ("Do I need to already have a CPA or attorney to work with you?", "Not necessarily. We can work alongside your existing CPA and attorney, or help you identify professionals to consult as part of your plan. We do not provide tax or legal advice ourselves."),
    ("Is this only for large businesses or high-net-worth individuals?", "No. We work with a range of business owners, professionals, and families, including those earlier in their planning journey. The consultation is designed to help determine whether our approach may be a good fit for your situation."),
    ("How does the consultation process work?", "It typically begins with a complimentary conversation about your goals and current situation, followed by a more detailed review if it makes sense to move forward together."),
]))
resources_body = resources_body.replace("__CTA__", cta_band(
    "Have a specific question in mind?",
    "Schedule a consultation and we'll walk through how it may apply to your situation.",
))

page(
    "resources.html",
    "Resources | Business &amp; Wealth Planning Insights | Opulence Venture Group",
    "Educational resources on business succession, tax-efficient planning, Roth conversions, estate planning, and retirement income from Opulence Venture Group.",
    "assets/images/resources-desk.webp",
    resources_body,
)

# ==========================================================================
# CONTACT
# ==========================================================================
contact_body = """
<section class="page-header" style="min-height:44vh;">
  <div class="page-header-media"><img src="assets/images/contact-lobby.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    __BREADCRUMB__
    <div class="page-header-content">
      <div class="eyebrow">Contact</div>
      <h1>Schedule a Consultation</h1>
      <p>Tell us a bit about your goals and we'll follow up to schedule a complimentary conversation.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container--wide">
    <div class="grid grid--2" style="gap:var(--space-16);align-items:flex-start;">
      <div class="reveal" id="consultation-form-wrap">
        <div class="eyebrow">Get Started</div>
        <h2 class="section-title" style="margin-top:var(--space-3);margin-bottom:var(--space-8);max-width:26ch;">Tell us about your situation</h2>

        <form id="consultation-form" novalidate>
          <div class="form-grid form-grid--2">
            <div class="field">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" required autocomplete="name" />
              <small class="error">Please enter your name.</small>
            </div>
            <div class="field">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" required autocomplete="email" />
              <small class="error">Please enter a valid email address.</small>
            </div>
          </div>
          <div class="form-grid form-grid--2" style="margin-top:var(--space-6);">
            <div class="field">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" required autocomplete="tel" />
              <small class="error">Please enter a phone number.</small>
            </div>
            <div class="field">
              <label for="occupation">Business / Occupation</label>
              <input type="text" id="occupation" name="occupation" required />
              <small class="error">Please tell us your business or occupation.</small>
            </div>
          </div>
          <div class="field" style="margin-top:var(--space-6);">
            <label for="interest">Primary Area of Interest</label>
            <select id="interest" name="interest" required>
              <option value="">Select an area of interest</option>
              <option>Business Consulting</option>
              <option>Advanced Financial Planning</option>
              <option>Business Owner Strategies</option>
              <option>Wealth &amp; Legacy Planning</option>
              <option>Not Sure Yet</option>
            </select>
            <small class="error">Please select an area of interest.</small>
          </div>
          <div class="field" style="margin-top:var(--space-6);">
            <label for="message">What would you like help with?</label>
            <textarea id="message" name="message" required placeholder="Briefly describe your goals or what prompted you to reach out."></textarea>
            <small class="error">Please share a brief description.</small>
          </div>
          <p class="form-note">By submitting this form, you agree to be contacted by Opulence Venture Group regarding your inquiry. We do not sell your information.</p>
          <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:var(--space-6);">Request a Consultation</button>
        </form>

        <div class="form-success" id="form-success" data-visible="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          <h3 style="font-family:var(--font-body);font-size:var(--text-lg);font-weight:600;">Thank you &mdash; your request has been received.</h3>
          <p class="text-muted">A member of our team will follow up shortly to schedule your consultation. If your matter is time-sensitive, feel free to call us directly.</p>
        </div>
      </div>

      <div class="reveal section--dark" style="padding:var(--space-10);border-radius:var(--radius-lg);">
        <div class="eyebrow">Direct Contact</div>
        <h3 style="font-family:var(--font-display);font-weight:400;font-size:var(--text-lg);margin-top:var(--space-3);margin-bottom:var(--space-6);color:#f6f3ea;">Prefer to reach out directly?</h3>

        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.67 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.85.54 2.81.67A2 2 0 0 1 22 16.92z"/></svg>
          <div><strong>Phone</strong><a href="tel:+18005550134">(800) 555-0134</a></div>
        </div>
        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
          <div><strong>Email</strong><a href="mailto:info@opulenceventuregroup.com">info@opulenceventuregroup.com</a></div>
        </div>
        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div><strong>Office Hours</strong><span>Monday &ndash; Friday, 9:00 AM &ndash; 5:00 PM</span></div>
        </div>
        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <div><strong>Consultations</strong><span>Complimentary initial consultation, in person or virtual.</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>Opulence Venture Group provides business consulting and financial planning education and strategy coordination. Information submitted through this form is used solely to respond to your inquiry and is not sold to third parties. Nothing on this page constitutes tax, legal, or investment advice, and no strategy discussed is guaranteed. Please consult a qualified, licensed professional regarding your specific situation.</p>
  </div>
</section>
"""

contact_body = contact_body.replace("__BREADCRUMB__", breadcrumb("Contact", "contact.html"))

page(
    "contact.html",
    "Contact Us | Schedule a Consultation | Opulence Venture Group",
    "Schedule a complimentary consultation with Opulence Venture Group to discuss business consulting, financial planning, retirement, and legacy strategies.",
    "assets/images/contact-lobby.webp",
    contact_body,
)
