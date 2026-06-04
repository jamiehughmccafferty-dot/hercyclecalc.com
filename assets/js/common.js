/* HerCycleCalc, shared header, footer, dark mode, helpers */
(function () {
  const ROOT = (function findRoot() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (/\/calculators\//.test(path) || /\/blog\//.test(path)) return '../';
    return '';
  })();

  const LOGO_SVG = `
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="shrink-0">
      <defs>
        <linearGradient id="hc-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgb(var(--brand))"/>
          <stop offset="100%" stop-color="rgb(var(--accent))"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#hc-logo-grad)"/>
      <path d="M23 10.5A9 9 0 1 0 25 16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="24.4" cy="9.2" r="2.6" fill="#fbcfe1"/>
      <path d="M16 20.5c-2.3-1.7-3.8-3.1-3.8-4.9a2 2 0 0 1 3.8-.9 2 2 0 0 1 3.8.9c0 1.8-1.5 3.2-3.8 4.9z" fill="#fff"/>
    </svg>`;

  const NAV = [
    { label: 'Home', href: ROOT + 'index.html' },
    {
      label: 'Calculators', children: [
        { label: 'Due Date',            href: ROOT + 'calculators/due-date.html' },
        { label: 'Ovulation & Fertility', href: ROOT + 'calculators/ovulation.html' },
        { label: 'Conception Date',     href: ROOT + 'calculators/conception.html' },
        { label: 'Map Out My Pregnancy', href: ROOT + 'calculators/pregnancy-map.html' },
        { label: 'Early Years',         href: ROOT + 'calculators/early-years.html' },
        { label: 'Baby Shopping',       href: ROOT + 'calculators/baby-shopping.html' }
      ]
    },
    { label: 'Saved',     href: ROOT + 'saved.html' },
    { label: 'Guides',    href: ROOT + 'blog/index.html' },
    { label: 'Essentials',href: ROOT + 'deals.html' },
    { label: 'About',     href: ROOT + 'about.html' },
    { label: 'Contact',   href: ROOT + 'contact.html' }
  ];

  function topBannerHTML() {
    if (localStorage.getItem('hc-banner-dismissed') === '1') return '';
    return `
<div class="hc-top-banner hc-no-print" id="hc-top-banner">
  <span><strong>New:</strong> Map your whole pregnancy, week by week.</span>
  <a href="${ROOT}calculators/pregnancy-map.html">Try it →</a>
  <button class="hc-top-banner-close" id="hc-top-banner-close" aria-label="Dismiss">×</button>
</div>`;
  }

  function navHTML() {
    return `
<header data-vt="header" class="hc-no-print sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="header-inner flex items-center justify-between">
      <a href="${ROOT}index.html" class="flex items-center gap-2.5 font-display font-semibold text-xl text-ink tracking-tight">
        ${LOGO_SVG}
        Her<span class="hc-gradient-text">Cycle</span>Calc
      </a>
      <nav class="hidden lg:flex items-center gap-1" aria-label="Primary">
        ${NAV.map(item => item.children
          ? `<div class="relative group">
              <button class="px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand inline-flex items-center gap-1 transition-colors">
                ${item.label}
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition-transform group-hover:rotate-180"></i>
              </button>
              <div class="absolute left-0 top-full pt-2 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                <div class="hc-card w-64 p-2">
                  ${item.children.map(c => `<a href="${c.href}" class="block px-3 py-2 rounded-lg text-sm text-ink-soft hover:text-ink hover:bg-surface-3 transition-colors">${c.label}</a>`).join('')}
                </div>
              </div>
            </div>`
          : `<a href="${item.href}" class="px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand transition-colors">${item.label}</a>`
        ).join('')}
      </nav>
      <button id="hc-mobile-toggle" type="button" class="lg:hidden p-2 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-3 transition-colors" aria-label="Open menu" aria-expanded="false" aria-controls="hc-mobile-menu">
        <i data-lucide="menu" class="w-6 h-6" aria-hidden="true"></i>
      </button>
    </div>
    <div id="hc-mobile-menu" class="lg:hidden hidden pb-4 space-y-1">
      ${NAV.map(item => item.children
        ? `<details class="border-t border-border pt-2">
            <summary class="px-3 py-2 text-sm font-semibold cursor-pointer text-ink">${item.label}</summary>
            ${item.children.map(c => `<a href="${c.href}" class="block px-6 py-2 text-sm text-ink-soft hover:text-brand transition-colors">${c.label}</a>`).join('')}
          </details>`
        : `<a href="${item.href}" class="block px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand border-t border-border transition-colors">${item.label}</a>`
      ).join('')}
    </div>
  </div>
</header>`;
  }

  function footerHTML() {
    const yr = new Date().getFullYear();
    return `
<footer class="hc-no-print mt-22 border-t border-border bg-surface-3">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div class="grid md:grid-cols-4 gap-10">
      <div>
        <div class="flex items-center gap-2 font-display font-semibold text-xl text-ink mb-3 tracking-tight">
          ${LOGO_SVG}
          HerCycleCalc
        </div>
        <p class="text-sm text-ink-muted leading-relaxed">Gentle, private calculators for fertility, ovulation and pregnancy, every stage, mapped out.</p>
      </div>
      <div>
        <h3 class="font-semibold text-ink mb-3 text-xs uppercase tracking-wider text-ink-muted">Calculators</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}calculators/due-date.html">Due Date</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}calculators/ovulation.html">Ovulation &amp; Fertility</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}calculators/conception.html">Conception Date</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}calculators/pregnancy-map.html">Map Out My Pregnancy</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}calculators/early-years.html">Early Years</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}calculators/baby-shopping.html">Baby Shopping</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-ink mb-3 text-xs uppercase tracking-wider text-ink-muted">Resources</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}blog/index.html">Guides</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}faq.html">FAQ</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}glossary.html">Glossary</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}deals.html">Essentials</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}saved.html">Saved</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-ink mb-3 text-xs uppercase tracking-wider text-ink-muted">Company</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}about.html">About</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}contact.html">Contact</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}about.html#editorial">Editorial Standards</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}privacy.html">Privacy Policy</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}cookies.html">Cookie Policy</a></li>
          <li><a class="text-ink-soft hover:text-brand transition-colors" href="${ROOT}terms.html">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-12 pt-8 border-t border-border text-xs text-ink-muted space-y-3 leading-relaxed">
      <p><strong class="text-ink-soft">Important, not medical advice:</strong> HerCycleCalc's calculators and content are for general information and educational purposes only. They are estimates and are not a substitute for professional medical advice, diagnosis or treatment. Every pregnancy and cycle is different. Always speak to your GP, midwife or a qualified healthcare professional about your individual circumstances. In the UK, see <a href="https://www.nhs.uk/pregnancy/" rel="noopener" target="_blank" class="underline hover:text-brand transition-colors">NHS Pregnancy</a> for trusted guidance.</p>
      <p><strong class="text-ink-soft">Affiliate disclosure:</strong> Some links on this site (including those marked "Essentials" or "See picks") are affiliate links. If you click through and buy, HerCycleCalc may receive a small commission at no extra cost to you. This never affects what we choose to feature.</p>
      <p>&copy; ${yr} Croft &amp; Hugh Digital LTD · Registered in England &amp; Wales · Company No. 17207269 · Registered office: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ · Contact: <a href="mailto:hello@crofthughdigital.co.uk" class="underline hover:text-brand transition-colors">Hello@crofthughdigital.co.uk</a></p>
    </div>
  </div>
</footer>`;
  }

  function injectDisclaimerBar() {
    return `
<div class="hc-disclaimer mt-6">
  <strong>For general information only, not medical advice.</strong> These results are estimates. Every pregnancy and cycle is different, so always confirm dates and any concerns with your GP or midwife. Affiliate links may earn us a commission.
</div>`;
  }

  function setupMobileMenu() {
    const btn = document.getElementById('hc-mobile-toggle');
    const menu = document.getElementById('hc-mobile-menu');
    btn?.addEventListener('click', () => {
      const open = menu.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  function setupTopBanner() {
    document.getElementById('hc-top-banner-close')?.addEventListener('click', () => {
      document.getElementById('hc-top-banner')?.remove();
      localStorage.setItem('hc-banner-dismissed', '1');
    });
  }

  function setupHeaderScroll() {
    const header = document.querySelector('header[data-vt="header"]');
    if (!header) return;
    let ticking = false;
    const update = () => {
      const scrolled = window.scrollY > 8;
      if ((header.dataset.scrolled === 'true') !== scrolled) header.dataset.scrolled = scrolled ? 'true' : 'false';
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  const lucideReady = new Promise((resolve) => {
    if (window.lucide) return resolve();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });

  (function loadMotion() {
    if (document.querySelector('script[data-hc-motion]')) return;
    const s = document.createElement('script');
    s.src = ROOT + 'assets/js/motion.js';
    s.async = false;
    s.dataset.hcMotion = '1';
    document.head.appendChild(s);
  })();

  function refreshIcons(scope) {
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(scope ? { context: scope } : undefined); } catch {}
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const bannerSlot = document.getElementById('hc-top-banner-slot');
    const headerSlot = document.getElementById('hc-header');
    const footerSlot = document.getElementById('hc-footer');
    const disclaimerSlot = document.getElementById('hc-disclaimer');
    if (bannerSlot) bannerSlot.outerHTML = topBannerHTML();
    if (headerSlot) headerSlot.outerHTML = navHTML();
    if (footerSlot) footerSlot.outerHTML = footerHTML();
    if (disclaimerSlot) disclaimerSlot.outerHTML = injectDisclaimerBar();
    setupMobileMenu();
    setupTopBanner();
    setupHeaderScroll();
    await lucideReady;
    refreshIcons();
  });

  window.HC = window.HC || {};
  window.HC.ROOT = ROOT;
  window.HC.refreshIcons = refreshIcons;
})();
