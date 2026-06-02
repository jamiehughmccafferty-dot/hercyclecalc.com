/* HerCycleCalc, Due Date calculation logic */
window.HCDueDate = (function () {
  const D = window.HC_DATA;

  /* inp = { method:'lmp'|'conception'|'ivf', date:'yyyy-mm-dd', cycleLength:Number, embryoDay:3|5 } */
  function compute(inp) {
    const HCF = window.HCF;
    const date = HCF.parseISO(inp.date);
    if (!date) return null;

    const cycle = Math.max(20, Math.min(45, inp.cycleLength || D.CYCLE_DEFAULT));
    let lmpDate, edd, conception;

    if (inp.method === 'conception') {
      conception = date;
      edd = HCF.addDays(conception, D.GESTATION_DAYS - 14);   // 266 days
      lmpDate = HCF.addDays(conception, -14);
    } else if (inp.method === 'ivf') {
      const embryoAge = inp.embryoDay === 3 ? 3 : 5;
      conception = HCF.addDays(date, -embryoAge);              // fertilisation before transfer
      edd = HCF.addDays(conception, D.GESTATION_DAYS - 14);
      lmpDate = HCF.addDays(conception, -14);
    } else { // lmp
      lmpDate = date;
      const cycleAdj = cycle - D.CYCLE_DEFAULT;                // longer cycle → later ovulation → later EDD
      edd = HCF.addDays(lmpDate, D.GESTATION_DAYS + cycleAdj);
      conception = HCF.addDays(lmpDate, cycle - D.LUTEAL_DEFAULT);
    }

    const today = HCF.today();
    const gaDays = HCF.diffDays(lmpDate, today);
    const wd = HCF.weeksAndDays(Math.max(0, gaDays));
    const daysToGo = HCF.diffDays(today, edd);
    const trimester = D.trimester(wd.weeks);
    const progressPct = Math.max(0, Math.min(100, (gaDays / D.GESTATION_DAYS) * 100));
    const beforePregnancy = gaDays < 0;
    const overdue = daysToGo < 0;
    const weekInfo = D.weekInfo(Math.max(4, Math.min(40, wd.weeks || 4)));

    return {
      lmpDate, edd, conception,
      gaDays, weeks: wd.weeks, days: wd.days,
      daysToGo, trimester, progressPct,
      beforePregnancy, overdue, weekInfo
    };
  }

  return { compute };
})();
