## Chosen Approach

Use Rollup to bundle the ES Module-based browser extension, configuring it for multiple entry points (content scripts, background scripts) with separate output bundles, and implementing environment-specific configurations (development with source maps and HMR, production with minification).

## Rationale

- **Simplicity:** Rollup's configuration is simpler and more focused for our use case, aligning with the project's ES Modules and small-to-medium size.
- **Modularity:** Rollup's tree-shaking and efficient bundling produce optimized output, enhancing modularity and reducing bundle size.
- **Testability:** The configuration is straightforward, making it easier to test the build process and output bundles.
- **Coding Standards:** Rollup's plugin ecosystem allows us to enforce coding standards (e.g., linting, type-checking) during the build.
- **Docs Approach:** The configuration and build steps can be documented concisely, ensuring clarity and maintainability.

## Build Steps

1. **Install Rollup and plugins:**

   ```sh
   npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-cleaner rollup-plugin-terser @rollup/plugin-replace rollup-plugin-livereload rollup-plugin-serve
   ```

2. **Create `rollup.config.js`:**

   ```javascript
   import resolve from '@rollup/plugin-node-resolve';
   import commonjs from '@rollup/plugin-commonjs';
   import typescript from '@rollup/plugin-typescript';
   import cleaner from 'rollup-plugin-cleaner';
   import { terser } from 'rollup-plugin-terser';
   import replace from '@rollup/plugin-replace';
   import livereload from 'rollup-plugin-livereload';
   import serve from 'rollup-plugin-serve';

   const isProduction = process.env.NODE_ENV === 'production';

   const plugins = [
     cleaner({ targets: ['./dist/'] }),
     resolve(),
     commonjs(),
     typescript(),
     replace({
       'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
       preventAssignment: true,
     }),
   ];

   if (!isProduction) {
     plugins.push(serve({ contentBase: 'dist', port: 8000 }), livereload({ watch: 'dist' }));
   } else {
     plugins.push(terser());
   }

   export default [
     {
       input: 'src/content-script.ts',
       output: {
         file: 'dist/content-script.js',
         format: 'iife',
         sourcemap: !isProduction,
       },
       plugins,
     },
     {
       input: 'src/background.ts',
       output: {
         file: 'dist/background.js',
         format: 'iife',
         sourcemap: !isProduction,
       },
       plugins,
     },
   ];
   ```

3. **Update `manifest.json` to reference the built files:**

   ```json
   {
     "content_scripts": [
       {
         "matches": ["<all_urls>"],
         "js": ["dist/content-script.js"]
       }
     ],
     "background": {
       "service_worker": "dist/background.js"
     }
   }
   ```

4. **Add build scripts to `package.json`:**

   ```json
   {
     "scripts": {
       "build": "NODE_ENV=production rollup -c",
       "dev": "rollup -c -w"
     }
   }
   ```

5. **Document the build process in `README.md` or `BUILD.md`.**
