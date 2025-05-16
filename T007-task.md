# T007-task.md

1. **Task ID:** T007
2. **Title:** configure bundler (webpack/rollup) for ES Module browser extension build

3. **Original Ticket Text:**

   ```
   - [ ] **T007 · Chore · P0: configure bundler (webpack/rollup) for ES Module browser extension build**

     - **Context:** PLAN.md, CR-01, Step 3
     - **Action:**
       1. Select and configure a bundler (webpack or rollup) to process the new ES Modules.
       2. Ensure the bundler output is compatible with the browser extension environment (e.g., content scripts).
     - **Done‑when:**
       1. Bundler successfully processes ES Module imports/exports and generates an output bundle.
       2. Build process is documented for development and production.
     - **Depends‑on:** [T001, T002, T003, T004, T005]
   ```

4. **Implementation Approach Analysis Prompt:**

   ## Task Context

   We need to configure a bundler for our ES Module-based browser extension. The key requirements are:

   - Process ES Module imports/exports
   - Generate browser extension-compatible output
   - Work with manifest.json requirements
   - Support content scripts, background scripts
   - Handle DOM manipulation libraries
   - Consider hot reloading for development

   ## Design Decisions Required

   1. **Bundler Selection**: webpack vs rollup
      - webpack: more popular, excellent ecosystem, complex configuration
      - rollup: simpler configuration, better tree-shaking, designed for libraries
   2. **Output Format**:
      - IIFE for immediate execution in browser extension context
      - Multiple entry points (content script, background script)
   3. **Development vs Production**:
      - Dev: source maps, hot reloading, minimal optimization
      - Prod: minification, optimization, no source maps
   4. **Configuration Structure**:
      - Single config with env-based variations?
      - Separate dev/prod configs?

   ## Technical Considerations

   - Browser extensions have specific requirements:
     - Content scripts run in isolated environment
     - Background scripts have different API access
     - Cannot use dynamic imports
     - Module system must be compatible with browser extension CSP
   - Existing project structure uses:
     - Pure ES Modules (no TypeScript yet)
     - Multiple entry points (content-consolidated.js, background scripts)
     - DOM manipulation and browser APIs

   ## Questions to Resolve

   1. Should we use webpack or rollup?
   2. How do we handle multiple entry points?
   3. What's the best way to structure dev/prod builds?
   4. How do we ensure manifest.json points to correct built files?
   5. Should we add build scripts to package.json?
