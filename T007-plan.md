# T007 Implementation Plan: Configure Bundler for ES Module Browser Extension Build

## Objective

Configure a bundler to process ES Modules and generate browser extension-compatible output bundles.

## Chosen Approach

**Rollup** with multi-entry configuration, IIFE output format, and environment-specific builds.

## Rationale

1. **Simplicity First**: Rollup's minimal configuration aligns with our "Simplicity First" principle. It's designed specifically for ES Modules and avoids webpack's complexity for this use case.

2. **Modularity**: Rollup naturally handles multiple entry points (content scripts, background script) with clearly separated outputs, matching our "Do One Thing Well" philosophy.

3. **Testability**: Deterministic output without hidden behaviors makes it easier to verify browser extension compatibility. The clean build output simplifies testing.

4. **Explicit Over Implicit**: Rollup's declarative configuration makes all build steps transparent and debuggable.

5. **Minimal Dependencies**: Tree-shaking and ES Module focus keeps our bundles lean, aligning with our strict dependency management policy.

## Build Architecture

### Entry Points

Current extension has these key entry points:

1. `content-consolidated.js` - Main content script
2. `background-combined.js` - Background service worker
3. Future: Options page, popup scripts

### Output Requirements

- Format: IIFE (Immediately Invoked Function Expression)
- Directory: `dist/`
- Structure: Maintain clear mapping between source and output
- CSP Compliance: No dynamic imports or eval

## Implementation Steps

### 1. Install Dependencies

```bash
pnpm add -D rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-terser
```

Plugins:

- `@rollup/plugin-node-resolve`: Resolve node_modules imports
- `@rollup/plugin-commonjs`: Handle any CommonJS dependencies
- `@rollup/plugin-terser`: Minification for production builds

### 2. Create Rollup Configuration

Create `rollup.config.js` in project root:

```javascript
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: {
    content: 'content-consolidated.js',
    background: 'background-combined.js',
  },
  output: {
    dir: 'dist',
    format: 'iife',
    entryFileNames: '[name].js',
    sourcemap: !production ? 'inline' : false,
  },
  plugins: [
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    production &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      }),
  ].filter(Boolean),
  external: (id) => /^chrome/.test(id), // Don't bundle Chrome APIs
  watch: {
    clearScreen: false,
  },
};
```

### 3. Update Package.json Scripts

Add build scripts:

```json
{
  "scripts": {
    "build": "rollup -c",
    "build:watch": "rollup -c -w",
    "build:prod": "NODE_ENV=production rollup -c",
    "build:clean": "rm -rf dist"
  }
}
```

### 4. Create Copy Plugin for Static Assets

Install copy plugin for manifest and images:

```bash
pnpm add -D rollup-plugin-copy
```

Update config to include:

```javascript
import copy from 'rollup-plugin-copy';

// In plugins array:
copy({
  targets: [
    { src: 'manifest.json', dest: 'dist' },
    { src: 'images/*', dest: 'dist/images' },
    { src: '*.html', dest: 'dist' },
  ],
  hook: 'writeBundle', // Copy after bundle is written
});
```

### 5. Update Manifest.json for Built Files

Create `manifest.build.json` template:

```json
{
  "manifest_version": 3,
  "name": "Trump Goggles",
  // ... other properties
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "js": ["content.js"],
      "matches": ["*://*/*"],
      "run_at": "document_end"
    }
  ]
}
```

### 6. Configure for Browser Extension Environment

Add browser-specific optimizations:

```javascript
// In rollup.config.js
external: id => {
  // Don't bundle browser APIs
  return /^(chrome|browser)/.test(id);
},
output: {
  // Prevent naming conflicts with extension APIs
  name: 'TrumpGoggles',
  globals: {
    chrome: 'chrome',
    browser: 'browser'
  }
}
```

### 7. Dev/Prod Build Variations

**Development**:

- Inline source maps
- No minification
- Watch mode
- Preserve console logs

**Production**:

- No source maps
- Minification enabled
- Remove console logs
- Optimize bundle size

### 8. Documentation Updates

Update README.md with:

````markdown
## Build Process

### Prerequisites

- Node.js >= 18.18.0
- pnpm >= 7.0.0

### Development Build

```bash
pnpm build:watch
```
````

- Watches for file changes
- Includes inline source maps
- No minification

### Production Build

```bash
pnpm build:prod
```

- Minified output
- No source maps
- Optimized for extension size

### Build Output

All built files are output to `dist/` directory:

- `dist/content.js` - Content script bundle
- `dist/background.js` - Background script bundle
- `dist/manifest.json` - Extension manifest
- `dist/images/` - Extension icons and images

````

## Verification Steps

1. **Basic Build Test**:
   ```bash
   pnpm build
   ls -la dist/
````

2. **Extension Load Test**:

   - Build the extension
   - Load unpacked from `dist/` directory
   - Verify content script runs on pages
   - Check background script in service worker

3. **Module Resolution Test**:

   - Verify ES imports are resolved correctly
   - Check that tree-shaking removes unused code
   - Confirm browser APIs aren't bundled

4. **Production Build Test**:
   ```bash
   pnpm build:prod
   # Check file sizes are optimized
   du -h dist/*
   ```

## Next Steps

After this task:

1. T008: Update manifest files to use bundled output
2. Future: Add hot reload for development
3. Future: Add build-time TypeScript compilation when .ts files are introduced

## Notes

- Rollup was chosen over webpack for its simplicity and ES Module focus
- IIFE format ensures immediate execution in browser extension context
- Source maps only in development to avoid exposing source in production
- External browser APIs prevent bundling of chrome/browser namespace
