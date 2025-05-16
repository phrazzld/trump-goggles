```
## Chosen Approach
Configure Rollup as the bundler for ES Module browser extension build with a single config supporting dev/prod environments.

## Rationale
- Rollup wins over webpack due to its simplicity and better tree-shaking, aligning with the core philosophy of "Simplicity First" by reducing configuration complexity and producing smaller bundles.
- A single config with environment-based variations ensures maintainability and modularity, adhering to "Modularity is Mandatory" by keeping build logic cohesive and adaptable.
- Rollup’s straightforward setup supports testability with minimal mocking needs, fitting "Design for Testability" by enabling clear build process verification.
- Documentation will focus on the "why" behind Rollup’s selection and configuration choices, matching the "Document Decisions, Not Mechanics" principle for clarity on rationale.

## Build Steps
1. Install Rollup and necessary plugins (`@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `@rollup/plugin-terser` for production) via npm to handle ES Modules and optimize output.
2. Create a `rollup.config.js` at the project root with multiple entry points for content scripts (`content-consolidated.js`) and background scripts, outputting IIFE format for browser extension compatibility.
3. Define environment-based configurations in the Rollup config using `process.env.NODE_ENV` to toggle source maps and hot reloading for development, and minification with `@rollup/plugin-terser` for production.
4. Set output paths in the config to ensure `manifest.json` references the correct bundled files (e.g., `dist/content.js`, `dist/background.js`), maintaining extension structure.
5. Add build scripts to `package.json` for development (`rollup -c --environment NODE_ENV=development`) and production (`rollup -c --environment NODE_ENV=production`) builds.
6. Document the build process in a `BUILD.md` file, explaining Rollup’s selection over webpack for simplicity and tree-shaking, configuration rationale for dev/prod, and execution instructions for each environment.
7. Test the build by running both dev and prod scripts, verifying output bundles work in the browser extension context (content scripts inject correctly, background scripts execute as expected).
8. Integrate the build process into CI/CD pipelines to automate bundling and validation on commits, ensuring consistency as per "Automate Everything."
```
