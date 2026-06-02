/* HerCycleCalc, Conception date (reverse) logic */
window.HCConception = (function () {
  const D = window.HC_DATA;

  /* inp = { mode:'due'|'birth', date:'yyyy-mm-dd' } */
  function compute(inp) {
    const HCF = window.HCF;
    const date = HCF.parseISO(inp.date);
    if (!date) return null;

    // From an EDD (or actual birth date), conception is ~266 days before,
    // and the notional LMP ~280 days before.
    const conception = HCF.addDays(date, -(D.GESTATION_DAYS - 14)); // -266
    const lmp = HCF.addDays(date, -D.GESTATION_DAYS);               // -280

    // Conception window, sperm survival before + egg viability after ovulation.
    const windowStart = HCF.addDays(conception, -D.FERTILE_BEFORE);
    const windowEnd = HCF.addDays(conception, D.FERTILE_AFTER);

    return { mode: inp.mode, conception, lmp, windowStart, windowEnd, anchor: date };
  }

  return { compute };
})();
