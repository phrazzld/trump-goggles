## Chosen Approach

Use Rollup with a multi-entry ES Module build, separate dev/prod configs, and plugins to generate the extension manifest and copy assets.

## Rationale

- Simplicity: Rollup’s minimal API handles multiple inputs and plugins with far less boilerplate than webpack.
- Modularity: Plugin-based config cleanly isolates manifest generation, asset copying, and minification.
- Testability: Deterministic builds with explicit dev (source maps, livereload) and prod (terser) modes ensure reproducibility.
- Coding Standards: Explicit Rollup config avoids magic; all dependencies and transforms are declared.
- Documentation: A single README section on “Building” covers both dev and prod workflows.

## Build Steps

1. Install dependencies:
   ```
   npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-json rollup-plugin-manifest-json rollup-plugin-copy rollup-plugin-terser rollup-plugin-livereload
   ```
2. Create `rollup.config.dev.js`:
   - Inputs: `src/content.js`, `src/background.js`, `src/popup.js`
   - Output: `dist/[name].js`, format `iife`, sourcemap `true`
   - Plugins: node-resolve, commonjs, json, manifest-json (reads `src/manifest.json`), copy (static assets), livereload on `dist`
3. Create `rollup.config.prod.js`:
   - Same inputs/outputs, sourcemap `false`
   - Plugins: node-resolve, commonjs, json, manifest-json, copy, terser for minification
4. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "build:dev": "rollup -c rollup.config.dev.js --watch",
       "build:prod": "rollup -c rollup.config.prod.js"
     }
   }
   ```
5. Update `src/manifest.json` template to reference entry names (no extensions, plugin injects “.js”).
6. Document in `README.md` under “Development” and “Production”:
   - Prerequisites
   - `npm run build:dev`
   - `npm run build:prod`
   - How manifest and assets are handled
   - Where to load the unpacked extension for testing.
