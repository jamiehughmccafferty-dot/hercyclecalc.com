/* ============================================================
 * HerCycleCalc, Affiliate offer registry & render helpers
 *
 * One place to manage every affiliate pick used across the site.
 * Each calculator pulls picks by category and renders them with the
 * helper functions, keeps disclosures consistent.
 *
 * To add a real partner: edit an OFFERS entry, add its id to a
 * CATEGORY array, and remove `placeholder: true` once live.
 *
 * Always keep rel="nofollow sponsored" on outbound affiliate links.
 * ============================================================ */
(function () {
  /* ============================================================
   * OFFER REGISTRY, PLACEHOLDER DATA only.
   * Generic, non-branded slots reserved for real affiliate partners.
   * No brand impersonation risk; swap in real partners when approved.
   * ============================================================ */
  const OFFERS = {
    /* ---------- Fertility / trying to conceive ---------- */
    'fertility-vitamins': {
      provider: 'Preconception vitamins', short: 'TTC', logoColor: '#c2336e',
      product: 'Supplements', meta: 'Folic acid + vitamin D',
      rate: 'Daily', rateLabel: 'preconception support',
      features: ['400µg folic acid', 'Trusted formulations', 'For the months before conceiving'],
      url: '/deals#fertility', placeholder: true
    },
    'ovulation-tests': {
      provider: 'Ovulation test kits', short: 'OPK', logoColor: '#a82a5f',
      product: 'Ovulation tests', meta: 'Predict your fertile days',
      rate: 'LH', rateLabel: 'surge detection',
      features: ['Easy to read', 'Track your surge', 'Digital and strip options'],
      url: '/deals#fertility', placeholder: true
    },

    /* ---------- Pregnancy ---------- */
    'pregnancy-multivitamin': {
      provider: 'Pregnancy multivitamin', short: 'PRG', logoColor: '#c2336e',
      product: 'Supplements', meta: 'Folic acid + vitamin D',
      rate: 'Daily', rateLabel: 'pregnancy support',
      features: ['Pregnancy-safe formula', 'Folic acid & vitamin D', 'Gentle on the stomach'],
      url: '/deals#pregnancy', placeholder: true
    },
    'pregnancy-pillow': {
      provider: 'Pregnancy support pillow', short: 'SLP', logoColor: '#7c3a6e',
      product: 'Comfort', meta: 'Better sleep in 2nd & 3rd trimester',
      rate: 'Comfort', rateLabel: 'side-sleeping support',
      features: ['Supports bump and back', 'Washable cover', 'Full-body options'],
      url: '/deals#pregnancy', placeholder: true
    },
    'maternity-clothes': {
      provider: 'Maternity essentials', short: 'MAT', logoColor: '#a82a5f',
      product: 'Clothing', meta: 'Bump-friendly basics',
      rate: 'Comfort', rateLabel: 'grows with you',
      features: ['Supportive leggings', 'Non-wired bras', 'Layering basics'],
      url: '/deals#pregnancy', placeholder: true
    },

    /* ---------- Nursery / big-ticket ---------- */
    'travel-system': {
      provider: 'Pushchair / travel system', short: 'PRM', logoColor: '#7c3a6e',
      product: 'Travel', meta: 'Pushchair + car seat',
      rate: 'Big buy', rateLabel: 'buy in 3rd trimester',
      features: ['Newborn-ready', 'Folds compactly', 'Car-seat compatible'],
      url: '/deals#nursery', placeholder: true
    },
    'cot-mattress': {
      provider: 'Cot & new mattress', short: 'COT', logoColor: '#58294e',
      product: 'Nursery', meta: 'Always use a new mattress',
      rate: 'Sleep', rateLabel: 'safe-sleep ready',
      features: ['Fits standard cot sizes', 'Breathable mattress', 'Converts as baby grows'],
      url: '/deals#nursery', placeholder: true
    },

    /* ---------- Newborn / hospital bag ---------- */
    'newborn-starter': {
      provider: 'Newborn clothing bundle', short: 'NB', logoColor: '#c2336e',
      product: 'Clothing', meta: 'Vests & sleepsuits',
      rate: 'Starter', rateLabel: 'first-size & newborn',
      features: ['Easy-change poppers', 'Soft cotton', 'Multipacks save money'],
      url: '/deals#newborn', placeholder: true
    },
    'nappies-wipes': {
      provider: 'Nappies & wipes', short: 'NAP', logoColor: '#a82a5f',
      product: 'Changing', meta: 'Stock up before baby',
      rate: 'Daily', rateLabel: 'newborn essentials',
      features: ['First-size nappies', 'Sensitive wipes', 'Subscribe & save options'],
      url: '/deals#newborn', placeholder: true
    },

    /* ---------- Free, trusted support (charity, not affiliate) ---------- */
    'tommys': {
      provider: 'Tommy\'s', short: 'TOM', logoColor: '#0d946e',
      product: 'Pregnancy charity', meta: 'Free midwife-led information',
      rate: 'Free', rateLabel: 'always',
      features: ['Evidence-based info', 'Pregnancy & baby loss support', 'UK charity'],
      url: 'https://www.tommys.org/', noaffil: true
    }
  };

  const CATEGORIES = {
    fertility: ['fertility-vitamins', 'ovulation-tests', 'tommys'],
    pregnancy: ['pregnancy-multivitamin', 'pregnancy-pillow', 'maternity-clothes'],
    nursery:   ['travel-system', 'cot-mattress'],
    newborn:   ['newborn-starter', 'nappies-wipes']
  };

  function escape(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  function renderResultPrompt({ icon = '🌸', title, sub, cta = 'See picks', href }) {
    return `
      <a href="${escape(href)}" rel="nofollow sponsored" class="hc-result-prompt no-underline" aria-label="${escape(title)}">
        <span class="hc-result-prompt-icon" aria-hidden="true">${icon}</span>
        <span class="hc-result-prompt-body">
          <span class="hc-result-prompt-title">${escape(title)}</span>
          <span class="hc-result-prompt-sub">${escape(sub)} · <span class="hc-sponsored-tag" style="background:transparent;padding:0;text-transform:none;letter-spacing:0;font-size:.68rem;font-weight:500;">Sponsored</span></span>
        </span>
        <span class="hc-result-prompt-cta">${escape(cta)} →</span>
      </a>`;
  }

  function renderComparisonTable({ category, title = 'Helpful picks', subtitle = '', limit = 3 }) {
    const ids = (CATEGORIES[category] || []).slice(0, limit);
    if (!ids.length) return '';
    const rows = ids.map(id => {
      const o = OFFERS[id]; if (!o) return '';
      const rel = o.noaffil ? 'noopener' : 'nofollow sponsored';
      return `
        <div class="hc-compare-row">
          <div class="hc-compare-provider">
            <span class="hc-compare-logo" style="background:${o.logoColor}">${escape(o.short)}</span>
            <div>
              <div class="hc-compare-name">${escape(o.provider)}</div>
              <div class="hc-compare-meta">${escape(o.product)} · ${escape(o.meta)}</div>
            </div>
          </div>
          <div>
            <div class="hc-compare-rate">${escape(o.rate)}</div>
            <div class="hc-compare-rate-label">${escape(o.rateLabel)}</div>
          </div>
          <ul class="hc-compare-features list-disc pl-4 space-y-0.5">
            ${o.features.map(f => `<li>${escape(f)}</li>`).join('')}
          </ul>
          <a href="${escape(o.url)}" rel="${rel}" class="hc-compare-cta">${o.noaffil ? 'Visit' : 'See pick'} →</a>
        </div>`;
    }).join('');
    return `
      <section class="hc-compare" aria-label="${escape(title)}">
        <header class="hc-compare-header">
          <div>
            <div class="hc-compare-title">${escape(title)}</div>
            ${subtitle ? `<div class="text-xs text-ink-muted mt-0.5">${escape(subtitle)}</div>` : ''}
          </div>
          <span class="hc-sponsored-tag">Sponsored</span>
        </header>
        ${rows}
        <footer class="hc-compare-footer">
          A hand-picked starting point, not a recommendation for your situation. Some links may earn HerCycleCalc a commission at no cost to you. Not medical advice, always check with your midwife or GP.
        </footer>
      </section>`;
  }

  function inlineLink(category, anchorText) {
    const id = (CATEGORIES[category] || [])[0];
    const o = OFFERS[id]; if (!o) return escape(anchorText);
    return `<a href="${escape(o.url)}" rel="nofollow sponsored" class="hc-inline-link">${escape(anchorText)}</a>`;
  }

  function rowLink(category, anchorText) {
    const id = (CATEGORIES[category] || [])[0];
    const o = OFFERS[id]; if (!o) return '';
    return `<a href="${escape(o.url)}" rel="nofollow sponsored" class="hc-row-link">${escape(anchorText)} →</a>`;
  }

  function renderStickyOffer({ category, eyebrow, headline, body, cta = 'See pick' }) {
    const id = (CATEGORIES[category] || [])[0];
    const o = OFFERS[id]; if (!o) return '';
    return `
      <aside class="hc-sticky-offer">
        <div class="hc-offer-card-eyebrow">${escape(eyebrow)}</div>
        <h3 class="font-bold text-base leading-snug">${escape(headline)}</h3>
        <p class="text-sm text-ink-soft mt-2">${escape(body)}</p>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            <div class="text-xs text-ink-muted">${escape(o.provider)}</div>
            <div class="text-lg font-bold text-brand">${escape(o.rate)}</div>
          </div>
          <a href="${escape(o.url)}" rel="nofollow sponsored" class="hc-btn hc-btn-primary text-sm py-2 px-4">${escape(cta)} →</a>
        </div>
        <div class="text-[0.65rem] text-ink-muted mt-3 text-center">Sponsored · ${escape(o.meta)}</div>
      </aside>`;
  }

  function renderTrustStrip() {
    return `
      <div class="hc-trust-strip">
        <span class="hc-trust-strip-item">Gentle and judgement-free</span>
        <span class="hc-trust-strip-item">No data stored</span>
        <span class="hc-trust-strip-item">UK based</span>
        <span class="hc-trust-strip-item">Evidence-informed</span>
      </div>`;
  }

  window.HCAffiliates = {
    OFFERS, CATEGORIES,
    renderResultPrompt, renderComparisonTable,
    inlineLink, rowLink, renderStickyOffer, renderTrustStrip
  };
})();
