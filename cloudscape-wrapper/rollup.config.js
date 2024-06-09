import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';

export default {
  watch: {
  },
  input: './main.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: false,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: false,
    },
  ],
  external: [
    '@cloudscape-design/components',
    'react/jsx-runtime',
    'react',
    'react-dom',
    'react-dom/client',
  ],
  plugins: [
    resolve(),
    typescript({
      exclude: '**/tests/**',
      rollupCommonJSResolveHack: false,
      clean: true,
      tsconfig: './tsconfig.json',
    }),
    postcss({
      modules: false,
      use: [
        [
          'sass',
          {
            includePaths: ['./node_modules'],
          },
        ],
      ],
    }),
    commonjs({
      include: ['../dist/main.js'],
      dynamicRequireTargets:[
        '../dist/main.js',
        '../dist/main.d.ts'
      ]
    }),
  ],
};
