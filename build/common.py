# Shared head / header / footer / mobile-menu templates for Opulence Venture Group

SITE_NAME = "Opulence Venture Group"
BASE_URL = "https://opulenceventuregroup.com"

NAV_ITEMS = [
    ("index.html", "Home"),
    ("about.html", "About"),
]

SERVICE_ITEMS = [
    ("business-consulting.html", "Business Consulting", "Structure, tax-efficiency, succession & executive strategy."),
    ("advanced-financial-planning.html", "Advanced Financial Planning", "Retirement, tax-efficient strategies & estate coordination."),
    ("business-owner-strategies.html", "Business Owner Strategies", "Cash flow, entity structure, compensation & risk."),
    ("wealth-legacy.html", "Wealth & Legacy", "Wealth transfer, retirement income & legacy planning."),
    ("capital-gains-tax-strategies.html", "Capital Gains Tax Strategies", "Timing, structuring & basis strategies for asset sales & gains."),
]

NAV_ITEMS_TAIL = [
    ("consultants.html", "Our Team"),
    ("resources.html", "Resources"),
    ("faq.html", "FAQ"),
    ("careers.html", "Careers"),
    ("contact.html", "Contact"),
]


def head(title, description, path, og_image="assets/images/hero-skyline.webp", jsonld=""):
    canonical = f"{BASE_URL}/{path}" if path != "index.html" else f"{BASE_URL}/"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="{description}" />
<link rel="canonical" href="{canonical}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="{SITE_NAME}" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:image" content="{BASE_URL}/{og_image}" />
<meta property="og:url" content="{canonical}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{BASE_URL}/{og_image}" />

<link rel="icon" href="assets/favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400..500&display=swap" rel="stylesheet" />
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap" rel="stylesheet" />

<link rel="stylesheet" href="base.css" />
<link rel="stylesheet" href="style.css" />
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js" defer></script>
{jsonld}
</head>
"""


def _service_dropdown(current_path):
    items = ""
    for href, label, desc in SERVICE_ITEMS:
        items += f'<a href="{href}"><strong>{label}</strong><small>{desc}</small></a>'
    return f"""<div class="nav-dropdown" data-open="false">
  <button class="nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true">
    Services
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
  </button>
  <div class="nav-dropdown-panel" role="menu">{items}</div>
</div>"""


def header(current_path):
    def link(href, label):
        current = ' aria-current="page"' if href == current_path else ""
        return f'<a href="{href}"{current}>{label}</a>'

    primary_links = "".join(link(h, l) for h, l in NAV_ITEMS)
    tail_links = "".join(link(h, l) for h, l in NAV_ITEMS_TAIL)

    return f"""<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="nav-bar">
    <a class="brand" href="index.html" aria-label="{SITE_NAME} — Home">
      <img src="assets/images/logo-icon-onwhite.png" alt="" width="34" height="34" />
      <img class="brand-word-img brand-word-light" src="assets/images/logo-wordmark-onwhite.png" alt="Opulence Venture Group" />
      <img class="brand-word-img brand-word-dark" src="assets/images/logo-wordmark-ondark.png" alt="Opulence Venture Group" />
    </a>
    <nav class="nav-primary" aria-label="Primary">
      {primary_links}
      {_service_dropdown(current_path)}
      {tail_links}
    </nav>
    <div class="nav-actions">
      <button class="theme-toggle" data-theme-toggle aria-label="Switch to dark mode"></button>
      <a class="btn btn-primary nav-cta" href="contact.html#consultation-form">Schedule a Consultation</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
</header>

<div class="mobile-menu" data-open="false" role="dialog" aria-modal="true" aria-label="Site menu">
  <div class="mobile-menu-header">
    <a class="brand" href="index.html" aria-label="{SITE_NAME} — Home">
      <img src="assets/images/logo-icon-onwhite.png" alt="" width="30" height="30" />
      <img class="brand-word-img brand-word-light" src="assets/images/logo-wordmark-onwhite.png" alt="Opulence Venture Group" />
      <img class="brand-word-img brand-word-dark" src="assets/images/logo-wordmark-ondark.png" alt="Opulence Venture Group" />
    </a>
    <button class="mobile-menu-close nav-toggle" aria-label="Close menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </div>
  <nav aria-label="Mobile">
    {"".join(f'<a href="{h}">{l}</a>' for h, l in NAV_ITEMS)}
    <button data-mobile-submenu-trigger aria-expanded="false" style="display:flex;align-items:center;justify-content:space-between;width:100%;font-family:var(--font-display);font-size:var(--text-lg);color:var(--color-text);padding:var(--space-3) 0;border-bottom:1px solid var(--color-divider);background:none;border-left:none;border-right:none;border-top:none;text-align:left;">
      Services
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    <div class="mobile-submenu" style="display:none;">
      {"".join(f'<a href="{h}">{l}</a>' for h, l, d in SERVICE_ITEMS)}
    </div>
    {"".join(f'<a href="{h}">{l}</a>' for h, l in NAV_ITEMS_TAIL)}
  </nav>
  <div class="mobile-menu-cta">
    <a class="btn btn-primary btn-block" href="contact.html#consultation-form">Schedule a Consultation</a>
  </div>
</div>
"""


def footer():
    service_links = "".join(f'<li><a href="{h}">{l}</a></li>' for h, l, d in SERVICE_ITEMS)
    return f"""<footer class="site-footer">
  <div class="container--wide">
    <div class="footer-grid">
      <div>
        <a class="footer-brand" href="index.html" aria-label="{SITE_NAME} — Home">
          <img src="assets/images/logo-icon-ondark.png" alt="" width="32" height="32" />
          <img class="footer-brand-word" src="assets/images/logo-wordmark-ondark.png" alt="Opulence Venture Group" />
        </a>
        <p class="footer-tagline">Strategic planning for business owners, professionals, and families coordinating business, tax, retirement, and legacy decisions.</p>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="consultants.html">Our Team</a></li>
          <li><a href="resources.html">Resources</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="careers.html">Careers</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>{service_links}</ul>
      </div>
      <div class="footer-col">
        <h4>Get in Touch</h4>
        <ul>
          <li><a href="mailto:info@opulenceinvestments.net">info@opulenceinvestments.net</a></li>
          <li><a href="tel:+14087103457">(408) 710-3457</a></li>
          <li><a href="contact.html#consultation-form">Schedule a Consultation</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; <span data-current-year></span> Opulence Venture Group. All rights reserved.</p>
      <div class="footer-legal">
        <a href="contact.html">Privacy</a>
        <a href="contact.html">Disclosures</a>
      </div>
    </div>

    <div class="footer-disclaimer">
      <p>Opulence Venture Group provides business consulting and financial planning education and strategy coordination. Nothing on this website constitutes tax, legal, accounting, or investment advice, and no content should be relied upon as a guarantee of any specific outcome. Strategies discussed may not be suitable for every individual or business, and individual circumstances vary. Insurance products, annuities, and investment vehicles carry fees, surrender charges, and other terms that should be reviewed carefully. Prior to implementing any strategy, you should consult with a qualified and licensed tax professional, attorney, and/or financial professional regarding your specific situation. Opulence Venture Group does not provide tax or legal advice.</p>
    </div>
  </div>
</footer>
<script src="app.js" defer></script>
</body>
</html>
"""


def breadcrumb(current_label, current_href):
    return f"""<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="index.html">Home</a><span aria-hidden="true">/</span><span>{current_label}</span>
</nav>"""


def cta_band(heading, support, primary_label="Schedule a Consultation", primary_href="contact.html#consultation-form", secondary_label=None, secondary_href=None, image="assets/images/cta-marble.webp"):
    secondary = f'<a class="btn btn-outline btn-lg" href="{secondary_href}">{secondary_label}</a>' if secondary_label else ""
    return f"""<section class="cta-band">
  <div class="cta-band-media"><img src="{image}" alt="" loading="lazy" decoding="async" width="1920" height="1080" /></div>
  <div class="container--wide cta-band-content reveal">
    <h2>{heading}</h2>
    <p>{support}</p>
    <div class="cta-band-actions">
      <a class="btn btn-primary btn-lg" href="{primary_href}">{primary_label}</a>
      {secondary}
    </div>
  </div>
</section>"""


def related_services(exclude_href):
    cards = ""
    for href, label, desc in SERVICE_ITEMS:
        if href == exclude_href:
            continue
        cards += f"""<a class="resource-card" href="{href}">
      <span class="tag">Service</span>
      <h3>{label}</h3>
      <p>{desc}</p>
    </a>"""
    return f"""<section class="section section--tight">
  <div class="container--wide">
    <div class="eyebrow reveal">Related Solutions</div>
    <h2 class="section-title reveal" style="margin-top:var(--space-3);margin-bottom:var(--space-10);">Explore related strategies</h2>
    <div class="grid grid--3 reveal">{cards}</div>
  </div>
</section>"""
