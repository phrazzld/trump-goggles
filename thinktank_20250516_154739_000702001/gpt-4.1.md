```
## Chosen Approach
Rollup, with explicit multi-entry configuration for content/background scripts, minimal plugins, and single config file using environment flags.

## Rationale
- Simplicity: Rollup's configuration is far less complex and easier to reason about for ES Module bundling, especially with multiple entry points; avoids webpack's overengineering for this use case.
- Modularity: Each script (content, background) is an explicit entry, yielding clearly separated outputs—matches strict separation and single responsibility.
- Testability: Simple config and deterministic output make build/test automation straightforward, and the approach avoids hidden or magic behaviors (explicit over implicit).
- Coding Standards: Rollup enforces ES module purity and tree-shaking by default, and its minimal plugin system keeps dependencies lean.
- Documentation: A single, environment-aware config is easier to explain and maintain; scripts in `package.json` clarify dev/prod usage.

## Build Steps
1. Install Rollup and core plugins (`@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `rollup-plugin-terser` for prod).
2. Create a single `rollup.config.js` with multiple input entries (e.g., `content-consolidated.js`, `background.js`), outputting IIFE bundles to `/dist` with static filenames matching `manifest.json`.
3. Configure plugins: `node-resolve` for module resolution, `commonjs` if any CJS deps, `terser` only in production, and disable dynamic imports to satisfy extension CSP.
4. Use `process.env.NODE_ENV` or CLI flags to toggle dev/prod config (source maps, minification).
5. Document the build process and outputs in `README.md` (with rationale for Rollup, how to add entry points, and how `manifest.json` is wired).
6. Add `build:dev` and `build:prod` scripts to `package.json`, ensuring the build step rewrites (or checks) `manifest.json` output paths if needed.
7. (Optional) Add a simple watcher or `rollup-plugin-serve` for hot reload in dev, as needed for rapid iteration.
```
