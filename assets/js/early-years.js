/* HerCycleCalc, Early Years age & milestone logic */
window.HCEarlyYears = (function () {
  const D = window.HC_DATA;

  function ageParts(birth, today) {
    let y = today.getFullYear() - birth.getFullYear();
    let m = today.getMonth() - birth.getMonth();
    let d = today.getDate() - birth.getDate();
    if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y, m, d };
  }

  /* inp = { birthDate:'yyyy-mm-dd', dueDate:'yyyy-mm-dd'|'' } */
  function compute(inp) {
    const HCF = window.HCF;
    const birth = HCF.parseISO(inp.birthDate);
    if (!birth) return null;
    const today = HCF.today();
    const ageDays = HCF.diffDays(birth, today);
    const notYet = ageDays < 0;

    const parts = notYet ? { y: 0, m: 0, d: 0 } : ageParts(birth, today);
    const totalWeeks = Math.max(0, Math.floor(ageDays / 7));
    const totalMonths = Math.max(0, parts.y * 12 + parts.m);

    // Corrected age (for babies born early), meaningful up to ~2 years.
    let corrected = null;
    const due = HCF.parseISO(inp.dueDate);
    if (due && HCF.diffDays(birth, due) > 0 && ageDays >= 0) {
      const cDays = HCF.diffDays(due, today);
      corrected = { days: cDays, weeks: Math.max(0, Math.floor(cDays / 7)), prematureWeeks: Math.round(HCF.diffDays(birth, due) / 7) };
    }

    const stage = D.earlyStage(Math.max(0, ageDays));
    const stages = D.EARLY_YEARS.map(s => {
      let status = 'upcoming';
      if (ageDays > s.toDays) status = 'done';
      else if (ageDays >= s.fromDays && ageDays <= s.toDays) status = 'now';
      return Object.assign({}, s, { date: HCF.addDays(birth, s.fromDays), status });
    });

    // Next birthday
    const nextBirthday = (function () {
      const n = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
      if (HCF.diffDays(today, n) < 0) n.setFullYear(n.getFullYear() + 1);
      return n;
    })();

    return { birth, ageDays, notYet, parts, totalWeeks, totalMonths, corrected, stage, stages, nextBirthday };
  }

  return { compute };
})();
