/* HerCycleCalc, "Map out my pregnancy" week-by-week roadmap logic */
window.HCPregnancyMap = (function () {
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
    const wd = HCF.weeksAndDays(Math.max(0, gaDays));
    const currentWeek = Math.max(0, Math.min(42, wd.weeks));
    const daysToGo = HCF.diffDays(today, edd);
    const beforePregnancy = gaDays < 0;
    const trimester = D.trimester(currentWeek);
    const progressPct = Math.max(0, Math.min(100, (gaDays / D.GESTATION_DAYS) * 100));

    const milestones = D.PREGNANCY_MILESTONES.map(m => {
      const mDate = HCF.addDays(lmp, m.week * 7);
      let status = 'upcoming';
      if (currentWeek > m.week) status = 'done';
      else if (currentWeek === m.week) status = 'now';
      return Object.assign({}, m, { date: mDate, status });
    });

    return { lmp, edd, gaDays, currentWeek, currentDay: wd.days, daysToGo, beforePregnancy, trimester, progressPct, milestones };
  }

  // Rich info for the week explorer (size, dev, trimester, calendar dates)
  function weekDetail(lmp, week) {
    const HCF = window.HCF;
    const info = D.weekInfo(week);
    const start = HCF.addDays(lmp, week * 7);
    const end = HCF.addDays(start, 6);
    return { week, size: info.size, dev: info.dev, trimester: D.trimester(week), start, end };
  }

  return { compute, weekDetail };
})();
