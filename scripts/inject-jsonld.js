/**
 * scripts/inject-jsonld.js, one-shot, idempotent.
 *
 * Adds rich JSON-LD schemas:
 *   • Organization + WebSite (homepage)
 *   • BreadcrumbList + WebApplication (each calculator)
 *
 * Identifies each script via data-hc-ld="..." so re-runs replace cleanly.
 *
 * Run:  node scripts/inject-jsonld.js
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://hercyclecalc.com';

const CALCS = [
  { file: 'calculators/due-date.html',      name: 'Due Date Calculator',            short: 'Due Date Calculator',       description: 'Estimate your due date from your last period, conception date or IVF transfer, and see how many weeks pregnant you are.', keywords: 'due date calculator, EDD, pregnancy weeks, LMP, IVF' },
  { file: 'calculators/ovulation.html',     name: 'Ovulation & Fertile Window Calculator', short: 'Ovulation Calculator', description: 'Predict your ovulation date, most fertile days and upcoming periods from your cycle length and last period.', keywords: 'ovulation calculator, fertile window, fertility, cycle tracker' },
  { file: 'calculators/conception.html',    name: 'Conception Date Calculator',     short: 'Conception Calculator',     description: 'Estimate the likely conception date and window from a due date or birth date.', keywords: 'conception date calculator, conception window' },
  { file: 'calculators/pregnancy-map.html', name: 'Map Out My Pregnancy',           short: 'Pregnancy Roadmap',         description: 'A personalised week-by-week pregnancy roadmap of baby development, appointments and what to do at each stage.', keywords: 'pregnancy week by week, pregnancy roadmap, trimester guide' },
  { file: 'calculators/early-years.html',   name: 'Early Years Calculator',         short: 'Early Years Calculator',    description: 'See your baby\'s exact age and a stage-by-stage milestone guide from newborn through the early years.', keywords: 'baby age calculator, milestones, early years' },
  { file: 'calculators/baby-shopping.html', name: 'Baby Shopping Timeline',         short: 'Baby Shopping Timeline',    description: 'A trimester-by-trimester baby shopping checklist built from your due date.', keywords: 'baby shopping checklist, nesting, what to buy for baby' }
];

function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}#organization`,
    name: 'HerCycleCalc',
    legalName: 'Croft & Hugh Digital LTD',
    url: `${SITE}/`,
    logo: `${SITE}/assets/favicon.svg`,
    description: 'Free fertility, ovulation and pregnancy calculators with gentle, week-by-week guidance.',
    email: 'hello@crofthughdigital.co.uk',
    foundingLocation: { '@type': 'Country', name: 'United Kingdom' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '71-75 Shelton Street, Covent Garden',
      addressLocality: 'London',
      postalCode: 'WC2H 9JQ',
      addressCountry: 'GB'
    },
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'GB Company Number',
      value: '17207269'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@crofthughdigital.co.uk',
      availableLanguage: ['English']
    },
    sameAs: []
  };
}

function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}#website`,
    name: 'HerCycleCalc',
    url: `${SITE}/`,
    description: 'Free fertility, ovulation and pregnancy calculators with gentle, week-by-week guidance.',
    inLanguage: 'en-GB',
    publisher: { '@id': `${SITE}#organization` }
  };
}

function breadcrumb(calc) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${SITE}/#calculators` },
      { '@type': 'ListItem', position: 3, name: calc.short, item: `${SITE}/${calc.file}` }
    ]
  };
}

function webApp(calc) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.name,
    description: calc.description,
    keywords: calc.keywords,
    url: `${SITE}/${calc.file}`,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    publisher: { '@id': `${SITE}#organization` },
    image: `${SITE}/assets/og/site.png`
  };
}

function injectLd(absPath, key, json) {
  if (!fs.existsSync(absPath)) { console.warn('miss:', absPath); return false; }
  let html = fs.readFileSync(absPath, 'utf8');
  const tag = `<script type="application/ld+json" data-hc-ld="${key}">\n${JSON.stringify(json, null, 2)}\n</script>`;
  const re = new RegExp(`<script type="application/ld\\+json" data-hc-ld="${key}">[\\s\\S]*?</script>`, 'g');
  if (re.test(html)) {
    html = html.replace(re, tag);
  } else {
    html = html.replace(/<\/head>/i, `${tag}\n</head>`);
  }
  fs.writeFileSync(absPath, html);
  return true;
}

const root = path.resolve(__dirname, '..');

injectLd(path.join(root, 'index.html'), 'org', organization());
injectLd(path.join(root, 'index.html'), 'website', website());
console.log('✓ index.html, Organization + WebSite');

for (const calc of CALCS) {
  const abs = path.join(root, calc.file);
  injectLd(abs, 'breadcrumb', breadcrumb(calc));
  injectLd(abs, 'webapp', webApp(calc));
  console.log('✓', calc.file, '- Breadcrumb + WebApplication');
}

console.log('\nDone.');
