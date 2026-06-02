/* HerCycleCalc, Baby shopping timeline logic */
window.HCBabyShopping = (function () {
  const D = window.HC_DATA;

  /* inp = { mode:'due'|'lmp', date:'yyyy-mm-dd' } */
  function compute(inp) {
    const HCF = window.HCF;
    const date = HCF.parseISO(inp.date);
    if (!date) return null;

    let lmp, edd;
    if (inp.mode === 'lmp') { lmp = date; edd = HCF.addDays(lmp, D.GESTATION_DAYS); }
    else { edd = date; lmp = HCF.addDays(edd, -D.GESTATION_DAYS); }

    const today = HCF.today();
    const gaDays = HCF.diffDays(lmp, today);
    const currentWeek = Math.max(0, Math.floor(gaDays / 7));

    const phases = D.SHOPPING.map((p, i) => {
      let status = 'upcoming';
      if (currentWeek >= p.toWeek) status = 'done';
      else if (currentWeek >= p.fromWeek) status = 'now';
      return Object.assign({ index: i }, p, {
        startDate: HCF.addDays(lmp, p.fromWeek * 7),
        status
      });
    });

    return { lmp, edd, currentWeek, phases };
  }

  /* Simple localStorage-backed checklist of ticked items. */
  const KEY = 'hc-shopping-v1';
  function readChecked() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
  }
  function writeChecked(set) {
    try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch {}
  }

  return { compute, readChecked, writeChecked };
})();
