````
## Chosen Approach
Rollup with multi-entry configuration, IIFE output, and environment-specific builds.

## Rationale
- **Simplicity:** Rollup's minimal config aligns with core philosophy, avoiding Webpack's complexity.
- **Modularity:** Native ES module handling and tree-shaking maintain strict code separation.
- **Testability:** Clear bundle outputs enable straightforward verification of script boundaries.
- **Coding Standards:** Zero-config tree-shaking produces compliant browser-safe code by default.
- **Docs Approach:** Rollup's declarative config maps directly to manifest.json requirements.

## Build Steps
1. Install core dependencies:
   ```bash
   npm install rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-terser --save-dev
````

2. Create base `rollup.config.js`:

   ```javascript
   import { nodeResolve } from '@rollup/plugin-node-resolve';
   import commonjs from '@rollup/plugin-commonjs';
   import terser from '@rollup/plugin-terser';

   const production = !process.env.ROLLUP_WATCH;

   export default {
     input: {
       content: 'src/content/index.js',
       background: 'src/background/index.js',
     },
     output: {
       dir: 'dist',
       format: 'iife',
       sourcemap: !production,
     },
     plugins: [nodeResolve(), commonjs(), production && terser()],
   };
   ```

3. Add package.json scripts:

   ```json
   {
     "scripts": {
       "build": "rollup -c",
       "dev": "rollup -c -w"
     }
   }
   ```

4. Update manifest.json to reference dist/ outputs:

   ```json
   {
     "background": { "scripts": ["dist/background.js"] },
     "content_scripts": [
       {
         "js": ["dist/content.js"]
       }
     ]
   }
   ```

5. Document build process in DEVELOPER.md:
   - Production: `npm run build` (minified, no sourcemaps)
   - Development: `npm run dev` (watch mode, sourcemaps)
   - Entry point configuration requirements
   - Manifest.json output mapping rules

```

```
