````
## Chosen Approach
Use Rollup with IIFE output format, separate entry points for extension scripts, and environment-specific configs.

## Rationale
- **Simplicity**: Rollup has simpler configuration than webpack, aligning with our "Simplicity First" principle
- **Modularity**: Clear separation between content/background scripts matches our "Do One Thing Well" philosophy
- **Testability**: Rollup's deterministic output enables easier verification of browser extension compatibility
- **Coding Standards**: Rollup's ES Module focus aligns with our strict type system requirements
- **Docs Approach**: Single Rollup config with env flags provides clear documentation surface

## Build Steps
1. Install Rollup and required plugins:
   ```bash
   npm install rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-replace rollup-plugin-terser --save-dev
````

2. Create base Rollup config (`rollup.config.js`):

   ```javascript
   import { nodeResolve } from '@rollup/plugin-node-resolve';
   import commonjs from '@rollup/plugin-commonjs';
   import { terser } from 'rollup-plugin-terser';
   import replace from '@rollup/plugin-replace';

   const isProd = process.env.NODE_ENV === 'production';

   export default {
     input: {
       'content-script': 'src/content-script.js',
       background: 'src/background.js',
     },
     output: {
       dir: 'dist',
       format: 'iife',
       sourcemap: !isProd,
     },
     plugins: [
       replace({
         'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
       }),
       nodeResolve(),
       commonjs(),
       isProd && terser(),
     ],
   };
   ```

3. Add build scripts to package.json:

   ```json
   "scripts": {
     "build": "NODE_ENV=production rollup -c",
     "dev": "NODE_ENV=development rollup -c -w"
   }
   ```

4. Configure manifest.json to reference built files:

   ```json
   {
     "background": {
       "scripts": ["dist/background.js"]
     },
     "content_scripts": [
       {
         "js": ["dist/content-script.js"]
       }
     ]
   }
   ```

5. Document the build process in README.md with:
   - Development workflow (`npm run dev`)
   - Production build instructions (`npm run build`)
   - Environment variable requirements

```

```
