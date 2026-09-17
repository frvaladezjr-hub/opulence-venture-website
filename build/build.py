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

def path_card(index, title, description, topics, href, cta_label):
    topics_html = "".join(f"<li>{t}</li>" for t in topics)
    return f"""<div class="path-card" data-open="false">
      <button class="path-card-trigger" aria-expanded="false">
        <div class="path-card-heading">
          <span class="path-card-index">{index}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <div class="path-card-panel">
        <div class="path-card-panel-inner">
          <ul class="path-card-topics">{topics_html}</ul>
          <a class="path-card-link" href="{href}">{cta_label} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </div>"""


def _initials(name):
    parts = [p for p in name.replace(".", "").split(" ") if p]
    return "".join(p[0].upper() for p in parts[:2])


def consultant_card(photo, alt, name, role, bio=None):
    bio = bio or "Works directly with clients to coordinate business, tax, retirement, and legacy strategy into a single, integrated plan."
    if photo:
        photo_html = f'<img src="{photo}" alt="{alt}" loading="lazy" decoding="async" width="600" height="750" />'
        photo_class = "consultant-photo"
    else:
        photo_html = f'<span class="consultant-initials">{_initials(name)}</span><span class="consultant-photo-note">Headshot coming soon</span>'
        photo_class = "consultant-photo is-placeholder"
    return f"""<div class="consultant-card">
      <div class="{photo_class}">{photo_html}</div>
      <div class="consultant-body">
        <h3>{name}</h3>
        <span class="consultant-role">{role}</span>
        <p class="text-muted">{bio}</p>
      </div>
    </div>"""


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
    <div class="eyebrow">Business. Wealth. Legacy.</div>
    <h1>Strategic Planning for the Decisions That Matter Most</h1>
    <p class="hero-support">Opulence Venture Group helps business owners, professionals, and families coordinate the business, tax, retirement, risk, and legacy decisions that shape everything else.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="contact.html#consultation-form">Schedule a Consultation</a>
      <a class="btn btn-outline btn-lg" href="#what-we-do">Explore Our Services</a>
    </div>
  </div>
</section>

<section class="section" id="paths">
  <div class="container--wide">
    <div class="eyebrow reveal">Where to Start</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);max-width:34ch;">Three paths, one coordinated strategy</h2>
    <p class="section-lede reveal" style="margin-top:var(--space-5);margin-bottom:var(--space-12);">However your situation is shaped, it likely falls into one of these areas &mdash; each designed to connect back to the same integrated plan.</p>
    <div class="path-grid reveal">
      __PATH_CARDS__
    </div>
  </div>
</section>

<section class="section" id="who-we-help">
  <div class="container--wide">
    <div class="reveal" style="max-width:60ch;">
      <div class="eyebrow">Who We Help</div>
      <h2 class="section-title" style="margin-top:var(--space-3);">Built for the complexity of real financial lives</h2>
      <p class="section-lede" style="margin-top:var(--space-5);">We work with individuals, families, and business owners whose financial lives involve more than one moving part &mdash; where business decisions, tax exposure, retirement timing, and legacy goals all influence one another.</p>
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
        <p class="body-lg" style="margin-top:var(--space-5);color:#9fb0c2;">Many firms specialize in a single product or transaction. We approach planning as a coordinated set of decisions &mdash; business, tax, retirement, risk, and legacy &mdash; considered together over time.</p>
        <div class="quote-block" style="margin-top:var(--space-10);">
          <p>&ldquo;The right strategy isn't found in any single product. It's found in how the pieces fit together.&rdquo;</p>
          <cite>Opulence Venture Group</cite>
        </div>
      </div>
      <div class="reveal">
        <div class="stat-card" style="border-top:1px solid oklch(from #e8eef5 l c h / 0.16);">
          <div class="stat-value" style="font-size:var(--text-lg);color:#eef4fa;">Cross-Disciplinary Coordination</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#9fb0c2;">Business, tax, retirement, and estate strategy considered as one plan.</p>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="font-size:var(--text-lg);color:#eef4fa;">Independent, Strategy-First Approach</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#9fb0c2;">Planning built around your goals, not a single product.</p>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="font-size:var(--text-lg);color:#eef4fa;">Long-Term Advisory Relationship</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#9fb0c2;">Plans are designed to be revisited as your life and business evolve.</p>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="font-size:var(--text-lg);color:#eef4fa;">Coordinated Advisor Network</div>
          <p class="text-muted" style="font-size:var(--text-sm);color:#9fb0c2;">We work alongside your CPA, attorney, and other trusted advisors.</p>
        </div>
      </div>
    </div>
  </div>
</section>

__CTA__
"""

home_body = home_body.replace("__PATH_CARDS__", (
    path_card(
        "01",
        "Business Owners",
        "Structuring, protecting, and eventually transitioning what you've built.",
        ["Business structure", "Tax efficiency", "Employee retention", "Succession"],
        "business-consulting.html",
        "Explore Business Consulting",
    )
    + path_card(
        "02",
        "Individuals &amp; Families",
        "Coordinated planning around retirement, wealth, and what comes next.",
        ["Retirement", "Wealth optimization", "Risk management", "Legacy"],
        "wealth-legacy.html",
        "Explore Wealth &amp; Legacy",
    )
    + path_card(
        "03",
        "Advanced Planning",
        "A fully coordinated view across every area of your financial life.",
        ["Business", "Tax", "Insurance", "Retirement", "Estate coordination"],
        "advanced-financial-planning.html",
        "Explore Advanced Financial Planning",
    )
))
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
    for item in items:
        title, body = item[0], item[1]
        extra = item[2] if len(item) > 2 else ""
        html += f"""<div class="accordion-item" data-open="false">
      <button class="accordion-trigger" aria-expanded="false">
        <span>{title}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <div class="accordion-panel">
        <div class="accordion-panel-inner"><p>{body}</p>{extra}</div>
      </div>
    </div>"""
    html += "</div>"
    return html


def calendly_embed_block(anchor_id, label, calendly_url):
    return f"""<div class="reveal">
          <h3 style="font-family:var(--font-body);font-size:var(--text-lg);font-weight:600;margin-bottom:var(--space-4);">{label}</h3>
          <div class="calendly-embed" id="{anchor_id}">
            <div class="calendly-inline-widget" data-url="{calendly_url}?hide_gdpr_banner=1&amp;background_color=ffffff&amp;text_color=0f1e2e&amp;primary_color=1f5c8c" style="min-width:280px;height:700px;"></div>
          </div>
        </div>"""


def schedule_section(schedule_items):
    blocks = "".join(calendly_embed_block(anchor_id, label, url) for anchor_id, label, url in schedule_items)
    grid_class = "grid grid--2" if len(schedule_items) > 1 else ""
    return f"""<link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
<section class="section section--surface">
  <div class="container--wide">
    <div class="eyebrow reveal">Get Started</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);max-width:36ch;">Pick a time that works for you</h2>
    <div class="{grid_class}" style="gap:var(--space-10);align-items:start;">{blocks}</div>
  </div>
</section>
<script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>"""


def build_service_page(filename, eyebrow, h1, intro_paragraphs, audience_chips, focus_items, feature_image, feature_alt, quote, meta_title, meta_description, schedule_items=None, show_get_started_section=True):
    intro_html = "".join(f'<p class="body-lg reveal" style="margin-top:var(--space-6);">{p}</p>' for p in intro_paragraphs)
    chips_html = "".join(f'<span class="chip">{c}</span>' for c in audience_chips)
    schedule_html = schedule_section(schedule_items) if (schedule_items and show_get_started_section) else ""
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

{schedule_html}

<section class="disclaimer">
  <div class="container">
    <p>The information on this page is educational in nature and does not constitute tax, legal, or investment advice. Strategies discussed may not be available or suitable in every situation, and outcomes are not guaranteed. Individual circumstances vary &mdash; please consult a qualified, licensed tax, legal, or financial professional before implementing any strategy.</p>
  </div>
</section>

{related_services(filename)}

__CTA__
"""
    if schedule_items:
        cta_kwargs = {
            "primary_label": schedule_items[0][1],
            "primary_href": f"#{schedule_items[0][0]}" if show_get_started_section else schedule_items[0][2],
        }
        if len(schedule_items) > 1 and show_get_started_section:
            cta_kwargs["secondary_label"] = schedule_items[1][1]
            cta_kwargs["secondary_href"] = f"#{schedule_items[1][0]}"
    else:
        cta_kwargs = {}
    body = body.replace("__CTA__", cta_band(
        "Let's discuss what this could look like for you",
        "Schedule a complimentary consultation to explore strategies suited to your situation.",
        **cta_kwargs,
    ))
    page(filename, meta_title, meta_description, feature_image, body)


RMD_CALCULATOR_HTML = """
<div class="rmd-projector" data-rmd-projector>
  <p class="mini-calc-label">Required Minimum Distribution Calculator</p>
  <p class="rmd-projector-desc">Estimate your future Required Minimum Distributions and see how your retirement account may grow over time based on an assumed rate of return.</p>

  <div class="form-grid form-grid--3">
    <div class="field" data-rmd-field="birthYear">
      <label for="rmd-birth-year">Birth Year</label>
      <input type="number" id="rmd-birth-year" inputmode="numeric" placeholder="e.g. 1958" min="1920" max="2015" step="1" />
      <small class="error" data-rmd-error-for="birthYear">Please enter a valid birth year.</small>
    </div>
    <div class="field" data-rmd-field="balance">
      <label for="rmd-balance-2">Current Retirement Account Balance</label>
      <input type="text" id="rmd-balance-2" inputmode="decimal" placeholder="$500,000" />
      <small class="error" data-rmd-error-for="balance">Please enter a valid, non-negative account balance.</small>
    </div>
    <div class="field" data-rmd-field="rate">
      <label for="rmd-rate">Assumed Annual Rate of Return</label>
      <div class="rmd-rate-field">
        <input type="number" id="rmd-rate" inputmode="decimal" value="7" min="-20" max="20" step="0.1" />
        <span class="rmd-rate-suffix">%</span>
      </div>
      <small class="error" data-rmd-error-for="rate">Please enter a rate of return between -20% and 20%.</small>
      <small class="rmd-inline-note">Illustrative only. Investment returns are not guaranteed.</small>
    </div>
  </div>

  <p class="rmd-inline-note" style="margin-top:var(--space-5);">For illustration purposes only &mdash; calculations are estimates and may not reflect your actual RMD.</p>

  <div class="rmd-projector-actions">
    <button type="button" class="btn btn-primary" data-rmd-calculate>Calculate My RMD Projection</button>
    <button type="button" class="btn btn-outline" data-rmd-reset>Reset Calculator</button>
  </div>

  <div class="rmd-projector-result" data-rmd-result hidden>
    <div class="mini-calc-result-grid rmd-summary-grid">
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-rmd-out-current-age>&mdash;</span>
        <span class="mini-calc-result-caption">Current age</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-rmd-out-start-age>&mdash;</span>
        <span class="mini-calc-result-caption">Estimated RMD starting age</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-rmd-out-first-year>&mdash;</span>
        <span class="mini-calc-result-caption">Estimated first RMD year</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-rmd-out-balance-at-start>&mdash;</span>
        <span class="mini-calc-result-caption">Estimated account value when RMDs begin</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-rmd-out-first-amount>&mdash;</span>
        <span class="mini-calc-result-caption">Estimated first-year RMD</span>
      </div>
    </div>

    <div class="rmd-chart-wrap">
      <canvas data-rmd-chart height="260"></canvas>
    </div>

    <div class="rmd-table-wrap">
      <table class="rmd-table" data-rmd-table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Age</th>
            <th>Beginning Balance</th>
            <th>Estimated Growth</th>
            <th>Estimated RMD</th>
            <th>Ending Balance</th>
          </tr>
        </thead>
        <tbody data-rmd-table-body></tbody>
      </table>
    </div>
  </div>

  <p class="mini-calc-note">This calculator is for educational and illustrative purposes only and does not constitute tax, legal, investment, or financial advice. Actual Required Minimum Distributions are generally based on the applicable IRS rules, life expectancy factors, and the value of retirement accounts as of December 31 of the prior year. Tax laws and RMD rules may change. Investment returns are not guaranteed, and actual results will vary. Please consult with a qualified tax, legal, financial, or investment professional regarding your individual situation. All calculations are performed in your browser &mdash; no financial information you enter here is stored or transmitted.</p>
</div>
"""

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
    schedule_items=[
        ("schedule-business", "Schedule a Business Strategy Session", "https://calendly.com/apdivision/business-strategies"),
    ],
    show_get_started_section=False,
)

ROTH_CALCULATOR_HTML = """
<div class="mini-calc" data-roth-calculator>
  <p class="mini-calc-label">Estimate the tax cost of a conversion</p>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="roth-filing-status">Filing Status</label>
      <select id="roth-filing-status">
        <option value="single">Single</option>
        <option value="mfj">Married Filing Jointly</option>
        <option value="hoh">Head of Household</option>
      </select>
    </div>
    <div class="field">
      <label for="roth-income">Estimated Taxable Income This Year (before conversion)</label>
      <input type="number" id="roth-income" min="0" step="1000" placeholder="e.g. 120000" inputmode="numeric" />
    </div>
  </div>
  <div class="field" style="margin-top:var(--space-5);">
    <label for="roth-conversion">Amount You're Considering Converting to Roth</label>
    <input type="number" id="roth-conversion" min="0" step="1000" placeholder="e.g. 50000" inputmode="numeric" />
  </div>
  <button type="button" class="btn btn-primary" style="margin-top:var(--space-6);" data-roth-calculate>Estimate Tax Impact</button>
  <div class="mini-calc-result" data-roth-result hidden>
    <div class="mini-calc-result-grid">
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-roth-out-tax>&mdash;</span>
        <span class="mini-calc-result-caption">Estimated additional federal tax on this conversion</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-roth-out-rate>&mdash;</span>
        <span class="mini-calc-result-caption">Marginal rate applied to the conversion</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-roth-out-before>&mdash;</span>
        <span class="mini-calc-result-caption">Bracket before conversion</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-roth-out-after>&mdash;</span>
        <span class="mini-calc-result-caption">Bracket after conversion</span>
      </div>
    </div>
  </div>
  <p class="mini-calc-note">Based on 2026 federal marginal tax brackets for ordinary income. Does not account for state taxes, the standard deduction or other deductions, credits, Medicare IRMAA surcharges, or the net investment income tax. This is an educational estimate only, not tax advice &mdash; individual circumstances vary, and we recommend reviewing any conversion with a qualified tax professional before proceeding.</p>
</div>
"""

FIN_CALCULATOR_HTML = """
<div class="mini-calc" data-fin-calculator>
  <p class="mini-calc-label">Estimate your Financial Independence Number</p>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="fin-current-age">Current Age</label>
      <input type="number" id="fin-current-age" min="0" max="100" step="1" placeholder="e.g. 45" inputmode="numeric" />
    </div>
    <div class="field" data-fin-field="retirement-age">
      <label for="fin-retirement-age">Desired Retirement Age</label>
      <input type="number" id="fin-retirement-age" min="0" max="100" step="1" placeholder="e.g. 65" inputmode="numeric" />
      <small class="error">Retirement age must be greater than your current age.</small>
    </div>
    <div class="field">
      <label for="fin-income">Desired Annual Income in Retirement</label>
      <input type="number" id="fin-income" min="0" step="1000" placeholder="e.g. 100000" inputmode="numeric" />
    </div>
    <div class="field">
      <label for="fin-savings">Current Investment &amp; Retirement Savings</label>
      <input type="number" id="fin-savings" min="0" step="1000" placeholder="e.g. 250000" inputmode="numeric" />
    </div>
    <div class="field">
      <label for="fin-monthly-savings">Amount You're Currently Saving Each Month</label>
      <input type="number" id="fin-monthly-savings" min="0" step="50" placeholder="e.g. 1500" inputmode="numeric" />
    </div>
    <div class="field">
      <label for="fin-return-rate">Expected Average Annual Rate of Return (%)</label>
      <input type="number" id="fin-return-rate" min="0" max="20" step="0.1" placeholder="e.g. 6" inputmode="decimal" />
    </div>
  </div>
  <button type="button" class="btn btn-primary" style="margin-top:var(--space-6);" data-fin-calculate>Calculate My Number</button>
  <div class="mini-calc-result" data-fin-result hidden>
    <div class="mini-calc-result-grid">
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-fin-out-number>&mdash;</span>
        <span class="mini-calc-result-caption">Your Financial Independence Number (desired income &times; 25)</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-fin-out-projected>&mdash;</span>
        <span class="mini-calc-result-caption">Projected balance at retirement based on your current plan</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-fin-out-progress>&mdash;</span>
        <span class="mini-calc-result-caption">Projected progress toward your number</span>
      </div>
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-fin-out-additional>&mdash;</span>
        <span class="mini-calc-result-caption">Additional monthly savings that may help close the gap by retirement</span>
      </div>
    </div>
  </div>
  <p class="mini-calc-note">This estimate uses a common guideline (desired annual income &times; 25, based on an approximate 4% withdrawal rate) and a simplified compounding projection based on the figures you enter. It does not account for taxes, inflation, Social Security, pensions, investment fees, or market volatility, and actual results will vary based on individual circumstances. This is an educational estimate only, not individualized investment, tax, or financial advice &mdash; we recommend reviewing your specific situation with a qualified financial professional.</p>
</div>
"""

DIME_CALCULATOR_HTML = """
<div class="mini-calc" data-dime-calculator>
  <p class="mini-calc-label">Estimate a potential life insurance coverage amount</p>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="dime-debt">Outstanding Debt (not including mortgage)</label>
      <input type="number" id="dime-debt" min="0" step="500" placeholder="e.g. 25000" inputmode="numeric" />
    </div>
    <div class="field">
      <label for="dime-income">Annual Income to Replace</label>
      <input type="number" id="dime-income" min="0" step="1000" placeholder="e.g. 80000" inputmode="numeric" />
    </div>
    <div class="field">
      <label for="dime-mortgage">Remaining Mortgage Balance</label>
      <input type="number" id="dime-mortgage" min="0" step="1000" placeholder="e.g. 250000" inputmode="numeric" />
    </div>
    <div class="field">
      <label for="dime-education">Future Education Costs &amp; Final Expenses</label>
      <input type="number" id="dime-education" min="0" step="1000" placeholder="e.g. 60000" inputmode="numeric" />
    </div>
  </div>
  <button type="button" class="btn btn-primary" style="margin-top:var(--space-6);" data-dime-calculate>Estimate My Coverage Need</button>
  <div class="mini-calc-result" data-dime-result hidden>
    <div class="mini-calc-result-grid">
      <div class="mini-calc-result-tile">
        <span class="mini-calc-result-figure" data-dime-out-total>&mdash;</span>
        <span class="mini-calc-result-caption">Total estimated life insurance need (Debt + Income &times;10 + Mortgage + Education/Expenses)</span>
      </div>
    </div>
  </div>
  <p class="mini-calc-note">DIME is an educational framework that adds together your outstanding <strong>D</strong>ebt, ten times your annual <strong>I</strong>ncome, your remaining <strong>M</strong>ortgage balance, and future <strong>E</strong>ducation or final expenses to arrive at a simplified estimate. It does not account for life insurance coverage or savings you may already have, other income sources, health factors, inflation, or your broader financial plan, and actual needs vary by individual circumstances. This is an educational estimate only, not individualized insurance or financial advice &mdash; we recommend reviewing your specific situation with a qualified, licensed insurance professional.</p>
</div>
"""

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
        ("Retirement Planning", "Evaluating how your current savings, income sources, and timeline align with your retirement goals.", RMD_CALCULATOR_HTML),
        ("Asset Optimization", "Reviewing how assets are positioned across account types with an eye toward tax efficiency and long-term goals."),
        ("Tax-Efficient Wealth Strategies", "Identifying strategies that may help manage your tax exposure over time, subject to applicable rules."),
        ("Life Insurance Planning", "Evaluating protection and planning strategies suited to your income replacement and legacy goals."),
        ("Annuity Planning", "Reviewing whether annuity strategies may have a role in your retirement income plan, including their costs and terms."),
        ("Roth Conversion Planning", "Analyzing whether converting pre-tax assets may align with your long-term tax and income goals.", ROTH_CALCULATOR_HTML),
        ("Estate &amp; Legacy Planning", "Coordinating with your attorney to help align your financial plan with your estate planning documents."),
    ],
    feature_image="assets/images/planning-abstract.webp",
    feature_alt="Abstract representation of long-term financial growth",
    quote="Retirement income planning is less about any single account and more about how all of them work together.",
    meta_title="Advanced Financial Planning | Opulence Venture Group",
    meta_description="Retirement planning, asset optimization, tax-efficient wealth strategies, Roth conversion planning, and estate coordination from Opulence Venture Group.",
    schedule_items=[
        ("schedule-advanced-planning", "Schedule an Advanced Planning Consultation", "https://calendly.com/apdivision/retirement-planning-clone"),
    ],
    show_get_started_section=False,
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
    schedule_items=[
        ("schedule-business-owner", "Schedule a Business Strategy Session", "https://calendly.com/apdivision/business-strategies"),
    ],
    show_get_started_section=False,
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
        ("Retirement Income Planning", "Sequencing income sources with the goal of supporting your lifestyle throughout retirement.", RMD_CALCULATOR_HTML),
        ("Legacy Planning", "Clarifying your legacy goals and how your financial and estate plans may help support them."),
        ("Life Insurance Strategies", "Evaluating how life insurance strategies may fit into your broader wealth transfer and legacy goals."),
    ],
    feature_image="assets/images/legacy-heirloom.webp",
    feature_alt="Antique pocket watch and fountain pen representing legacy planning",
    quote="Legacy planning isn't just about what you leave behind &mdash; it's about how clearly your wishes are carried out.",
    meta_title="Wealth &amp; Legacy Planning | Opulence Venture Group",
    meta_description="Estate planning coordination, wealth transfer, retirement income planning, and legacy strategies for families from Opulence Venture Group.",
    schedule_items=[
        ("schedule-wealth-legacy", "Schedule a Wealth &amp; Legacy Session", "https://calendly.com/apdivision/estateplanning"),
    ],
    show_get_started_section=False,
)

# ---- Capital Gains Tax Strategies ------------------------------------------
build_service_page(
    filename="capital-gains-tax-strategies.html",
    eyebrow="Capital Gains Tax Strategies",
    h1="Capital Gains Tax Strategies",
    intro_paragraphs=[
        "Selling a business, an investment property, or a concentrated stock position can create a significant tax event. The timing, structure, and sequencing of that sale can meaningfully affect what you ultimately keep.",
        "We help clients evaluate the planning options available around asset sales and investment gains well before a transaction happens, so decisions are made deliberately rather than at the last minute. Every strategy below is subject to applicable rules and individual circumstances vary &mdash; we coordinate closely with your CPA and attorney throughout.",
    ],
    audience_chips=["Business Sellers", "Real Estate Investors", "Concentrated Stock Holders", "Pre-Liquidity Founders"],
    focus_items=[
        ("Sale Timing &amp; Structuring", "Evaluating when and how an asset sale is structured, including installment sale options, which may help distribute the tax impact of a transaction over time."),
        ("1031 Exchange Planning", "For qualifying real estate, reviewing whether a like-kind exchange may help defer gain recognition as part of a broader portfolio strategy, subject to applicable rules and deadlines."),
        ("Qualified Opportunity Zone Review", "Evaluating whether reinvesting eligible gains into a Qualified Opportunity Fund may align with your investment goals and timeline, subject to applicable rules."),
        ("Tax-Loss Harvesting", "Reviewing a portfolio for opportunities to realize losses that may help offset realized gains elsewhere, as part of an ongoing, coordinated tax strategy."),
        ("Deferred Sales Trust", "Reviewing whether a deferred sales trust structure may help spread the recognition of a gain over time as part of a coordinated sale strategy, subject to applicable rules."),
        ("Primary Residence Exclusion Planning", "Evaluating how the primary residence gain exclusion may apply to a home sale and how ownership, use, and timing requirements factor into that planning."),
        ("Tax Strategies for High-Income Earners", "Coordinating capital gains planning with a high-income earner's broader tax picture, including timing, income bracket management, and other applicable planning considerations."),
    ],
    feature_image="assets/images/capital-gains-abstract.webp",
    feature_alt="Abstract ascending staircase graphic representing structured capital gains planning",
    quote="The tax outcome of a sale is often decided long before the closing date &mdash; in how it was planned.",
    meta_title="Capital Gains Tax Strategies | Opulence Venture Group",
    meta_description="Sale timing, 1031 exchange, opportunity zone, tax-loss harvesting, and basis planning strategies for business sales, real estate, and concentrated stock positions.",
)

# ==========================================================================
# CONSULTANTS / OUR TEAM
# ==========================================================================
consultants_body = f"""
<section class="page-header">
  <div class="page-header-media"><img src="assets/images/team-consultation.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    {breadcrumb("Our Team", "consultants.html")}
    <div class="page-header-content">
      <div class="eyebrow">Our Team</div>
      <h1>Meet Our Consultants</h1>
      <p>A team of advisors covering business strategy, payroll, and retirement income &mdash; coordinated around a single plan for you.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <p class="body-lg reveal">Every client works with a dedicated point of contact, supported by a broader team with specialized experience across business advisory, payroll, and retirement income planning. Headshots and direct contact information for each team member are being added as they join &mdash; in the meantime, reach out through our <a href="contact.html">contact page</a> and we'll connect you with the right person.</p>

    <div class="consultant-role-group" style="margin-top:var(--space-16);">
      <div class="consultant-role-group-title reveal">Founder</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-1.webp", "Portrait of Frank Valadez, Founder of Opulence Venture Group", "Frank Valadez", "Founder", "Oversees each client's overall plan, coordinating business, tax, retirement, and legacy strategy into one integrated approach.")}
      </div>
    </div>

    <div class="consultant-role-group">
      <div class="consultant-role-group-title reveal">Principal | Wealth Advisor</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-miles-amodeo.webp", "Portrait of Miles B. Amodeo, Principal and Wealth Advisor at Opulence Venture Group", "Miles B. Amodeo, CFP&reg;, ChFC&reg;, EA", "Principal | Wealth Advisor", "Works directly with clients to coordinate wealth, tax, and retirement strategy as part of an integrated plan.")}
      </div>
    </div>

    <div class="consultant-role-group">
      <div class="consultant-role-group-title reveal">Capital Gains Strategist</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-ariocha-salas.webp", "Portrait of Ariocha Salas, Capital Gains Strategist at Opulence Venture Group", "Ariocha Salas", "Capital Gains Strategist", "Helps clients evaluate timing, structuring, and basis strategies around the sale of businesses, real estate, and concentrated positions.")}
      </div>
    </div>

    <div class="consultant-role-group">
      <div class="consultant-role-group-title reveal">Business Advisors</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-anthony-cordova.webp", "Portrait of Anthony Cordova, Business Advisor at Opulence Venture Group", "Anthony Cordova", "Business Advisor", "Works with business owners on structure, cash flow, and growth-stage planning decisions.")}
        {consultant_card("assets/images/consultant-seth-hallows.webp", "Portrait of Seth Hallows, Business Advisor at Opulence Venture Group", "Seth Hallows", "Business Advisor", "Supports business owners in evaluating structure, succession, and operational planning strategies.")}
      </div>
    </div>

    <div class="consultant-role-group">
      <div class="consultant-role-group-title reveal">Payroll Services</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-ajay-fay.webp", "Portrait of Ajay Fay, Payroll Services Specialist at Opulence Venture Group", "Ajay Fay", "Payroll Services Specialist", "Helps business clients coordinate payroll setup and administration alongside their broader financial plan.")}
      </div>
    </div>

    <div class="consultant-role-group">
      <div class="consultant-role-group-title reveal">Retirement Income Specialists</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-nick-hernandez.webp", "Portrait of Nick Hernandez, Retirement Income Specialist at Opulence Venture Group", "Nick Hernandez", "Retirement Income Specialist", "Focuses on sequencing retirement income sources to help support clients' lifestyle goals.")}
      </div>
    </div>

    <div class="consultant-role-group">
      <div class="consultant-role-group-title reveal">Life Insurance Specialist</div>
      <div class="consultant-grid reveal">
        {consultant_card("assets/images/consultant-josh-stachurski.webp", "Portrait of Josh Stachurski, Life Insurance Specialist at Opulence Venture Group", "Josh Stachurski", "Life Insurance Specialist", "Helps clients evaluate life insurance strategies as part of their overall financial plan.")}
      </div>
    </div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>Team roles and responsibilities are provided for general informational purposes and may be updated as our team grows. Working with any member of our team does not create a guarantee of any specific outcome. Please consult a qualified, licensed tax, legal, or financial professional regarding your specific situation.</p>
  </div>
</section>

__CTA__
"""

consultants_body = consultants_body.replace("__CTA__", cta_band(
    "Want to talk with the right person on our team?",
    "Schedule a complimentary consultation and we'll connect you with the advisor best suited to your goals.",
))

page(
    "consultants.html",
    "Our Team | Opulence Venture Group",
    "Meet the Opulence Venture Group team \u2014 business advisors, payroll services, and retirement income specialists working alongside our founder to coordinate your plan.",
    "assets/images/team-consultation.webp",
    consultants_body,
)

# ==========================================================================
# CAREERS
# ==========================================================================
careers_body = f"""
<section class="page-header">
  <div class="page-header-media"><img src="assets/images/team-consultation.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    {breadcrumb("Careers", "careers.html")}
    <div class="page-header-content">
      <div class="eyebrow">Careers</div>
      <h1>Build Your Career With Opulence Venture Group</h1>
      <p>We're growing our team of agents, advisors, and strategic partners. Tell us a bit about yourself and how you'd like to get involved.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="eyebrow reveal">Ways to Get Involved</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);max-width:34ch;">Become Part of the Vision</h2>
    <div class="path-grid reveal">
      {path_card(1, "Agent", "Build a practice helping individuals and families with insurance and financial-services solutions, backed by our training and support.", ["Field support and mentorship as you build your book of business", "Access to our marketing and client-service resources", "Coordinated case support for complex client needs"], "#careers-form", "Request Info")}
      {path_card(2, "Advisor", "Join as a financial or wealth advisor and work alongside our team to deliver coordinated planning across tax, retirement, and legacy strategy.", ["Collaborative planning environment across specialties", "Support pursuing relevant licensing, designations, and continuing education", "A client base that values integrated, long-term planning"], "#careers-form", "Request Info")}
      {path_card(3, "Strategic Partner", "Explore a referral or strategic partnership if you're a CPA, attorney, or other professional who works with business owners and families.", ["Coordinated planning for shared clients", "Clear communication and defined referral processes", "A team focused on long-term client relationships, not one-off transactions"], "#careers-form", "Request Info")}
    </div>
  </div>
</section>

<section class="section section--surface" id="careers-form">
  <div class="container--wide">
    <div class="grid grid--2 reveal" style="gap:var(--space-16);align-items:flex-start;">
      <div>
        <div class="eyebrow">Request More Info</div>
        <h2 class="section-title" style="margin-top:var(--space-3);margin-bottom:var(--space-6);max-width:28ch;">Tell us about your interest</h2>
        <p class="body-lg" style="margin-bottom:var(--space-8);max-width:56ch;">Share a few details and we'll follow up to talk through next steps. Prefer to talk right away? Schedule a call using the calendar to the right.</p>

        <form data-careers-form novalidate>
          <div class="form-grid form-grid--2">
            <div class="field" data-field="name">
              <label for="careers-name">Full Name</label>
              <input type="text" id="careers-name" name="name" autocomplete="name" required />
              <small class="error" data-error-for="name">Please enter your name.</small>
            </div>
            <div class="field" data-field="email">
              <label for="careers-email">Email</label>
              <input type="email" id="careers-email" name="email" autocomplete="email" required />
              <small class="error" data-error-for="email">Please enter a valid email address.</small>
            </div>
          </div>
          <div class="form-grid form-grid--2" style="margin-top:var(--space-6);">
            <div class="field" data-field="phone">
              <label for="careers-phone">Phone (optional)</label>
              <input type="tel" id="careers-phone" name="phone" autocomplete="tel" />
            </div>
            <div class="field" data-field="interest">
              <label for="careers-interest">I'm Interested In</label>
              <select id="careers-interest" name="interest" required>
                <option value="">Select one</option>
                <option value="Agent">Becoming an Agent</option>
                <option value="Advisor">Becoming an Advisor</option>
                <option value="Strategic Partner">Strategic Partnership</option>
                <option value="Not sure yet">Not Sure Yet</option>
              </select>
              <small class="error" data-error-for="interest">Please select an option.</small>
            </div>
          </div>
          <div class="field" style="margin-top:var(--space-6);">
            <label for="careers-message">Tell Us a Bit About Yourself (optional)</label>
            <textarea id="careers-message" name="message" placeholder="Your background, experience, or what you're looking for..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:var(--space-7);">Send Inquiry</button>
          <p class="form-note">Submitting will open your email app with your details pre-filled so you can review before sending &mdash; nothing is sent automatically.</p>
        </form>
        <div data-careers-form-success hidden style="margin-top:var(--space-6);padding:var(--space-5);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);">
          <p style="margin:0;">Thanks &mdash; your email app should have opened with a pre-filled message. If it didn't, email us directly at <a href="mailto:info@opulenceinvestments.net">info@opulenceinvestments.net</a>.</p>
        </div>
      </div>

      <div>
        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
        {calendly_embed_block("careers-schedule", "Prefer to talk directly? Schedule a call", "https://calendly.com/apdivision/careers")}
        <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
      </div>
    </div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>Career and partnership opportunities described on this page are general in nature and do not constitute an offer of employment, a guarantee of income, or a promise of any specific business outcome. Actual opportunities, compensation structures, and licensing requirements vary by role and individual circumstances, and some roles may require appropriate state licensing or registration. Submitting an inquiry does not create any contractual or working relationship with Opulence Venture Group.</p>
  </div>
</section>

__CTA__
"""

careers_body = careers_body.replace("__CTA__", cta_band(
    "Ready to take the next step?",
    "Reach out today and let's talk about how you can get involved with Opulence Venture Group.",
    primary_label="Request Info",
    primary_href="#careers-form",
))

page(
    "careers.html",
    "Careers | Join Opulence Venture Group",
    "Explore career and partnership opportunities with Opulence Venture Group as an agent, advisor, or strategic partner.",
    "assets/images/team-consultation.webp",
    careers_body,
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
    <div class="eyebrow reveal">Strategic Partners</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-5);max-width:32ch;">Specialists we work alongside</h2>
    <p class="body-lg reveal" style="margin-bottom:var(--space-10);max-width:64ch;">For specific business-formation and specialty tax needs outside our core planning work, we coordinate closely with a small network of strategic partner firms. Opulence Venture Group is affiliated with these firms, and any engagement with them is coordinated as part of your broader relationship with us.</p>
    <div class="partner-grid reveal">
      <div class="partner-card">
        <div class="partner-card-logo"><img src="assets/images/partner-prime.png" alt="Prime Corporate Services logo" loading="lazy" decoding="async" width="600" height="199" /></div>
        <h3>Prime Corporate Services</h3>
        <p>Entity formation, business credit development, and specialty tax preparation for entrepreneurs and small business owners. If you would like to speak directly with Prime about setting up an entity or exploring another Prime service, schedule a call below.</p>
        <a class="btn btn-primary" style="align-self:flex-start;" href="https://www.primecorporateservices.com/entity-formation-3/?utm_source=GFI&amp;utm_medium=LP&amp;utm_campaign=1668&amp;uid=1109&amp;oid=2&amp;affid=1668" target="_blank" rel="noopener noreferrer">Schedule a Call</a>
      </div>
      <div class="partner-card">
        <div class="partner-card-logo"><img src="assets/images/partner-irongate.png" alt="Irongate Business Advisors logo" loading="lazy" decoding="async" width="600" height="239" /></div>
        <h3>Irongate Business Advisors</h3>
        <p>Wellness and supplemental benefit solutions benefit both employers and employees. Employers see a net FICA tax savings of up to $1,186 per W2 employee per year, while employees gain access to additional pre-tax wellness benefits that supplement their existing health coverage &mdash; all at no out-of-pocket expense to either party.</p>
        <div class="mini-calc" style="margin-top:0;" data-fica-calculator>
          <p class="mini-calc-label" style="font-size:var(--text-base);margin-bottom:var(--space-5);">Calculate Your Potential FICA Savings</p>
          <div class="field">
            <label for="fica-employees">Number of W2 Employees</label>
            <input type="number" id="fica-employees" min="0" step="1" placeholder="Enter number of employees" inputmode="numeric" />
            <p class="mini-calc-note" style="margin-top:0;">Enter the total number of W2 employees for calculation.</p>
          </div>
          <button type="button" class="btn btn-primary" style="margin-top:var(--space-6);width:100%;" data-fica-calculate>Calculate Savings</button>
          <div class="mini-calc-result" data-fica-result hidden>
            <p class="mini-calc-label" style="margin-bottom:var(--space-3);">Your Estimated Annual Savings</p>
            <div class="mini-calc-result-tile">
              <span class="mini-calc-result-figure" data-fica-out-savings>&mdash;</span>
              <span class="mini-calc-result-caption">Based on up to $1,186 in FICA tax savings per W2 employee per year. Actual savings may vary depending on the specific plan selected for your company.</span>
            </div>
            <a class="btn btn-primary" style="margin-top:var(--space-5);width:100%;" href="https://benefits.igbusinessadvisors.com/?ref=20465" target="_blank" rel="noopener noreferrer">Schedule Free Consultation</a>
          </div>
          <p class="mini-calc-note">This calculator provides an estimate based on IronGate Business Advisors&rsquo; published benefit assumptions for a qualifying Section 125 benefits plan. Actual savings depend on the specific plan selected, employee participation, and individual circumstances, which vary. Provided for illustration purposes only and not tax or legal advice &mdash; consult a qualified professional before implementing any plan.</p>
        </div>
      </div>
    </div>
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
# FAQ
# ==========================================================================
faq_body = """
<section class="page-header">
  <div class="page-header-media"><img src="assets/images/resources-desk.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    __BREADCRUMB__
    <div class="page-header-content">
      <div class="eyebrow">FAQ</div>
      <h1>Frequently asked questions &amp; planning topics</h1>
      <p>Educational perspectives on business strategy, tax-efficient planning, and legacy decisions, plus answers to the questions we hear most often. Every situation is different &mdash; use these as a starting point for a conversation, not a substitute for one.</p>
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

faq_body = faq_body.replace("__BREADCRUMB__", breadcrumb("FAQ", "faq.html"))
faq_body = faq_body.replace("__TOPICS__", accordion_group("topics", [
    ("What is my Financial Independence Number?", "Your Financial Independence Number is an estimate of the investment balance that may be needed to support your desired retirement income, based on a common 4% withdrawal guideline. Use the calculator below to estimate your number and see how your current savings plan is tracking.", FIN_CALCULATOR_HTML),
    ("How Much Life Insurance Do I Really Need?", "DIME stands for Debt, Income (&times;10), Mortgage, and Education or Expenses &mdash; a simple framework some families use to start estimating how much life insurance coverage may help protect against the loss of an income earner. Use the calculator below to get a starting estimate for your situation.", DIME_CALCULATOR_HTML),
    ("Understanding Roth Conversion Timing", "The tax impact of a Roth conversion can vary significantly depending on your current income, future tax expectations, and the timing of the conversion. A coordinated review can help you evaluate whether a conversion strategy may align with your broader retirement and tax goals.", ROTH_CALCULATOR_HTML),
    ("Questions to Consider Before a Business Sale", "A business sale involves more than negotiating a price. Structure, tax treatment, timing, and post-sale planning can all significantly affect the outcome, and are worth evaluating well before a transaction is finalized. We offer a complimentary business valuation to help you understand where your business currently stands before you begin evaluating a sale."),
    ("How Buy-Sell Agreements Support Business Continuity", "A properly designed and funded buy-sell agreement can help provide clarity for owners, partners, and their families if an owner passes away, becomes disabled, or exits the business."),
    ("Coordinating Estate Plans with Business Succession", "For business owners, estate planning and succession planning are closely connected. Reviewing both together can help avoid gaps between what your estate documents say and what actually happens to your business."),
    ("Tax Considerations for Real Estate Investors", "Entity structure, depreciation strategy, and cash-flow planning can all affect the tax efficiency of a real estate portfolio, and are worth revisiting as a portfolio grows."),
    ("Retirement Income Planning for Business Owners", "Business owners often lack a traditional pension or employer retirement plan, which makes coordinated planning around business cash flow, personal savings, and eventual business sale proceeds especially important."),
]))
faq_body = faq_body.replace("__FAQ__", accordion_group("faq", [
    ("What is the difference between business consulting and advanced financial planning?", "Business consulting generally focuses on how your business is structured and run, while advanced financial planning generally focuses on your personal retirement, tax, and estate strategy. Many clients benefit from both, since business and personal finances are often closely connected."),
    ("Do I need to already have a CPA or attorney to work with you?", "Not necessarily. We can work alongside your existing CPA and attorney, or help you identify professionals to consult as part of your plan. We do not provide tax or legal advice ourselves."),
    ("Is this only for large businesses or high-net-worth individuals?", "No. We work with a range of business owners, professionals, and families, including those earlier in their planning journey. The consultation is designed to help determine whether our approach may be a good fit for your situation."),
    ("How does the consultation process work?", "It typically begins with a complimentary conversation about your goals and current situation, followed by a more detailed review if it makes sense to move forward together."),
]))
faq_body = faq_body.replace("__CTA__", cta_band(
    "Have a specific question in mind?",
    "Schedule a consultation and we'll walk through how it may apply to your situation.",
))

page(
    "faq.html",
    "FAQ | Planning Topics &amp; Common Questions | Opulence Venture Group",
    "Frequently asked questions and educational planning topics on business succession, tax-efficient planning, Roth conversions, estate planning, and retirement income from Opulence Venture Group.",
    "assets/images/resources-desk.webp",
    faq_body,
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
      <div class="reveal" id="consultation-form">
        <div class="eyebrow">Get Started</div>
        <h2 class="section-title" style="margin-top:var(--space-3);margin-bottom:var(--space-8);max-width:26ch;">Pick a time that works for you</h2>
        <p class="body-lg" style="margin-bottom:var(--space-8);max-width:56ch;">Choose an available time below for a complimentary initial conversation. We'll follow up with details before your scheduled time.</p>

        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
        <div class="calendly-embed">
          <div class="calendly-inline-widget" data-url="https://calendly.com/apdivision/free-consultation?hide_gdpr_banner=1&amp;background_color=ffffff&amp;text_color=0f1e2e&amp;primary_color=1f5c8c" style="min-width:320px;height:750px;"></div>
        </div>
        <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
      </div>

      <div class="reveal section--dark" style="padding:var(--space-10);border-radius:var(--radius-lg);">
        <div class="eyebrow">Direct Contact</div>
        <h3 style="font-family:var(--font-display);font-weight:400;font-size:var(--text-lg);margin-top:var(--space-3);margin-bottom:var(--space-6);color:#eef4fa;">Prefer to reach out directly?</h3>

        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.67 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.85.54 2.81.67A2 2 0 0 1 22 16.92z"/></svg>
          <div><strong>Phone</strong><a href="tel:+14087103457">(408) 710-3457</a></div>
        </div>
        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
          <div><strong>Email</strong><a href="mailto:info@opulenceinvestments.net">info@opulenceinvestments.net</a></div>
        </div>
        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div><strong>Office Hours</strong><span>Monday &ndash; Friday, 9:00 AM &ndash; 5:00 PM</span></div>
        </div>
        <div class="contact-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <div><strong>Consultations</strong><span>Complimentary initial consultation, in person or virtual.</span></div>
        </div>

        <div class="contact-alt-cta">
          <p>Licensed agents submitting a case for advanced planning review:</p>
          <a class="btn btn-outline btn-block" href="agent-discovery-form.html">Agent Discovery Form</a>
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


# ==========================================================================
# AGENT DISCOVERY FORM
# ==========================================================================

NEED_OPTIONS = [
    "Business Succession or Exit Planning",
    "Estate Planning &amp; Wealth Transfer",
    "Tax Reduction / Tax Deferral Strategies",
    "Retirement Income Optimization",
    "Premium Financing / Large Life Insurance Cases",
    "Executive Benefits or Key Person Planning",
    "Prime Corporate Services (Entity Creation, Fundability, Tax Services)",
    "Preventative Care Benefits Program (FICA Tax Reduction)",
]


def _choice(name, value, label=None):
    return (
        f'<label class="choice"><input type="radio" name="{name}" value="{value}" />'
        f'<span>{label or value}</span></label>'
    )


def choice_group(name, values, stack=False):
    cls = "choice-group choice-group--stack" if stack else "choice-group"
    return f'<div class="{cls}">' + "".join(_choice(name, v) for v in values) + "</div>"


def check_list(name, options):
    items = "".join(
        f'<label class="check-item" data-checked="false">'
        f'<input type="checkbox" name="{name}" value="{o}" /><span>{o}</span></label>'
        for o in options
    )
    return f'<div class="check-list">{items}</div>'


discovery_body = """
<section class="page-header">
  <div class="page-header-media"><img src="assets/images/contact-lobby.webp" alt="" loading="eager" decoding="async" width="1920" height="1200" /></div>
  <div class="container--wide">
    __BREADCRUMB__
    <div class="page-header-content">
      <div class="eyebrow">Advance Planning Division</div>
      <h1>Agent Discovery Form</h1>
      <p>Submit a case for advanced planning review. Complete the profile below, then book a time with the Advanced Planning team.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:var(--content-default);">
    <form data-discovery-form novalidate>

      <div class="form-section">
        <h2 class="form-section-title">Agent Information</h2>
        <div class="form-grid form-grid--2">
          <div class="field" data-field="agentFirst">
            <label for="d-agent-first">Agent First Name</label>
            <input type="text" id="d-agent-first" name="agentFirst" autocomplete="given-name" required />
            <small class="error">Please enter your first name.</small>
          </div>
          <div class="field" data-field="agentLast">
            <label for="d-agent-last">Agent Last Name</label>
            <input type="text" id="d-agent-last" name="agentLast" autocomplete="family-name" required />
            <small class="error">Please enter your last name.</small>
          </div>
        </div>
        <div class="form-grid form-grid--2">
          <div class="field" data-field="agentEmail">
            <label for="d-agent-email">Agent Email</label>
            <input type="email" id="d-agent-email" name="agentEmail" autocomplete="email" required />
            <small class="error">Please enter a valid email address.</small>
          </div>
          <div class="field" data-field="agentPhone">
            <label for="d-agent-phone">Agent's Phone Number</label>
            <input type="tel" id="d-agent-phone" name="agentPhone" autocomplete="tel" required />
            <small class="error">Please enter a phone number.</small>
          </div>
        </div>
        <div class="form-grid form-grid--2">
          <div class="field" data-field="agentState">
            <label for="d-agent-state">Your State of Residence</label>
            <input type="text" id="d-agent-state" name="agentState" placeholder="State / Province" required />
            <small class="error">Please enter your state.</small>
          </div>
          <div class="field" data-field="emdFirst">
            <label for="d-emd-first">Your EMD's First Name</label>
            <input type="text" id="d-emd-first" name="emdFirst" required />
            <small class="error">Please enter your EMD's first name.</small>
          </div>
        </div>
        <div class="field" data-field="emdLast">
          <label for="d-emd-last">Your EMD's Last Name (optional)</label>
          <input type="text" id="d-emd-last" name="emdLast" />
        </div>
      </div>

      <div class="form-section">
        <h2 class="form-section-title">Client Profile</h2>
        <div class="field" data-field="clientName">
          <label for="d-client-name">Client Name</label>
          <input type="text" id="d-client-name" name="clientName" required />
          <small class="error">Please enter the client's name.</small>
        </div>
        <div class="field" data-field="clientType" data-choice="clientType">
          <span class="field-legend">Who is the client?</span>
          __CLIENT_TYPE__
          <small class="error">Please select one.</small>
        </div>
        <div class="form-grid form-grid--2">
          <div class="field" data-field="clientState">
            <label for="d-client-state">Client's State of Residence</label>
            <input type="text" id="d-client-state" name="clientState" required />
            <small class="error">Please enter the client's state.</small>
          </div>
          <div class="field" data-field="income">
            <label for="d-income">Annual Income Range (optional)</label>
            <select id="d-income" name="income">
              <option value="">Select one</option>
              <option value="Under $250k">Under $250k</option>
              <option value="$250k-$1M">$250k &ndash; $1M</option>
              <option value="$1M-$5M">$1M &ndash; $5M</option>
              <option value="$5M +">$5M +</option>
            </select>
          </div>
        </div>
        <div class="field" data-field="netWorth">
          <span class="field-legend">Approximate Client Net Worth (optional)</span>
          __NET_WORTH__
        </div>
      </div>

      <div class="form-section">
        <h2 class="form-section-title">Case Type / Area of Need</h2>
        <div class="field" data-field="needs" data-choice="needs">
          <span class="field-legend">Check all that apply</span>
          __NEEDS__
          <small class="error">Please select at least one area of need.</small>
        </div>
      </div>

      <div class="form-section">
        <h2 class="form-section-title">Case Readiness &amp; Engagement</h2>
        <div class="field" data-field="stage" data-choice="stage">
          <span class="field-legend">What stage is the client at right now?</span>
          __STAGE__
          <small class="error">Please select one.</small>
        </div>
        <div class="field" data-field="advisor" data-choice="advisor">
          <span class="field-legend">Is there a CPA, attorney, or other advisor involved?</span>
          __ADVISOR__
          <small class="error">Please select one.</small>
        </div>
        <div class="field" data-field="timeframe">
          <label for="d-timeframe">Client's Timeframe for Making Decisions (optional)</label>
          <select id="d-timeframe" name="timeframe">
            <option value="">Select one</option>
            <option value="0-3 Months">0 &ndash; 3 Months</option>
            <option value="3-6 Months">3 &ndash; 6 Months</option>
            <option value="6-12 Months">6 &ndash; 12 Months</option>
            <option value="12+ Months">12+ Months</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h2 class="form-section-title">Expectations</h2>
        <div class="field" data-field="discussed" data-choice="discussed">
          <span class="field-legend">Have you already discussed advanced planning concepts with the client?</span>
          __DISCUSSED__
          <small class="error">Please select one.</small>
        </div>
        <div class="field" data-field="priorBusiness">
          <label for="d-prior">Have you already done life insurance or annuity business with this client through GFI? If so, please explain.</label>
          <textarea id="d-prior" name="priorBusiness" placeholder="Carriers, products, and approximate dates &mdash; or &ldquo;none.&rdquo;" required></textarea>
          <small class="error">Please provide an answer.</small>
        </div>
        <div class="field" data-field="outcome">
          <label for="d-outcome">What outcome is the client hoping to achieve?</label>
          <textarea id="d-outcome" name="outcome" placeholder="The result that matters most to them." required></textarea>
          <small class="error">Please describe the desired outcome.</small>
        </div>
        <div class="field" data-field="relationship">
          <label for="d-relationship">What is your relationship with the client?</label>
          <textarea id="d-relationship" name="relationship" placeholder="How you know them, and for how long." required></textarea>
          <small class="error">Please describe your relationship with the client.</small>
        </div>
        <div class="field" data-field="additional">
          <label for="d-additional">Additional Pertinent Information (optional)</label>
          <textarea id="d-additional" name="additional" placeholder="Anything else the planning team should know."></textarea>
        </div>
      </div>

      <div class="form-section">
        <h2 class="form-section-title">Calendar Availability</h2>
        <div class="book-strip">
          <p><strong>Book your case review</strong>Submit the form first, then choose a time with the Advanced Planning team.</p>
          <a class="btn btn-outline" href="https://calendly.com/apdivision/free-consultation" target="_blank" rel="noopener noreferrer">Book a Time</a>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:var(--space-10);">Submit Discovery Form</button>
      <p class="form-note">Submitted directly to the Advance Planning Division. You'll receive a confirmation by email with your case summary and the scheduling link.</p>
    </form>

    <div data-discovery-success hidden style="padding:var(--space-10);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);text-align:center;">
      <div class="eyebrow" style="justify-content:center;">Submitted</div>
      <h2 class="section-title" style="margin-top:var(--space-3);margin-bottom:var(--space-5);font-size:var(--text-xl);">Discovery form received</h2>
      <p class="body-lg" style="margin:0 auto var(--space-8);max-width:52ch;">Thank you &mdash; the Advanced Planning team will review this case and follow up. Reserve your case review time below.</p>
      <a class="btn btn-primary btn-lg" href="https://calendly.com/apdivision/free-consultation" target="_blank" rel="noopener noreferrer">Book Your Case Review</a>
      <p class="form-note" data-discovery-note style="margin-top:var(--space-6);"></p>
    </div>
  </div>
</section>

<section class="disclaimer">
  <div class="container">
    <p>This form is intended for licensed agents submitting a case for advanced planning review. Client information submitted here is used solely to evaluate and coordinate the case and is not sold to third parties. Nothing on this page constitutes tax, legal, or investment advice, and no strategy discussed is guaranteed. Please consult a qualified, licensed professional regarding any specific situation.</p>
  </div>
</section>
"""

discovery_body = discovery_body.replace("__BREADCRUMB__", breadcrumb("Agent Discovery Form", "agent-discovery-form.html"))
discovery_body = discovery_body.replace("__CLIENT_TYPE__", choice_group("clientType", ["Individual", "Trustee", "Business Owner", "Other"]))
discovery_body = discovery_body.replace("__NET_WORTH__", choice_group("netWorth", ["Under $1m", "$1m-$5m", "$5m-$10m", "$10M +"]))
discovery_body = discovery_body.replace("__NEEDS__", check_list("needs", NEED_OPTIONS))
discovery_body = discovery_body.replace("__STAGE__", choice_group("stage", ["Just exploring options", "Actively reviewing strategies", "Ready to implement a solution soon"], stack=True))
discovery_body = discovery_body.replace("__ADVISOR__", choice_group("advisor", ["Yes", "No", "Unsure"]))
discovery_body = discovery_body.replace("__DISCUSSED__", choice_group("discussed", ["Yes", "No"]))

page(
    "agent-discovery-form.html",
    "Agent Discovery Form | Advance Planning Division | Opulence Venture Group",
    "Licensed agents can submit a client case for advanced planning review with the Opulence Venture Group Advance Planning Division.",
    "assets/images/contact-lobby.webp",
    discovery_body,
    active="contact.html",
)
