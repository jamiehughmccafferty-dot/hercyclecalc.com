/* HerCycleCalc, Ovulation & fertile window logic */
window.HCOvulation = (function () {
  const D = window.HC_DATA;

  /* inp = { lastPeriod:'yyyy-mm-dd', cycleLength, periodLength, lutealPhase } */
  function compute(inp) {
    const HCF = window.HCF;
    const lp = HCF.parseISO(inp.lastPeriod);
    if (!lp) return null;

    const cycle = Math.max(20, Math.min(45, inp.cycleLength || D.CYCLE_DEFAULT));
    const period = Math.max(1, Math.min(10, inp.periodLength || 5));
    const luteal = Math.max(10, Math.min(16, inp.lutealPhase || D.LUTEAL_DEFAULT));
    const ovOffset = cycle - luteal; // days from cycle day 1 to ovulation

    const today = HCF.today();

    // Build the next few cycles, anchored to the most recent period start
    // that is on/before today (so "current cycle" makes sense even weeks later).
    let anchor = lp;
    while (HCF.diffDays(HCF.addDays(anchor, cycle), today) >= 0 && HCF.diffDays(anchor, today) >= cycle) {
      anchor = HCF.addDays(anchor, cycle);
    }

    const cycles = [];
    for (let i = 0; i < 4; i++) {
      const periodStart = HCF.addDays(anchor, i * cycle);
      const ovulation = HCF.addDays(periodStart, ovOffset);
      cycles.push({
        periodStart,
        periodEnd: HCF.addDays(periodStart, period - 1),
        fertileStart: HCF.addDays(ovulation, -D.FERTILE_BEFORE),
        fertileEnd: HCF.addDays(ovulation, D.FERTILE_AFTER),
        ovulation,
        nextPeriod: HCF.addDays(periodStart, cycle)
      });
    }

    // Current cycle = first whose fertile/period window hasn't fully passed
    const current = cycles[0];

    // Status relative to today
    let status, statusDetail, daysToOv = HCF.diffDays(today, current.ovulation);
    // If ovulation already passed this cycle, look at next cycle for the countdown
    let upcoming = current;
    if (HCF.diffDays(current.fertileEnd, today) > 0) { upcoming = cycles[1]; daysToOv = HCF.diffDays(today, upcoming.ovulation); }

    const inFertile = HCF.diffDays(current.fertileStart, today) >= 0 && HCF.diffDays(today, current.fertileEnd) >= 0;
    const isOvDay = HCF.diffDays(today, current.ovulation) === 0;
    if (isOvDay) { status = 'Ovulation day'; statusDetail = 'Your most fertile day, and the one before it.'; }
    else if (inFertile) { status = 'Fertile window, now'; statusDetail = 'One of your most fertile days this cycle.'; }
    else { status = 'Next fertile window'; statusDetail = HCF.relDays(HCF.diffDays(today, upcoming.fertileStart)); }

    // Day-by-day map for the current cycle visualisation
    const ovDayIndex = ovOffset; // 0-based offset
    const segs = [];
    for (let d = 0; d < cycle; d++) {
      let type = 'plain';
      if (d < period) type = 'period';
      const fromOv = d - ovDayIndex;
      if (fromOv >= -D.FERTILE_BEFORE && fromOv <= D.FERTILE_AFTER) type = (fromOv === 0 ? 'ovul' : 'fertile');
      segs.push({ day: d + 1, type });
    }
    const todayIndex = HCF.diffDays(current.periodStart, today);
    const todayPct = (todayIndex >= 0 && todayIndex < cycle) ? ((todayIndex + 0.5) / cycle) * 100 : -1;

    return {
      cycle, period, luteal, ovOffset,
      current, cycles, segs, todayPct,
      status, statusDetail, daysToOv, inFertile, isOvDay, upcoming
    };
  }

  return { compute };
})();
