# Chrome Web Store Packaging Guide

This guide explains how to package Trump Goggles for submission to the Chrome Web Store.

## Quick Start

### For Production Submission

```bash
pnpm run package:chrome
```

This command will:

1. Clean the build directory
2. Run all tests
3. Run linting
4. Build the extension in production mode
5. Create a store-ready zip package

### For Development Testing

```bash
pnpm run package:quick
```

This skips tests and linting for faster iteration during development.

## Available Scripts

| Script                    | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `pnpm run package:chrome` | **Full production package** - Runs tests, builds, and packages |
| `pnpm run package:quick`  | **Quick dev package** - Skips tests, faster for testing        |
| `pnpm run package:prep`   | **Preparation only** - Clean, test, and lint                   |
| `pnpm run package:build`  | **Build only** - Production build                              |
| `pnpm run package:zip`    | **Package only** - Create zip from existing dist               |

## What Gets Packaged

### Included Files

- `background.js` - Background script
- `content.js` - Main content script
- `manifest.json` - Extension manifest (production version)
- `options.html` - Options page
- `images/` - All extension icons and images
- All dependency modules (logger, processors, etc.)

### Excluded Files

- `content-debug.js` - Debug helper (removed in production)
- `*.map` - Source maps
- `*.DS_Store` - macOS system files
- Any backup or temporary files

### Production Manifest Changes

The production package uses `extension/manifest-production.json` which:

- Removes debug scripts from content_scripts
- Keeps only essential scripts for production
- Maintains all permissions and metadata

## Package Output

The packaging process creates:

```
packages/
├── trump-goggles-chrome-store.zip    # Ready for Chrome Web Store upload
└── CHROME_STORE_CHECKLIST.md         # Submission checklist
```

## Submission Checklist

After packaging, you'll get a detailed checklist including:

### Technical Validation

- [ ] Extension loads without errors
- [ ] All features work as expected
- [ ] Tooltips display correctly on hover
- [ ] Text replacements work on various websites
- [ ] No console errors or warnings

### Chrome Web Store Requirements

- [ ] Manifest version is correct
- [ ] Extension name and description are accurate
- [ ] Icons are high quality and correct sizes
- [ ] Screenshots are current and representative

### Store Listing

- [ ] Title is compelling and accurate
- [ ] Short description is under 132 characters
- [ ] Detailed description explains functionality clearly
- [ ] Screenshots show key features

## Uploading to Chrome Web Store

1. **Build the package:**

   ```bash
   pnpm run package:chrome
   ```

2. **Go to the Chrome Web Store Developer Dashboard:**
   https://chrome.google.com/webstore/devconsole/

3. **Upload the zip file:**
   `packages/trump-goggles-chrome-store.zip`

4. **Complete the store listing** with:

   - Description
   - Screenshots
   - Category
   - Privacy policy (if required)

5. **Submit for review**

## Development Workflow

### Testing Before Packaging

```bash
# Full test suite
pnpm test

# End-to-end tests
pnpm run test:e2e

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

### Local Testing

```bash
# Build for local testing
pnpm run build

# Load the dist/ directory in Chrome
# chrome://extensions/ → Load unpacked → select dist/
```

### Quick Iteration

```bash
# For rapid development testing
pnpm run package:quick

# Test the packages/trump-goggles-chrome-store.zip file
```

## Troubleshooting

### Common Issues

1. **"dist directory not found"**

   - Run `pnpm run build` first

2. **"Missing required files"**

   - Check that all modules built correctly
   - Verify the build process completed successfully

3. **"Tests failed"**

   - Fix failing tests before packaging
   - Use `pnpm run package:quick` to skip tests temporarily

4. **"Package too large"**
   - Check for unnecessary files in dist/
   - Verify source maps are excluded
   - Consider code optimization

### Debugging

1. **Check build output:**

   ```bash
   ls -la dist/
   ```

2. **Verify manifest:**

   ```bash
   cat dist/manifest.json
   ```

3. **Test package contents:**
   ```bash
   unzip -l packages/trump-goggles-chrome-store.zip
   ```

## Version Management

Update version in `package.json` and `extension/manifest.json` before packaging:

```json
{
  "version": "2.1.0"
}
```

The packaging script will validate that all manifests have consistent versions.

## Security Notes

- Debug files are automatically removed from production packages
- Source maps are excluded
- Only essential files are included
- Production manifest removes development-only scripts

## Support

If you encounter issues with packaging:

1. Check the console output for specific error messages
2. Verify all dependencies are installed: `pnpm install`
3. Ensure Node.js version compatibility
4. Review the generated `CHROME_STORE_CHECKLIST.md` file
