/* ============================================================
 * HerCycleCalc, Save & Share modal (Alpine.store)
 *
 * Any calculator can open it via:
 *   window.HCSaveShare.openSave({ type, name, inputs, shareParams, summary })
 *   window.HCSaveShare.openShare({ type, shareParams, summary })
 *
 * summary = {
 *   headline: '12 Jan 2026', headlineLabel: 'Estimated due date',
 *   secondary: '14 weeks', secondaryLabel: 'How far along',
 *   meta: 'Based on your last period', icon: 'baby',
 *   calcLabel: 'Due Date Calculator',
 *   rows: [ { label: 'Conception', value: '20 Apr' } ]
 * }
 * ============================================================ */
(function () {

  const SOCIAL = {
    whatsapp: { name: 'WhatsApp', icon: 'message-circle', color: '#25d366',
      build: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}` },
    twitter:  { name: 'X', icon: 'twitter', color: '#000000',
      build: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    facebook: { name: 'Facebook', icon: 'facebook', color: '#1877f2',
      build: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    pinterest:{ name: 'Pinterest', icon: 'image', color: '#e60023',
      build: (url, text) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}` }
  };

  function buildShareUrl(type, params) {
    const root = (window.HC && window.HC.ROOT) || '';
    let base;
    try { base = new URL(`${root}calculators/${type}.html`, window.location.href).href; }
    catch { base = `${window.location.origin}/calculators/${type}.html`; }
    const url = new URL(base);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
  }

  let html2canvasPromise = null;
  function ensureHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve();
    if (html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    return html2canvasPromise;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function buildShareCardHTML(snap) {
    const s = snap.summary || {};
    const calcLabel = s.calcLabel || 'HerCycleCalc';
    const meta = s.meta || '';
    const rows = (s.rows || []).slice(0, 3);

    const wrap   = `width:1200px;height:630px;background:linear-gradient(135deg,#c2336e 0%,#7c3a6e 60%,#5b2a51 100%);color:#fff;padding:56px 64px;box-sizing:border-box;font-family:'Inter',system-ui,-apple-system,sans-serif;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;`;
    const blob1  = `position:absolute;top:-220px;right:-220px;width:560px;height:560px;border-radius:50%;background:radial-gradient(closest-side,rgba(251,207,225,.30),rgba(251,207,225,0));pointer-events:none;`;
    const blob2  = `position:absolute;bottom:-180px;left:-120px;width:420px;height:420px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.08),rgba(255,255,255,0));pointer-events:none;`;
    const top    = `display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;`;
    const brand  = `display:flex;align-items:center;gap:14px;font-weight:800;font-size:26px;letter-spacing:-.02em;`;
    const tag    = `font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);`;
    const mid    = `position:relative;z-index:1;`;
    const eye    = `font-size:16px;font-weight:600;opacity:.78;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;`;
    const head   = `font-size:84px;font-weight:800;letter-spacing:-.03em;line-height:1;`;
    const sub    = `font-size:22px;font-weight:500;opacity:.88;margin-top:18px;`;
    const stats  = `display:flex;gap:48px;margin-top:30px;padding-top:22px;border-top:1px solid rgba(255,255,255,.2);`;
    const stat   = `display:flex;flex-direction:column;gap:4px;`;
    const sLabel = `font-size:13px;opacity:.65;font-weight:500;letter-spacing:.04em;text-transform:uppercase;`;
    const sValue = `font-size:24px;font-weight:700;`;
    const foot   = `display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;padding-top:20px;border-top:1px solid rgba(255,255,255,.18);font-size:15px;`;
    const footR  = `display:flex;align-items:center;gap:8px;font-weight:700;`;
    const footRDot = `width:6px;height:6px;border-radius:50%;background:#fbcfe1;display:inline-block;`;

    const statsHtml = rows.map(r => `
      <div style="${stat}"><div style="${sLabel}">${escapeHtml(r.label)}</div><div style="${sValue}">${escapeHtml(r.value)}</div></div>`).join('');

    return `
      <div data-share-card style="${wrap}">
        <div style="${blob1}"></div>
        <div style="${blob2}"></div>
        <div style="${top}">
          <div style="${brand}">
            <svg width="44" height="44" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="rgba(255,255,255,.16)"/>
              <path d="M23 10.5A9 9 0 1 0 25 16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
              <circle cx="24.4" cy="9.2" r="2.6" fill="#fbcfe1"/>
              <path d="M16 20.5c-2.3-1.7-3.8-3.1-3.8-4.9a2 2 0 0 1 3.8-.9 2 2 0 0 1 3.8.9c0 1.8-1.5 3.2-3.8 4.9z" fill="#fff"/>
            </svg>
            HerCycleCalc
          </div>
          <div style="${tag}">${escapeHtml(calcLabel)}</div>
        </div>
        <div style="${mid}">
          <div style="${eye}">${escapeHtml(s.headlineLabel || 'Result')}</div>
          <div style="${head}">${escapeHtml(s.headline || '')}</div>
          <div style="${sub}">${escapeHtml(s.secondaryLabel ? s.secondaryLabel + ': ' + s.secondary : (s.secondary || ''))}</div>
          ${statsHtml ? `<div style="${stats}">${statsHtml}</div>` : ''}
        </div>
        <div style="${foot}">
          <span style="opacity:.75">${escapeHtml(meta)}</span>
          <span style="${footR}"><span style="${footRDot}"></span>hercyclecalc.com</span>
        </div>
      </div>`;
  }

  function ensureToastStack() {
    let s = document.getElementById('hc-toast-stack');
    if (!s) { s = document.createElement('div'); s.id = 'hc-toast-stack'; s.className = 'hc-toast-stack'; document.body.appendChild(s); }
    return s;
  }

  function toast(message, action) {
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = 'hc-toast';
    const linkHTML = action ? `<a href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>` : '';
    el.innerHTML = `<svg class="hc-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
      <span>${escapeHtml(message)}${linkHTML ? ' · ' + linkHTML : ''}</span>`;
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('hc-toast-leaving'); setTimeout(() => el.remove(), 220); }, 4200);
  }

  const MODAL_HTML = `
<template id="hc-modal-template">
<div id="hc-save-share-modal" x-data x-show="$store.hcss.open" x-cloak
     @keydown.escape.window="$store.hcss.close()"
     class="hc-modal-backdrop hc-no-print"
     @click.self="$store.hcss.close()"
     role="dialog" aria-modal="true" aria-labelledby="hc-modal-title">
  <div class="hc-modal">
    <div class="hc-modal-header">
      <div>
        <div id="hc-modal-title" class="hc-modal-title" x-text="$store.hcss.mode === 'save' ? 'Save this' : 'Share your result'"></div>
        <div class="hc-modal-sub" x-text="$store.hcss.mode === 'save' ? 'Stored locally on this device, no account needed.' : 'Send a link or download a pretty image.'"></div>
      </div>
      <button class="hc-modal-close" @click="$store.hcss.close()" aria-label="Close"><i data-lucide="x" class="w-5 h-5"></i></button>
    </div>

    <!-- SAVE MODE -->
    <div class="hc-modal-body" x-show="$store.hcss.mode === 'save'">
      <div class="hc-save-summary" x-show="$store.hcss.payload">
        <div class="hc-save-summary-icon"><i :data-lucide="$store.hcss.payload?.summary?.icon || 'heart'" class="w-5 h-5"></i></div>
        <div class="flex-1 min-w-0">
          <div class="hc-save-summary-headline" x-text="$store.hcss.payload?.summary?.headline || ''"></div>
          <div class="hc-save-summary-meta">
            <span x-text="$store.hcss.payload?.summary?.headlineLabel || ''"></span>
            <template x-if="$store.hcss.payload?.summary?.meta"><span> · <span x-text="$store.hcss.payload.summary.meta"></span></span></template>
          </div>
        </div>
      </div>
      <form class="hc-save-form mt-4" @submit.prevent="$store.hcss.saveNow()">
        <label>
          <span class="hc-label">Name</span>
          <input type="text" class="hc-input" maxlength="80" required x-model="$store.hcss.saveName"
                 placeholder="e.g. Baby's due date" @keydown.enter.prevent="$store.hcss.saveNow()">
        </label>
        <p class="text-xs text-brand" x-show="$store.hcss.saveError" x-text="$store.hcss.saveError"></p>
        <p class="text-xs text-ink-muted">Saved on this device only, clearing your browser data will remove it.</p>
        <div class="flex gap-2 mt-2">
          <button type="button" class="hc-btn hc-btn-ghost flex-1" @click="$store.hcss.close()">Cancel</button>
          <button type="submit" class="hc-btn hc-btn-primary flex-1"><i data-lucide="bookmark" class="w-4 h-4"></i> Save</button>
        </div>
      </form>
    </div>

    <!-- SHARE MODE -->
    <div class="hc-modal-body" x-show="$store.hcss.mode === 'share'">
      <div class="hc-save-summary" x-show="$store.hcss.payload">
        <div class="hc-save-summary-icon"><i :data-lucide="$store.hcss.payload?.summary?.icon || 'heart'" class="w-5 h-5"></i></div>
        <div class="flex-1 min-w-0">
          <div class="hc-save-summary-headline" x-text="$store.hcss.payload?.summary?.headline || ''"></div>
          <div class="hc-save-summary-meta" x-text="$store.hcss.payload?.summary?.headlineLabel || ''"></div>
        </div>
      </div>
      <div class="hc-share-grid">
        <button type="button" class="hc-share-tile" @click="$store.hcss.shareTo('whatsapp')">
          <div class="hc-share-tile-icon" style="background:#25d366"><i data-lucide="message-circle" class="w-5 h-5"></i></div>WhatsApp
        </button>
        <button type="button" class="hc-share-tile" @click="$store.hcss.shareTo('twitter')">
          <div class="hc-share-tile-icon" style="background:#000"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg></div>X
        </button>
        <button type="button" class="hc-share-tile" @click="$store.hcss.shareTo('facebook')">
          <div class="hc-share-tile-icon" style="background:#1877f2"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"/></svg></div>Facebook
        </button>
        <button type="button" class="hc-share-tile" @click="$store.hcss.shareTo('pinterest')">
          <div class="hc-share-tile-icon" style="background:#e60023"><i data-lucide="image" class="w-5 h-5"></i></div>Pinterest
        </button>
      </div>
      <div class="hc-link-row">
        <span class="hc-link-text" x-text="$store.hcss.shareUrl"></span>
        <button type="button" class="hc-link-copy" @click="$store.hcss.copyLink()" :data-copied="$store.hcss.copied">
          <i :data-lucide="$store.hcss.copied ? 'check' : 'copy'" class="w-3.5 h-3.5"></i>
          <span x-text="$store.hcss.copied ? 'Copied' : 'Copy'"></span>
        </button>
      </div>
      <button type="button" class="hc-btn hc-btn-ghost w-full mt-3" @click="$store.hcss.downloadImage()" :disabled="$store.hcss.imageBusy">
        <template x-if="!$store.hcss.imageBusy"><i data-lucide="image" class="w-4 h-4"></i></template>
        <template x-if="$store.hcss.imageBusy"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i></template>
        <span x-text="$store.hcss.imageBusy ? 'Creating image…' : 'Download as image'"></span>
      </button>
      <p class="text-xs text-ink-muted mt-3">The link reopens this calculator with the same dates filled in.</p>
    </div>
  </div>
</div>
</template>`;

  function injectModal() {
    if (document.getElementById('hc-save-share-modal')) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = MODAL_HTML;
    const tpl = tmp.querySelector('template');
    const node = tpl.content.firstElementChild.cloneNode(true);
    if (document.body) document.body.appendChild(node);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(node));
  }
  injectModal();

  const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let _lastOpener = null, _trapHandler = null;
  function installTrap(modalEl) {
    removeTrap();
    _trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      const f = Array.from(modalEl.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    modalEl.addEventListener('keydown', _trapHandler);
  }
  function removeTrap() {
    if (_trapHandler) { document.querySelector('#hc-save-share-modal')?.removeEventListener('keydown', _trapHandler); _trapHandler = null; }
  }

  document.addEventListener('alpine:init', () => {
    window.Alpine.store('hcss', {
      open: false, mode: 'save', payload: null,
      saveName: '', saveError: '', shareUrl: '', copied: false, imageBusy: false,

      openSave(payload) {
        _lastOpener = document.activeElement;
        this.payload = payload;
        this.shareUrl = buildShareUrl(payload.type, payload.shareParams);
        this.saveName = payload.name || this._suggestName(payload);
        this.saveError = ''; this.mode = 'save'; this.open = true; this._afterOpen();
      },
      openShare(payload) {
        _lastOpener = document.activeElement;
        this.payload = payload;
        this.shareUrl = buildShareUrl(payload.type, payload.shareParams);
        this.copied = false; this.mode = 'share'; this.open = true; this._afterOpen();
      },
      close() {
        this.open = false; this.payload = null; removeTrap();
        if (_lastOpener && typeof _lastOpener.focus === 'function') _lastOpener.focus();
        _lastOpener = null;
      },
      _afterOpen() {
        setTimeout(() => {
          if (window.HC && window.HC.refreshIcons) window.HC.refreshIcons();
          const modal = document.querySelector('#hc-save-share-modal .hc-modal');
          if (!modal) return;
          installTrap(modal);
          if (this.mode === 'save') { const i = modal.querySelector('input[type="text"]'); i?.focus(); i?.select(); }
          else modal.querySelector('.hc-link-copy')?.focus();
        }, 30);
      },
      _suggestName(payload) {
        const head = (payload.summary && payload.summary.headline) || '';
        const labels = {
          'due-date': 'My due date', 'ovulation': 'My fertile window', 'conception': 'Conception estimate',
          'pregnancy-map': 'My pregnancy', 'early-years': "Baby's milestones", 'baby-shopping': 'Baby shopping plan'
        };
        const label = labels[payload.type] || 'My calculation';
        return head ? `${label}, ${head}` : label;
      },
      saveNow() {
        const name = (this.saveName || '').trim();
        if (!name) { this.saveError = 'Give this a name'; return; }
        const entry = window.HCStorage.save({
          type: this.payload.type, name,
          inputs: this.payload.inputs, shareParams: this.payload.shareParams, summary: this.payload.summary
        });
        if (!entry) { this.saveError = 'Could not save, your browser storage may be full'; return; }
        const root = (window.HC && window.HC.ROOT) || '';
        this.close();
        toast(`Saved as "${entry.name}"`, { label: 'View saved', href: root + 'saved.html' });
      },
      async copyLink() {
        try { await navigator.clipboard.writeText(this.shareUrl); this.copied = true; setTimeout(() => { this.copied = false; }, 1800); }
        catch { this.copied = false; }
      },
      shareTo(platform) {
        const def = SOCIAL[platform]; if (!def) return;
        const text = (this.payload && this.payload.summary)
          ? `${this.payload.summary.headlineLabel || 'My result'}: ${this.payload.summary.headline}, via HerCycleCalc`.trim()
          : 'Check this out on HerCycleCalc';
        window.open(def.build(this.shareUrl, text), '_blank', 'noopener,noreferrer,width=620,height=640');
      },
      async downloadImage() {
        if (this.imageBusy || !this.payload) return;
        this.imageBusy = true;
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:fixed;top:0;left:-2000px;width:1200px;height:630px;pointer-events:none;z-index:-1;overflow:hidden;';
        wrap.innerHTML = buildShareCardHTML(this.payload);
        document.body.appendChild(wrap);
        try {
          await ensureHtml2Canvas();
          const card = wrap.querySelector('[data-share-card]');
          await (document.fonts && document.fonts.ready);
          const canvas = await window.html2canvas(card, {
            backgroundColor: null, scale: 2, logging: false, useCORS: true,
            width: 1200, height: 630, windowWidth: 1200, windowHeight: 630
          });
          await new Promise(res => {
            canvas.toBlob(blob => {
              if (!blob) return res();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `hercyclecalc-${this.payload.type}.png`;
              document.body.appendChild(a); a.click(); a.remove();
              setTimeout(() => URL.revokeObjectURL(url), 1000); res();
            }, 'image/png');
          });
          toast('Image downloaded');
        } catch (err) {
          console.error('[HCSaveShare] image gen failed:', err);
          toast('Could not create image, try again');
        } finally { wrap.remove(); this.imageBusy = false; }
      }
    });
  });

  window.HCSaveShare = {
    openSave(payload) {
      const fire = () => window.Alpine?.store('hcss')?.openSave(payload);
      window.Alpine ? fire() : document.addEventListener('alpine:initialized', fire, { once: true });
    },
    openShare(payload) {
      const fire = () => window.Alpine?.store('hcss')?.openShare(payload);
      window.Alpine ? fire() : document.addEventListener('alpine:initialized', fire, { once: true });
    },
    toast, buildShareUrl
  };
})();
