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

/**
 * Create config for individual TypeScript modules that need to be standalone files
 * @param {string} input - TypeScript source file path
 * @param {string} outputName - Output file name without extension
 * @returns {import('rollup').RollupOptions}
 */
const createTypeScriptModuleConfig = (input, outputName) => ({
  input,
  output: {
    file: `dist/${outputName}.js`,
    format: 'iife',
    sourcemap: !production ? 'inline' : false,
    name: `TrumpGoggles${outputName.replace(/-/g, '')}`, // Convert kebab-case to PascalCase
  },
  plugins: [
    nodeResolve({
      browser: true,
      extensions: ['.js', '.ts'],
    }),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        module: 'esnext',
        target: 'es2020',
        declaration: false,
        declarationMap: false,
        composite: false,
        importHelpers: false,
      },
    }),
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
  external: (id) => /^chrome/.test(id),
  watch: {
    clearScreen: false,
  },
});

// TypeScript modules that need individual compilation
const typeScriptModules = [
  { input: 'src/utils/structured-logger.ts', output: 'structured-logger' },
  { input: 'src/utils/logger-context.ts', output: 'logger-context' },
  { input: 'src/utils/logger-adapter.ts', output: 'logger-adapter' },
  { input: 'src/utils/logger-factory.ts', output: 'logger-factory' },
  { input: 'src/utils/performance-utils.ts', output: 'performance-utils' },
  { input: 'src/utils/security-utils.ts', output: 'security-utils' },
  { input: 'src/content/dom-modifier.ts', output: 'dom-modifier' },
  { input: 'src/components/tooltip-browser-adapter.ts', output: 'tooltip-browser-adapter' },
  { input: 'src/components/tooltip-ui.ts', output: 'tooltip-ui' },
  { input: 'src/components/tooltip-manager.ts', output: 'tooltip-manager' },
];

// Main bundle configs
const mainConfigs = [
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
          // Copy JavaScript modules (TypeScript modules are compiled separately)
          { src: 'src/content/content-debug.js', dest: 'dist' },
          { src: 'src/utils/logger.js', dest: 'dist' },
          { src: 'src/utils/error-handler.js', dest: 'dist' },
          { src: 'src/utils/browser-detect.js', dest: 'dist' },
          { src: 'src/utils/browser-adapter.js', dest: 'dist' },
          { src: 'src/data/trump-mappings.js', dest: 'dist' },
          { src: 'src/content/dom-processor.js', dest: 'dist' },
          { src: 'src/content/text-processor.js', dest: 'dist' },
          { src: 'src/content/mutation-observer.js', dest: 'dist' },
        ],
        hook: 'writeBundle', // Copy after bundle is written
      })
    );
  }
  return config;
});

// TypeScript module configs
const typeScriptConfigs = typeScriptModules.map(({ input, output }) =>
  createTypeScriptModuleConfig(input, output)
);

// Export all configs
export default [...mainConfigs, ...typeScriptConfigs];
