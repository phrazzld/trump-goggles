```
## Chosen Approach
Configure Webpack with a single, environment-aware configuration file (`webpack.config.js`) to bundle ES Modules for the browser extension, handling multiple entry points, assets, and supporting distinct development and production builds.

## Rationale
- **Simplicity:** A single configuration file, while potentially long, is simpler than managing multiple files and a merge strategy (`webpack-merge`), reducing setup overhead and file count.
- **Modularity:** Webpack effectively processes ES Module imports/exports and supports defining multiple entry points required for content scripts and background scripts.
- **Testability:** Webpack's source map generation capabilities are robust, crucial for debugging bundled code during development and testing.
- **Ecosystem & Features:** Webpack's extensive ecosystem and application-centric focus provide well-supported solutions (loaders, plugins) for handling various asset types, transpilation (via Babel), and establishing effective Hot Module Replacement (HMR) for browser extensions, which aligns well with the task's requirements for an application-like build.
- **Automation:** Integrating a single configuration file into `package.json` scripts and CI is straightforward, supporting the principle of automating everything.

## Build Steps
1.  Install Webpack, Webpack CLI, and necessary plugins/loaders (e.g., `babel-loader`, `@babel/core`, `@babel/preset-env`, `copy-webpack-plugin`, a suitable HMR plugin for extensions, optimization plugins) via npm/yarn/pnpm.
2.  Create a `webpack.config.js` file at the project root.
3.  Inside `webpack.config.js`, define the `entry` object mapping logical names (e.g., `content-script`, `background`) to the source ES Module files (`src/content-consolidated.js`, `src/background.js`, etc.).
4.  Configure the `output` object to specify the build directory (e.g., `dist/`) and filename patterns (e.g., `[name].bundle.js`) ensuring unique names for entry points.
5.  Set the `mode` option based on environment (e.g., `process.env.NODE_ENV === 'production' ? 'production' : 'development'`) to automatically apply built-in optimizations or development features.
6.  Add `module.rules` to define how different file types are processed, including using `babel-loader` for `.js` files to transpile ES Modules and potentially newer syntax.
7.  Include `plugins` such as `CopyWebpackPlugin` to copy static assets like `manifest.json` and icons to the build directory, and configure HMR plugins for development builds.
8.  Configure optimization settings within the config, enabling minification and tree-shaking for production builds.
9.  Update `package.json` with `scripts` for `build` (e.g., `webpack --node-env=production`) and `dev` or `watch` (e.g., `webpack --watch --node-env=development`).
10. Document the configuration details, build commands, and output structure in the project's `README.md`.
```
