import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { dts } from 'rollup-plugin-dts';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get package.json data
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Base rollup configuration
const baseConfig = {
  plugins: [
    // Automatically externalize peer dependencies
    peerDepsExternal(),
    
    resolve(),
    
    commonjs(),
    
    // Process CSS with PostCSS
    postcss({
      plugins: [
        autoprefixer(),
        cssnano({
          preset: 'default',
        }),
      ],
      inject: false, // Don't inject CSS into JS
      extract: path.resolve('dist/styles.css'),
      minimize: true,
      sourceMap: true,
    }),
  ],
  external: ['react', 'react-dom'],
};

// Output formats
const outputFormats = [
  {
    file: file => `dist/${file}.js`,
    format: 'cjs',
    sourcemap: true,
  },
  {
    file: file => `dist/${file}.esm.js`,
    format: 'esm',
    sourcemap: true,
  },
];

// Config for main package
const coreConfig = {
  ...baseConfig,
  input: 'src/index.ts',
  output: outputFormats.map(format => ({
    ...format,
    file: format.file('index'),
  })),
  plugins: [
    ...baseConfig.plugins,
    // Compile TypeScript for core
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      outDir: 'dist',
      jsx: 'react',
    }),
  ],
};

// Config for TanStack adapter
const tanstackConfig = {
  ...baseConfig,
  input: 'src/adapters/tanstack/index.tsx',
  output: outputFormats.map(format => ({
    ...format,
    file: format.file('tanstack'),
  })),
  plugins: [
    ...baseConfig.plugins,
    // Compile TypeScript for TanStack adapter
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      outDir: 'dist',
      jsx: 'react',
    }),
  ],
  external: [...baseConfig.external, '@tanstack/react-table', './index'],
};

// Type declarations bundle for core
const coreTypesConfig = {
  input: 'dist/types/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()],
  external: [/\.css$/],
};

// Type declarations bundle for TanStack adapter
const tanstackTypesConfig = {
  input: 'dist/types/adapters/tanstack/index.d.ts',
  output: [{ file: 'dist/tanstack.d.ts', format: 'es' }],
  plugins: [dts()],
  external: [/\.css$/],
};

// Export all configs
export default [
  coreConfig,
  tanstackConfig,
  coreTypesConfig,
  tanstackTypesConfig,
];