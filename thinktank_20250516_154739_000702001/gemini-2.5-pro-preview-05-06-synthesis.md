## Chosen Approach

Rollup with multi-entry configuration, IIFE output, and environment-specific builds managed via a single configuration file, prioritizing simplicity and efficient bundling for ES Modules in a browser extension context.

## Rationale

- **Simplicity:** Rollup's minimal configuration is significantly simpler than Webpack's for this task, directly aligning with the "Simplicity First" philosophy by avoiding unnecessary complexity for ES Module bundling and multiple entry points.
- **Modularity + strict separation:** Rollup excels at tree-shaking ES Modules, producing lean, optimized bundles for each entry point (content script, background script), which supports strict separation of concerns and adheres to "Do One Thing Well."
- **Testability:** The deterministic and clean output from Rollup makes it easier to verify that the bundled scripts meet browser extension requirements and integrate correctly, minimizing the need for complex test setups.
- **Coding Standards:** Rollup is designed for ES Modules, naturally promoting modern JavaScript standards. Its output is clean and directly usable in browser extension environments respecting Content Security Policies (CSP) when configured for IIFE and avoiding dynamic imports.
- **Documentation Approach:** A single, declarative Rollup configuration file, along with clear `package.json` scripts, is easier to document and understand, focusing on _what_ is being built rather than complex tooling mechanics.

## Build Steps

1.  **Install Dependencies:**
    Install Rollup and essential plugins for resolving Node modules, handling CommonJS modules (if any are used by dependencies), and minifying code for production.

    ```bash
    npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-terser
    ```

2.  **Create Rollup Configuration (`rollup.config.js`):**
    Create a `rollup.config.js` file in the project root. This configuration will define entry points, output formats, and plugins. We'll use `process.env.ROLLUP_WATCH` to differentiate between development (watch mode) and production builds.

    ```javascript
    import { nodeResolve } from '@rollup/plugin-node-resolve';
    import commonjs from '@rollup/plugin-commonjs';
    import terser from '@rollup/plugin-terser'; // Updated import for newer versions

    // Determine if it's a production build (not in watch mode)
    const production = !process.env.ROLLUP_WATCH;

    export default {
      input: {
        // Define entry points for your extension scripts
        // Replace with your actual source file paths
        'content-script': 'src/content-consolidated.js',
        background: 'src/background.js',
        // Add other entry points like popup.js if needed
      },
      output: {
        dir: 'dist', // Output directory for bundled files
        format: 'iife', // Immediately Invoked Function Expression, suitable for browser scripts
        sourcemap: !production ? 'inline' : false, // Generate inline sourcemaps for dev, none for prod
      },
      plugins: [
        nodeResolve(), // Resolves node_modules
        commonjs(), // Converts CommonJS modules to ES6
        production && terser(), // Minify code only in production
      ],
    };
    ```

3.  **Add Build Scripts to `package.json`:**
    Add scripts to your `package.json` for easy development and production builds.

    ```json
    {
      "scripts": {
        "build": "rollup -c",
        "dev": "rollup -c -w"
      }
    }
    ```

    - `npm run build`: Creates a production-ready build (minified, no sourcemaps).
    - `npm run dev`: Starts Rollup in watch mode for development (rebuilds on file changes, includes sourcemaps).

4.  **Update `manifest.json`:**
    Ensure your `manifest.json` file points to the bundled output files in the `dist` directory.

    ```json
    {
      "manifest_version": 3,
      "name": "My Extension",
      "version": "1.0",
      "background": {
        "service_worker": "dist/background.js"
      },
      "content_scripts": [
        {
          "matches": ["<all_urls>"],
          "js": ["dist/content-script.js"]
        }
      ]
      // ... other manifest properties
    }
    ```

5.  **Document the Build Process:**
    In your project's `README.md` or a dedicated `DEVELOPER.md` file, document:

    - How to install dependencies.
    - How to run development builds (`npm run dev`) and what it provides (watch mode, sourcemaps).
    - How to run production builds (`npm run build`) and what it provides (minification, optimization).
    - The structure of the `rollup.config.js` and how to add new entry points.
    - The relationship between the build output in `dist/` and the `manifest.json` references.

6.  **Verify Build Output:**
    - Run `npm run dev` and load the unpacked extension into your browser to test content scripts and background scripts with sourcemaps available for debugging.
    - Run `npm run build` and test the production version to ensure it works as expected and is optimized.
    - Confirm that ES Module imports/exports are correctly processed and bundled.
