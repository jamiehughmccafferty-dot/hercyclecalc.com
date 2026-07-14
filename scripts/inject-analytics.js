/**
 * scripts/inject-analytics.js
 *
 * Injects Vercel Web Analytics script into all HTML files.
 * Safe to re-run: removes existing analytics scripts before injecting.
 *
 * Run: node scripts/inject-analytics.js
 */
const fs = require('fs');
const path = require('path');

// Analytics script to inject (from Vercel Web Analytics docs)
const ANALYTICS_SCRIPT = `<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>`;

/**
 * Remove any existing Vercel Analytics scripts from HTML
 */
function removeExistingAnalytics(html) {
  // Remove the inline va script
  html = html.replace(/<script>\s*window\.va\s*=\s*window\.va\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.vaq\s*=\s*window\.vaq\s*\|\|\s*\[\]\)\.push\(arguments\);\s*\};\s*<\/script>\s*/g, '');
  
  // Remove the deferred analytics script
  html = html.replace(/<script\s+defer\s+src=["']\/_vercel\/insights\/script\.js["']><\/script>\s*/g, '');
  html = html.replace(/<script\s+src=["']\/_vercel\/insights\/script\.js["']\s+defer><\/script>\s*/g, '');
  
  return html;
}

/**
 * Inject Vercel Analytics script before closing </head> tag
 */
function injectAnalytics(html) {
  // First remove any existing analytics scripts
  html = removeExistingAnalytics(html);
  
  // Find </head> and inject before it
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex === -1) {
    console.warn('  ⚠️  No </head> tag found, skipping');
    return html;
  }
  
  return html.slice(0, headCloseIndex) + ANALYTICS_SCRIPT + '\n' + html.slice(headCloseIndex);
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const updated = injectAnalytics(html);
  
  if (html !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  return false;
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== 'node_modules' && !file.startsWith('.')) {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html') && !filePath.includes('og-generator.html')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding HTML files...\n');
  
  const files = findHtmlFiles('.');
  
  console.log(`📄 Found ${files.length} HTML files\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const file of files) {
    const changed = processFile(file);
    if (changed) {
      console.log(`✅ ${file}`);
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✨ Done! Updated ${updated} files, skipped ${skipped} files\n`);
  console.log('📊 Vercel Web Analytics script injected successfully');
  console.log('🚀 Deploy to Vercel to see analytics data\n');
}

main();
