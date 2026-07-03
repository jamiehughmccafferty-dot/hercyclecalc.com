/**
 * scripts/inject-meta.js, one-shot, idempotent.
 *
 * Injects per-page social + favicon + manifest meta:
 *   • favicon (SVG) + site.webmanifest
 *   • og:url, og:title, og:description, og:type, og:locale
 *   • og:image, og:image:width, og:image:height
 *   • twitter:card, twitter:title, twitter:description, twitter:image
 *
 * Safe to re-run: scrubs any existing og:* / twitter:* / favicon / manifest
 * tags before inserting fresh ones.
 *
 * Run:  node scripts/inject-meta.js
 */
const fs = require('fs');
const path = require('path');

const SITE     = 'https://hercyclecalc.com';
const OG_IMAGE = `${SITE}/assets/og/site.png`;

const FILES = [
  {
    file: 'index.html',
    ogUrl: `${SITE}/`,
    ogTitle: 'HerCycleCalc | Fertility, Ovulation & Pregnancy Calculators',
    ogDescription: 'Free, gentle calculators for ovulation, fertile window, due date and a week-by-week pregnancy roadmap. Private, accurate, no sign-up.'
  },
  {
    file: 'about.html',
    ogUrl: `${SITE}/about`,
    ogTitle: 'About Kelli, the founder of HerCycleCalc',
    ogDescription: 'Hi, I\'m Kelli. After 5 years of infertility, 4 miscarriages and a failed IVF cycle, I built HerCycleCalc to make understanding your cycle and trying to conceive a little easier. This is my story.'
  },
  {
    file: 'contact.html',
    ogUrl: `${SITE}/contact`,
    ogTitle: 'Contact HerCycleCalc',
    ogDescription: 'Email hello@crofthughdigital.co.uk, corrections, bugs, calculator requests and partnership enquiries welcome.'
  },
  {
    file: 'faq.html',
    ogUrl: `${SITE}/faq`,
    ogTitle: 'Fertility & pregnancy FAQ | HerCycleCalc',
    ogDescription: 'Quick answers on cycle length, ovulation timing, fertile windows, due dates, trimesters and how our calculators work.'
  },
  {
    file: 'glossary.html',
    ogUrl: `${SITE}/glossary`,
    ogTitle: 'Fertility & pregnancy glossary | plain-English jargon-buster',
    ogDescription: 'LMP, EDD, luteal phase, gestational age, trimester, implantation and more, every fertility and pregnancy term explained simply.'
  },
  {
    file: 'deals.html',
    ogUrl: `${SITE}/deals`,
    ogTitle: 'Pregnancy & baby essentials | hand-picked picks',
    ogDescription: 'Hand-picked pregnancy, fertility and newborn essentials. Affiliate links with full disclosure. Not medical advice.'
  },
  {
    file: 'saved.html',
    ogUrl: `${SITE}/saved`,
    ogTitle: 'Saved | HerCycleCalc',
    ogDescription: 'Your saved dates and calculations, stored locally in your browser. Private, no account, no sync.'
  },
  {
    file: '404.html',
    ogUrl: `${SITE}/404`,
    ogTitle: 'Page not found | HerCycleCalc',
    ogDescription: 'That page wandered off. Try one of our fertility or pregnancy calculators instead.'
  },
  {
    file: 'blog/index.html',
    ogUrl: `${SITE}/blog/`,
    ogTitle: 'Fertility & pregnancy guides | HerCycleCalc',
    ogDescription: 'Gentle, evidence-informed guides on cycles, fertility, conception, pregnancy stages and the early years.'
  },
  {
    file: 'privacy.html',
    ogUrl: `${SITE}/privacy`,
    ogTitle: 'Privacy Policy | HerCycleCalc',
    ogDescription: 'How HerCycleCalc handles your data: calculators run on your device, we do not store your inputs, and we use no tracking cookies.'
  },
  {
    file: 'cookies.html',
    ogUrl: `${SITE}/cookies`,
    ogTitle: 'Cookie Policy | HerCycleCalc',
    ogDescription: 'HerCycleCalc uses no tracking or advertising cookies. We use a little on-device storage for saved calculations and your theme.'
  },
  {
    file: 'terms.html',
    ogUrl: `${SITE}/terms`,
    ogTitle: 'Terms of Service | HerCycleCalc',
    ogDescription: 'The terms for using HerCycleCalc free calculators and content, including our not-medical-advice notice and limitation of liability.'
  },

  // ─── Calculator pages ────────────────────────────────────────────────
  {
    file: 'calculators/due-date.html',
    ogUrl: `${SITE}/calculators/due-date`,
    ogTitle: 'Due Date Calculator | LMP, conception or IVF',
    ogDescription: 'Estimate your due date from your last period, conception date or IVF transfer. See how many weeks pregnant you are today and your trimester.'
  },
  {
    file: 'calculators/ovulation.html',
    ogUrl: `${SITE}/calculators/ovulation`,
    ogTitle: 'Ovulation & Fertile Window Calculator',
    ogDescription: 'Predict your most fertile days, ovulation date and next periods from your cycle length and last period. Plan or track with confidence.'
  },
  {
    file: 'calculators/conception.html',
    ogUrl: `${SITE}/calculators/conception`,
    ogTitle: 'Conception Date Calculator',
    ogDescription: 'Work backwards from a due date or birth date to estimate the likely conception window and date.'
  },
  {
    file: 'calculators/pregnancy-map.html',
    ogUrl: `${SITE}/calculators/pregnancy-map`,
    ogTitle: 'Map Out My Pregnancy | week-by-week roadmap',
    ogDescription: 'Enter your due date for a personalised week-by-week pregnancy roadmap: what is happening with baby, key appointments and what to do at each stage.'
  },
  {
    file: 'calculators/early-years.html',
    ogUrl: `${SITE}/calculators/early-years`,
    ogTitle: 'Early Years Calculator | baby age & milestones',
    ogDescription: 'Enter your baby\'s birth date to see their exact age and a stage-by-stage milestone guide from newborn through the early years.'
  },
  {
    file: 'calculators/baby-shopping.html',
    ogUrl: `${SITE}/calculators/baby-shopping`,
    ogTitle: 'Baby Shopping Timeline | when to buy what',
    ogDescription: 'A trimester-by-trimester baby shopping checklist built from your due date, so you buy the right things at the right time.'
  },
  {
    file: 'calculators/dpo.html',
    ogUrl: `${SITE}/calculators/dpo`,
    ogTitle: 'DPO Calculator | days past ovulation & test timing',
    ogDescription: 'Count your days past ovulation (DPO), see your implantation window, the earliest a test could turn positive and when your period is due.'
  },
  {
    file: 'calculators/implantation.html',
    ogUrl: `${SITE}/calculators/implantation`,
    ogTitle: 'Implantation Calculator | window & timing',
    ogDescription: 'Estimate your implantation window from your ovulation date, the most likely day, and when a pregnancy test could first show a result.'
  },
  {
    file: 'calculators/trigger-shot.html',
    ogUrl: `${SITE}/calculators/trigger-shot`,
    ogTitle: 'Trigger Shot Calculator | hCG test-out timing',
    ogDescription: 'Estimate how long an hCG trigger shot may take to clear from your system, so you can plan test-out timing for IVF or IUI. Your clinic beta is definitive.'
  },
  {
    file: 'calculators/beta-hcg.html',
    ogUrl: `${SITE}/calculators/beta-hcg`,
    ogTitle: 'Beta hCG Doubling Calculator | rise & doubling time',
    ogDescription: 'Enter two beta hCG results to see the doubling time and 48-hour rise. A maths tool for context, not a diagnosis, your clinic interprets your results.'
  },
  {
    file: 'calculators/ivf-milestones.html',
    ogUrl: `${SITE}/calculators/ivf-milestones`,
    ogTitle: 'IVF Milestones Calculator | transfer to due date',
    ogDescription: 'Map your IVF journey from egg retrieval or embryo transfer: beta test dates, viability scan, dating scan and your estimated due date.'
  },

  // ─── Blog articles ────────────────────────────────────────────────────
  {
    file: 'blog/how-to-get-pregnant.html',
    ogUrl: `${SITE}/blog/how-to-get-pregnant`,
    ogTitle: 'How to get pregnant: timing, your fertile window and best chances',
    ogDescription: 'A warm, plain-English UK guide to getting pregnant: how conception works, finding your fertile window, how often to have sex, what helps, and when to see your GP.',
    ogType: 'article'
  },
  {
    file: 'blog/pregnancy-week-by-week.html',
    ogUrl: `${SITE}/blog/pregnancy-week-by-week`,
    ogTitle: 'Pregnancy week by week: a complete UK guide',
    ogDescription: 'How pregnancy is counted, what happens each trimester, your NHS antenatal appointments, how to look after yourself, and the warning signs to never ignore.',
    ogType: 'article'
  },
  {
    file: 'blog/early-signs-of-pregnancy.html',
    ogUrl: `${SITE}/blog/early-signs-of-pregnancy`,
    ogTitle: 'Early signs of pregnancy: what\'s real and when to test',
    ogDescription: 'Which early symptoms are common, why none of them are proof, when a test is reliable, and what to do next.',
    ogType: 'article'
  },
  {
    file: 'blog/hospital-bag-checklist.html',
    ogUrl: `${SITE}/blog/hospital-bag-checklist`,
    ogTitle: 'Hospital bag checklist: what to pack for labour (UK)',
    ogDescription: 'When to pack, and what to bring for labour, for after the birth, for your baby and for your birth partner, without overpacking.',
    ogType: 'article'
  },
  {
    file: 'blog/implantation-bleeding-vs-period.html',
    ogUrl: `${SITE}/blog/implantation-bleeding-vs-period`,
    ogTitle: 'Implantation bleeding vs your period: how to tell the difference',
    ogDescription: 'The differences in timing, colour, flow and length, how common it is, and when spotting means you should call your GP.',
    ogType: 'article'
  },
  {
    file: 'blog/irregular-periods-and-getting-pregnant.html',
    ogUrl: `${SITE}/blog/irregular-periods-and-getting-pregnant`,
    ogTitle: 'Irregular periods and getting pregnant: a UK guide',
    ogDescription: 'Why cycles vary, how to track ovulation when they do, and when to see your GP about trying to conceive.',
    ogType: 'article'
  },
  {
    file: 'blog/morning-sickness-relief.html',
    ogUrl: `${SITE}/blog/morning-sickness-relief`,
    ogTitle: 'Morning sickness: what helps and when to get advice',
    ogDescription: 'Why it happens, what genuinely helps, what to avoid, and the signs of severe sickness that need medical help.',
    ogType: 'article'
  },
  {
    file: 'blog/12-week-dating-scan.html',
    ogUrl: `${SITE}/blog/12-week-dating-scan`,
    ogTitle: 'Your 12-week dating scan: what to expect',
    ogDescription: 'What it checks, when it happens, how to prepare, the screening it offers, and why it can change your due date.',
    ogType: 'article'
  },
  {
    file: 'blog/understanding-your-fertile-window.html',
    ogUrl: `${SITE}/blog/understanding-your-fertile-window`,
    ogTitle: 'Understanding your fertile window',
    ogDescription: 'How ovulation, the fertile window and the luteal phase actually work, and how to time things whether you are trying to conceive or not.',
    ogType: 'article'
  },
  {
    file: 'blog/trimester-by-trimester-guide.html',
    ogUrl: `${SITE}/blog/trimester-by-trimester-guide`,
    ogTitle: 'Trimester-by-trimester pregnancy guide',
    ogDescription: 'What happens in each trimester, baby development, common symptoms, key appointments and what to prepare, from week 1 to birth.',
    ogType: 'article'
  },
  {
    file: 'blog/how-due-dates-are-calculated.html',
    ogUrl: `${SITE}/blog/how-due-dates-are-calculated`,
    ogTitle: 'How due dates are calculated (and why they move)',
    ogDescription: 'Naegele\'s rule, the 280-day count, dating scans and IVF dating, why only ~5% of babies arrive on their due date, explained simply.',
    ogType: 'article'
  }
];

function metaBlock(entry, depth) {
  const rel = depth > 0 ? '../'.repeat(depth) : '';
  const ogType = entry.ogType || 'website';
  return [
    '',
    '<!-- ===== Social + favicon + manifest (managed by scripts/inject-meta.js) ===== -->',
    `<link rel="icon" type="image/svg+xml" href="${rel}assets/favicon.svg">`,
    `<link rel="manifest" href="${rel}site.webmanifest">`,
    `<meta property="og:title" content="${entry.ogTitle}">`,
    `<meta property="og:description" content="${entry.ogDescription}">`,
    `<meta property="og:url" content="${entry.ogUrl}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${entry.ogTitle}">`,
    `<meta name="twitter:description" content="${entry.ogDescription}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
    '<!-- ===== end social block ===== -->',
    ''
  ].join('\n');
}

function stripExisting(html) {
  html = html.replace(/[ \t]*<!-- ===== Social \+ favicon \+ manifest \(managed by scripts\/inject-meta\.js\) ===== -->[\s\S]*?<!-- ===== end social block ===== -->\s*\n?/g, '');
  html = html.replace(/[ \t]*<link rel="icon"[^>]*>\n?/g, '');
  html = html.replace(/[ \t]*<link rel="manifest"[^>]*>\n?/g, '');
  html = html.replace(/[ \t]*<meta\s+property="og:[^"]+"[^>]*>\n?/g, '');
  html = html.replace(/[ \t]*<meta\s+name="twitter:[^"]+"[^>]*>\n?/g, '');
  return html;
}

let touched = 0, missed = 0;
for (const entry of FILES) {
  const abs = path.resolve(__dirname, '..', entry.file);
  if (!fs.existsSync(abs)) { console.warn('miss:', entry.file); missed++; continue; }
  let html = fs.readFileSync(abs, 'utf8');
  html = stripExisting(html);

  const re = /(<meta\s+name="theme-color"[^>]*>)/i;
  if (!re.test(html)) {
    console.warn('no theme-color anchor in', entry.file);
    missed++;
    continue;
  }
  const depth = entry.file.split('/').length - 1;
  html = html.replace(re, `$1${metaBlock(entry, depth)}`);
  fs.writeFileSync(abs, html);
  touched++;
  console.log('✓', entry.file);
}
console.log(`\nDone. ${touched} updated, ${missed} skipped.`);
