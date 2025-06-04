// @ts-check
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
// @ts-ignore
import terser from '@rollup/plugin-terser';
// @ts-ignore
import copy from 'rollup-plugin-copy';

const production = !process.env.ROLLUP_WATCH;

// Create separate configs for each entry point to support IIFE format
/**
 * @param {string} input - Entry point file
 * @param {string} outputName - Output file name without extension
 * @returns {import('rollup').RollupOptions}
 */
const createConfig = (input, outputName) => ({
  input,
  output: {
    file: `dist/${outputName}.js`,
    format: 'iife',
    sourcemap: !production ? 'inline' : false,
    name: outputName === 'content' ? 'TrumpGogglesContent' : 'TrumpGogglesBackground',
  },
  plugins: [
    nodeResolve({
      browser: true,
      extensions: ['.js', '.ts'],
    }),
    typescript({
      tsconfig: './tsconfig.json',
      // Let Rollup handle module resolution and output
      compilerOptions: {
        // Override tsconfig options for Rollup
        module: 'esnext',
        target: 'es2020',
        declaration: false,
        declarationMap: false,
        composite: false,
        // Use inline helpers instead of tslib
        importHelpers: false,
      },
    }),
    // @ts-ignore
    commonjs({
      extensions: ['.js', '.ts'],
    }),
    production &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      }),
  ].filter(Boolean),
  external: (/** @type {string} */ id) => /^chrome/.test(id), // Don't bundle Chrome APIs
  watch: {
    clearScreen: false,
  },
});

// Export array of configs with shared copy plugin
export default [
  createConfig('src/content/content-consolidated.js', 'content'),
  createConfig('src/background/background-combined.js', 'background'),
].map((config, index) => {
  // Only add copy plugin to first config to avoid duplicates
  if (index === 0 && config.plugins) {
    // @ts-ignore
    config.plugins.push(
      copy({
        targets: [
          { src: 'extension/manifest.json', dest: 'dist' },
          { src: 'images/*', dest: 'dist/images' },
          { src: 'extension/*.html', dest: 'dist' },
          // Copy all dependency modules
          { src: 'src/utils/structured-logger.ts', dest: 'dist', rename: 'structured-logger.js' },
          { src: 'src/utils/logger-context.ts', dest: 'dist', rename: 'logger-context.js' },
          { src: 'src/utils/logger-adapter.ts', dest: 'dist', rename: 'logger-adapter.js' },
          { src: 'src/utils/logger-factory.ts', dest: 'dist', rename: 'logger-factory.js' },
          { src: 'src/content/content-debug.js', dest: 'dist' },
          { src: 'src/utils/logger.js', dest: 'dist' },
          { src: 'src/utils/error-handler.js', dest: 'dist' },
          { src: 'src/utils/browser-detect.js', dest: 'dist' },
          { src: 'src/utils/browser-adapter.js', dest: 'dist' },
          { src: 'src/utils/performance-utils.ts', dest: 'dist', rename: 'performance-utils.js' },
          { src: 'src/utils/security-utils.ts', dest: 'dist', rename: 'security-utils.js' },
          { src: 'src/data/trump-mappings.js', dest: 'dist' },
          { src: 'src/content/dom-processor.js', dest: 'dist' },
          { src: 'src/content/text-processor.js', dest: 'dist' },
          { src: 'src/content/mutation-observer.js', dest: 'dist' },
          { src: 'src/content/dom-modifier.ts', dest: 'dist', rename: 'dom-modifier.js' },
          {
            src: 'src/components/tooltip-browser-adapter.ts',
            dest: 'dist',
            rename: 'tooltip-browser-adapter.js',
          },
          { src: 'src/components/tooltip-ui.ts', dest: 'dist', rename: 'tooltip-ui.js' },
          { src: 'src/components/tooltip-manager.ts', dest: 'dist', rename: 'tooltip-manager.js' },
        ],
        hook: 'writeBundle', // Copy after bundle is written
      })
    );
  }
  return config;
});
