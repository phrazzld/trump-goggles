// @ts-check
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
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
    }),
    // @ts-ignore
    commonjs(),
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
  createConfig('content-consolidated.js', 'content'),
  createConfig('background-combined.js', 'background'),
].map((config, index) => {
  // Only add copy plugin to first config to avoid duplicates
  if (index === 0 && config.plugins) {
    // @ts-ignore
    config.plugins.push(
      copy({
        targets: [
          { src: 'manifest.json', dest: 'dist' },
          { src: 'images/*', dest: 'dist/images' },
          { src: '*.html', dest: 'dist' },
        ],
        hook: 'writeBundle', // Copy after bundle is written
      })
    );
  }
  return config;
});
