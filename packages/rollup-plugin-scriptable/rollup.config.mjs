import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert {type: 'json'};

export default {
  input: 'src/index.ts',
  external: [...Object.keys(pkg.dependencies || [])],
  output: [
    {file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named'},
    {file: pkg.module, format: 'es', sourcemap: true},
  ],
  plugins: [json(), typescript({outputToFilesystem: true})],
};
