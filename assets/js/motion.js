/* ============================================================
 * HerCycleCalc, Motion module
 *   1. Scroll reveal, IntersectionObserver fade-ups on .hc-reveal
 *   2. Chart.js theme, Inter font, refined tooltip, neutral gridlines
 *   3. Lazy loaders, Chart.js on first draw()
 *   4. Prefetch-on-hover, slider fill, reading progress, TOC
 * Honours prefers-reduced-motion: reduce.
 * ============================================================ */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Scroll reveal ---------- */
  function setupReveal(scope) {
    const root = scope || document;
    const els  = root.querySelectorAll('.hc-reveal:not(.hc-revealed)');
    if (!els.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('hc-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('hc-revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- 2. Chart.js theme ---------- */
  function applyChartTheme() {
    if (!window.Chart || window.Chart.__hcThemed) return;
    const C = window.Chart;
    C.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
    C.defaults.font.size = 12;
    C.defaults.font.weight = 500;
    C.defaults.color = 'rgb(158 140 152 / 0.95)';
    C.defaults.borderColor = 'rgb(158 140 152 / 0.18)';

    const t = C.defaults.plugins.tooltip;
    t.backgroundColor = 'rgb(43 26 39 / 0.95)';
    t.titleColor = '#fff';
    t.bodyColor = 'rgb(245 236 242)';
    t.borderColor = 'rgb(255 255 255 / 0.08)';
    t.borderWidth = 1; t.padding = 12; t.cornerRadius = 10;
    t.titleFont = { size: 12, weight: '700', family: "'Inter', sans-serif" };
    t.bodyFont = { size: 12, weight: '500', family: "'Inter', sans-serif" };
    t.titleMarginBottom = 6; t.boxPadding = 6; t.usePointStyle = true; t.displayColors = true;

    if (C.defaults.plugins.legend) {
      C.defaults.plugins.legend.labels.font = { size: 12, weight: '500', family: "'Inter', sans-serif" };
      C.defaults.plugins.legend.labels.boxWidth = 10;
      C.defaults.plugins.legend.labels.boxHeight = 10;
      C.defaults.plugins.legend.labels.padding = 14;
      C.defaults.plugins.legend.labels.usePointStyle = true;
    }
    if (C.defaults.scale) {
      C.defaults.scale.grid.color = 'rgb(158 140 152 / 0.12)';
      C.defaults.scale.grid.tickColor = 'transparent';
      C.defaults.scale.grid.drawTicks = false;
      C.defaults.scale.ticks.color = 'rgb(158 140 152 / 0.85)';
      C.defaults.scale.ticks.font = { size: 11, weight: '500', family: "'Inter', sans-serif" };
      C.defaults.scale.ticks.padding = 8;
      C.defaults.scale.border.display = false;
    }
    C.defaults.elements.line.tension = 0.35;
    C.defaults.elements.line.borderWidth = 2.5;
    C.defaults.elements.point.radius = 0;
    C.defaults.elements.point.hoverRadius = 5;
    C.defaults.elements.arc.borderWidth = 0;
    C.defaults.elements.bar.borderRadius = 6;
    C.defaults.elements.bar.borderSkipped = false;
    C.defaults.animation.duration = prefersReduced ? 0 : 600;
    C.defaults.animation.easing = 'easeOutQuart';
    window.Chart.__hcThemed = true;
  }

  function watchForChart() {
    if (window.Chart) return applyChartTheme();
    let tries = 0;
    const t = setInterval(() => {
      if (window.Chart || tries++ > 60) { clearInterval(t); applyChartTheme(); }
    }, 100);
  }

  /* ---------- 3. Lazy chart loader ---------- */
  const HCLoad = (function () {
    let chartPromise = null;
    function chart() {
      if (window.Chart) return Promise.resolve();
      if (chartPromise) return chartPromise;
      chartPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.async = true;
        s.onload = () => { applyChartTheme(); resolve(); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
      return chartPromise;
    }
    return { chart };
  })();
  window.HCLoad = HCLoad;

  /* ---------- 4. Prefetch-on-hover ---------- */
  function setupPrefetch() {
    if (prefersReduced) return;
    const conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return;
    const seen = new Set();
    const tryPrefetch = (href) => {
      if (seen.has(href)) return;
      seen.add(href);
      const link = document.createElement('link');
      link.rel = 'prefetch'; link.href = href; link.as = 'document';
      document.head.appendChild(link);
    };
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      let url;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      tryPrefetch(url.href);
    }, { passive: true, capture: true });
  }

  /* ---------- 5. Range slider live brand-fill ---------- */
  function updateSliderFill(slider) {
    const min = +slider.min || 0, max = +slider.max || 100, val = +slider.value;
    const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    slider.style.setProperty('--fill', pct + '%');
  }
  function setupSliderFill() {
    document.querySelectorAll('input[type="range"]').forEach(updateSliderFill);
    document.addEventListener('input', (e) => {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'range') updateSliderFill(e.target);
    }, { passive: true });
    document.addEventListener('alpine:initialized', () => {
      requestAnimationFrame(() => document.querySelectorAll('input[type="range"]').forEach(updateSliderFill));
    });
  }

  /* ---------- 6. Theme-aware chart colours ---------- */
  function getChartColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      isDark,
      brand:     isDark ? '#f472b6' : '#c2336e',
      brandFill: isDark ? 'rgba(244,114,182,0.18)' : 'rgba(194,51,110,0.10)',
      accent:    isDark ? '#d8b4fe' : '#7c3a6e',
      accentFill:isDark ? 'rgba(216,180,254,0.18)' : 'rgba(124,58,110,0.10)',
      amber:     isDark ? '#fbbf24' : '#f59e0b',
      ink:       isDark ? 'rgba(245,236,242,0.85)' : 'rgba(43,26,39,0.85)',
      grid:      isDark ? 'rgba(255,255,255,0.06)' : 'rgba(43,26,39,0.06)'
    };
  }

  /* ---------- 7. Reading progress + TOC ---------- */
  function setupReadingProgress() {
    const article = document.querySelector('article');
    if (!article || document.getElementById('hc-reading-progress')) return;
    const bar = document.createElement('div');
    bar.id = 'hc-reading-progress';
    bar.className = 'hc-reading-progress hc-no-print';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let raf = null;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, window.scrollY - top);
      const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
      bar.style.setProperty('--progress', pct + '%');
      raf = null;
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  function setupTOC() {
    const slot = document.getElementById('hc-toc');
    const article = document.querySelector('article');
    if (!slot || !article) return;
    const h2s = Array.from(article.querySelectorAll('h2'));
    if (h2s.length < 3) { slot.remove(); return; }
    const slug = (s) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
    const links = h2s.map(h2 => {
      if (!h2.id) h2.id = slug(h2.textContent);
      const a = document.createElement('a');
      a.href = '#' + h2.id; a.className = 'hc-toc-link'; a.textContent = h2.textContent;
      return { h2, a };
    });
    slot.innerHTML = '<div class="hc-toc-title">On this page</div>';
    const list = document.createElement('nav');
    list.className = 'hc-toc-list';
    list.setAttribute('aria-label', 'Table of contents');
    links.forEach(({ a }) => list.appendChild(a));
    slot.appendChild(list);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(({ a }) => a.removeAttribute('data-active'));
          const match = links.find(l => l.h2 === e.target);
          if (match) match.a.setAttribute('data-active', 'true');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    links.forEach(({ h2 }) => io.observe(h2));
  }

  /* ---------- 8. Tween-on-change number directive (x-num.num / .pct) ---------- */
  function registerNumDirective() {
    if (!window.Alpine || window.Alpine.__numRegistered) return;
    window.Alpine.__numRegistered = true;
    window.Alpine.directive('num', (el, { expression, modifiers }, { evaluateLater, effect }) => {
      const HCF = window.HCF || {};
      let fmt = (n) => String(Math.round(n));
      if (modifiers.includes('pct')) fmt = (n) => HCF.pct(n, 0);
      if (modifiers.includes('num')) fmt = (n) => HCF.num(n, 0);
      const duration = prefersReduced ? 0 : 360;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      let raf = null, currentVal = 0, firstRun = true;
      const getValue = evaluateLater(expression);
      effect(() => {
        getValue(target => {
          target = +target;
          if (!Number.isFinite(target)) return;
          if (firstRun || duration === 0) { currentVal = target; el.textContent = fmt(target); firstRun = false; return; }
          if (raf) cancelAnimationFrame(raf);
          const startTime = performance.now(), startVal = currentVal;
          const tick = (now) => {
            const t = Math.min(1, (now - startTime) / duration);
            currentVal = startVal + (target - startVal) * ease(t);
            el.textContent = fmt(currentVal);
            if (t < 1) raf = requestAnimationFrame(tick);
            else { currentVal = target; el.textContent = fmt(target); raf = null; }
          };
          raf = requestAnimationFrame(tick);
        });
      });
    });
  }

  function init() {
    setupReveal();
    watchForChart();
    setupPrefetch();
    setupSliderFill();
    setupReadingProgress();
    setupTOC();
  }
  document.addEventListener('alpine:init', registerNumDirective);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('pageshow', () => {
    setupReveal();
    if (window.HC && window.HC.refreshIcons) window.HC.refreshIcons();
  });

  window.HCMotion = { setupReveal, applyChartTheme, getChartColors, updateSliderFill };
})();
