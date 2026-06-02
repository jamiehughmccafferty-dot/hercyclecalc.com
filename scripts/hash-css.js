/**
 * scripts/hash-css.js
 *
 * Content-hash the compiled stylesheet so cache-busting is automatic.
 *
 * Run AFTER build:css. It:
 *   1. reads assets/css/styles.css (Tailwind output)
 *   2. computes an 8-char content hash
 *   3. writes assets/css/styles.<hash>.css
 *   4. rewrites every HTML <link> reference to the hashed filename
 *   5. deletes any previous styles.<oldhash>.css
 *
 * Idempotent: running twice with identical CSS produces the same hash and
 * leaves the HTML unchanged. Safe to run locally and in the Vercel build.
 *
 * Run:  node scripts/hash-css.js   (or npm run hash:css)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'assets', 'css');
const BASE = path.join(CSS_DIR, 'styles.css');

if (!fs.existsSync(BASE)) {
  console.error('hash:css - assets/css/styles.css not found. Run build:css first.');
  process.exit(1);
}

// 1-2. hash the compiled CSS
const css = fs.readFileSync(BASE);
const hash = crypto.createHash('md5').update(css).digest('hex').slice(0, 8);
const hashedName = `styles.${hash}.css`;

// 3. write the hashed copy
fs.writeFileSync(path.join(CSS_DIR, hashedName), css);

// 5. delete stale hashed files (keep source, base, and the new one)
const keep = new Set(['styles.src.css', 'styles.css', hashedName]);
for (const f of fs.readdirSync(CSS_DIR)) {
  if (/^styles\.[0-9a-f]{8}\.css$/.test(f) && !keep.has(f)) {
    fs.unlinkSync(path.join(CSS_DIR, f));
  }
}

// 4. rewrite HTML references (any depth of ../ before assets/css/)
const linkRe = /((?:\.\.\/)*assets\/css\/)styles(?:\.[0-9a-f]{8})?\.css/g;
function htmlFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) htmlFiles(abs, out);
    else if (name.endsWith('.html')) out.push(abs);
  }
  return out;
}

let rewritten = 0;
for (const file of htmlFiles(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!linkRe.test(before)) continue;
  linkRe.lastIndex = 0;
  const after = before.replace(linkRe, `$1${hashedName}`);
  if (after !== before) {
    fs.writeFileSync(file, after);
    rewritten++;
  }
}

console.log(`hash:css - ${hashedName} (${rewritten} HTML file(s) updated)`);
