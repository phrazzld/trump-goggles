#!/usr/bin/env node
/**
 * Chrome Web Store Package Builder
 *
 * This script creates a production-ready zip file for uploading to the Chrome Web Store.
 * It removes debug files, validates the manifest, and packages everything properly.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
const PACKAGE_NAME = 'trump-goggles-chrome-store.zip';

console.log('🚀 Building Chrome Web Store package...\n');

// Step 1: Validate dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist directory not found. Run "pnpm run build" first.');
  process.exit(1);
}

console.log('✅ Step 1: Validated dist directory exists');

// Step 2: Read and validate manifest
const manifestPath = path.join(DIST_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: manifest.json not found in dist directory.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`✅ Step 2: Validated manifest.json (version ${manifest.version})`);

// Step 3: Validate required files exist
const requiredFiles = ['background.js', 'content.js', 'manifest.json', 'options.html'];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(DIST_DIR, file)));
if (missingFiles.length > 0) {
  console.error(`❌ Error: Missing required files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ Step 3: Validated all required files exist');

// Step 4: Check for images directory
const imagesDir = path.join(DIST_DIR, 'images');
if (!fs.existsSync(imagesDir)) {
  console.error('❌ Error: images directory not found.');
  process.exit(1);
}

console.log('✅ Step 4: Validated images directory exists');

// Step 5: Remove debug files if they exist
const debugFiles = ['content-debug.js'];

let removedDebugFiles = [];
debugFiles.forEach((file) => {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    removedDebugFiles.push(file);
  }
});

if (removedDebugFiles.length > 0) {
  console.log(`✅ Step 5: Removed debug files: ${removedDebugFiles.join(', ')}`);
} else {
  console.log('✅ Step 5: No debug files to remove');
}

// Step 6: Use production manifest
const productionManifestPath = path.join(__dirname, '..', 'extension', 'manifest-production.json');
if (fs.existsSync(productionManifestPath)) {
  const productionManifest = fs.readFileSync(productionManifestPath, 'utf8');
  fs.writeFileSync(manifestPath, productionManifest);
  console.log('✅ Step 6: Applied production manifest (no debug scripts)');
} else {
  // Fallback: Clean existing manifest
  const productionManifest = { ...manifest };
  if (productionManifest.content_scripts && productionManifest.content_scripts[0]) {
    const contentScripts = productionManifest.content_scripts[0].js;
    const cleanedScripts = contentScripts.filter((script) => script !== 'content-debug.js');
    productionManifest.content_scripts[0].js = cleanedScripts;
    fs.writeFileSync(manifestPath, JSON.stringify(productionManifest, null, 2));
  }
  console.log('✅ Step 6: Cleaned manifest.json (fallback method)');
}

// Step 7: Create packages directory
if (!fs.existsSync(PACKAGES_DIR)) {
  fs.mkdirSync(PACKAGES_DIR, { recursive: true });
}

console.log('✅ Step 7: Created packages directory');

// Step 8: Create zip file
const packagePath = path.join(PACKAGES_DIR, PACKAGE_NAME);

try {
  // Remove existing package if it exists
  if (fs.existsSync(packagePath)) {
    fs.unlinkSync(packagePath);
  }

  // Create zip file using native zip command (works on macOS/Linux)
  const zipCommand = `cd "${DIST_DIR}" && zip -r "${packagePath}" . -x "*.DS_Store" "*.map"`;
  execSync(zipCommand, { stdio: 'pipe' });

  console.log('✅ Step 8: Created zip package');
} catch (error) {
  console.error('❌ Error creating zip file:', error.message);
  process.exit(1);
}

// Step 9: Validate package
const stats = fs.statSync(packagePath);
const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('✅ Step 9: Package validation complete');
console.log(`   📦 File: ${packagePath}`);
console.log(`   📏 Size: ${sizeInMB} MB`);

// Step 10: List package contents for verification
try {
  const listCommand = `unzip -l "${packagePath}"`;
  const listing = execSync(listCommand, { encoding: 'utf8' });
  const fileCount = (listing.match(/\n/g) || []).length - 3; // Subtract header/footer lines
  console.log(`   📄 Files: ${fileCount} files`);
} catch {
  console.log('   📄 Files: Could not list contents');
}

// Step 11: Provide next steps
console.log('\n🎉 Chrome Web Store package ready!');
console.log('\n📋 Next steps:');
console.log('   1. Go to Chrome Web Store Developer Dashboard');
console.log('   2. Upload the zip file:');
console.log(`      ${packagePath}`);
console.log('   3. Fill out store listing details');
console.log('   4. Submit for review');

console.log('\n⚠️  Important reminders:');
console.log('   • Update store description if needed');
console.log('   • Verify all screenshots are current');
console.log('   • Test the extension thoroughly before submission');
console.log('   • Review Chrome Web Store policies');

// Step 12: Create submission checklist
const checklistPath = path.join(PACKAGES_DIR, 'CHROME_STORE_CHECKLIST.md');
const checklist = `# Chrome Web Store Submission Checklist

## Package Information
- **Version**: ${manifest.version}
- **Package**: ${PACKAGE_NAME}
- **Size**: ${sizeInMB} MB
- **Created**: ${new Date().toISOString()}

## Pre-Submission Checklist

### Technical Validation
- [ ] Extension loads without errors
- [ ] All features work as expected
- [ ] Tooltips display correctly on hover
- [ ] Text replacements work on various websites
- [ ] No console errors or warnings
- [ ] Performance is acceptable

### Chrome Web Store Requirements
- [ ] Manifest version is correct (${manifest.manifest_version})
- [ ] Extension name and description are accurate
- [ ] Icons are high quality and correct sizes
- [ ] Screenshots are current and representative
- [ ] Privacy policy is up to date (if required)
- [ ] No prohibited content or functionality

### Store Listing
- [ ] Title is compelling and accurate
- [ ] Short description is under 132 characters
- [ ] Detailed description explains functionality clearly
- [ ] Screenshots show key features
- [ ] Category is appropriate
- [ ] Tags/keywords are relevant

### Legal & Compliance
- [ ] Extension complies with Chrome Web Store policies
- [ ] No copyright violations
- [ ] Appropriate content rating
- [ ] Privacy practices disclosed if needed

## Submission Process
1. Login to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Create new item or update existing
3. Upload: \`${PACKAGE_NAME}\`
4. Complete store listing
5. Set pricing and distribution
6. Submit for review

## Post-Submission
- [ ] Monitor review status
- [ ] Respond to any review feedback
- [ ] Plan update strategy
- [ ] Monitor user reviews and ratings

---
Generated on: ${new Date().toLocaleString()}
`;

fs.writeFileSync(checklistPath, checklist);
console.log(`\n📝 Created submission checklist: ${checklistPath}`);

console.log('\n✨ Package build complete! ✨');
