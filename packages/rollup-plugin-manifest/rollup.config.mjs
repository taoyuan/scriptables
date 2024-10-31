import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import * as fs from 'fs';
import * as glob from 'glob';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const inputFiles = glob.sync('./src/**/*.ts');

export default {
  input: inputFiles,
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      preserveModules: true,
      entryFileNames: '[name].js',
    },
    {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      entryFileNames: '[name].mjs',
    },
  ],
  external: [...Object.keys(pkg.dependencies || []), ...Object.keys(pkg.devDependencies || []), /\.node$/],
  plugins: [resolve(), commonjs(), json(), typescript()],
};
