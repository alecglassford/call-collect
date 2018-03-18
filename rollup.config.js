import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import sass from 'rollup-plugin-sass';
import purifycss from 'purify-css';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

export default [
  { // Rollup the Svelte client
    input: 'client/app/main.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'public/bundle-app.js',
      name: 'app',
    },
    plugins: [
      svelte({
        dev: !production,
        css: (css) => {
          css.write('public/bundle-app.css');
        },
        store: true,
        cascade: false,
      }),
      resolve(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': '"production"' }),
      production && buble({ exclude: 'node_modules/**' }),
      production && uglify(),
    ],
    watch: {
      include: 'client/app/**',
    },
  },
  { // Rollup the Widget
    input: 'client/widget/main.js',
    output: {
      sourcemap: true,
      format: 'iife',
      file: 'public/bundle-widget.js',
      name: 'widget',
    },
    plugins: [
      svelte({
        dev: !production,
        css: (css) => {
          css.write('public/bundle-widget.css');
        },
        store: false,
        cascade: false,
      }),
      resolve(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': '"production"' }),
      production && buble({ exclude: 'node_modules/**' }),
      production && uglify(),
    ],
    watch: {
      include: 'client/widget/**',
    },
  },
  { // Rollup the Express server
    input: './server/main.js',
    output: {
      sourcemap: true,
      format: 'cjs',
      file: 'server.js',
    },
    plugins: [
      resolve(),
      commonjs(),
      production && replace({ 'process.env.NODE_ENV': '"production"' }),
    ],
    external: id => id in pkg.dependencies || id === 'crypto' || id === 'fs' || id === 'path',
    watch: {
      include: 'server/**',
    },
  },
  { // Bundle main CSS
    input: 'client/main.scss',
    output: { format: 'es', file: '/dev/null' }, // This doesn't matter
    plugins: [
      sass({
        options: { precision: 6 },
        processor: css => purifycss(['client/**/*.html'], css, { minify: production }),
        output: 'public/bundle-main.css',
      }),
    ],
    watch: {
      include: 'client/**',
    },
  },
];
