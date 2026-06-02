/* HerCycleCalc, formatters & date helpers (en-GB) */
window.HCF = {
  /* ----- numbers ----- */
  num(v, dp = 0) {
    const n = Number.isFinite(v) ? v : 0;
    return new Intl.NumberFormat('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n);
  },
  pct(v, dp = 0) {
    const n = Number.isFinite(v) ? v : 0;
    return n.toFixed(dp) + '%';
  },
  ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },

  /* ----- dates ----- */
  today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },
  // Parse a yyyy-mm-dd string (from <input type=date>) into a local midnight Date.
  parseISO(str) {
    if (!str) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str).trim());
    if (!m) {
      const d = new Date(str);
      return isNaN(d) ? null : (d.setHours(0, 0, 0, 0), d);
    }
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    d.setHours(0, 0, 0, 0);
    return isNaN(d) ? null : d;
  },
  toISO(date) {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${y}-${mo}-${dd}`;
  },
  addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + Math.round(n));
    d.setHours(0, 0, 0, 0);
    return d;
  },
  // Whole days from a to b (b - a). Positive if b is later.
  diffDays(a, b) {
    if (!a || !b) return 0;
    const MS = 86400000;
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / MS);
  },
  weeksAndDays(totalDays) {
    const d = Math.max(0, Math.round(totalDays));
    return { weeks: Math.floor(d / 7), days: d % 7, totalDays: d };
  },
  // 'Monday 5 January 2026'
  fmt(date, opts) {
    if (!(date instanceof Date) || isNaN(date)) return '-';
    return new Intl.DateTimeFormat('en-GB', opts || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  },
  // '5 Jan 2026'
  fmtShort(date) {
    if (!(date instanceof Date) || isNaN(date)) return '-';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  },
  // '5 Jan'
  fmtDayMonth(date) {
    if (!(date instanceof Date) || isNaN(date)) return '-';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
  },
  // Human gap: '3 weeks, 2 days' / 'today' / '4 days ago'
  relDays(totalDays) {
    const n = Math.round(totalDays);
    if (n === 0) return 'today';
    const abs = Math.abs(n);
    const { weeks, days } = this.weeksAndDays(abs);
    let label;
    if (abs < 7) label = `${abs} day${abs === 1 ? '' : 's'}`;
    else if (days === 0) label = `${weeks} week${weeks === 1 ? '' : 's'}`;
    else label = `${weeks} week${weeks === 1 ? '' : 's'}, ${days} day${days === 1 ? '' : 's'}`;
    return n > 0 ? `in ${label}` : `${label} ago`;
  }
};
