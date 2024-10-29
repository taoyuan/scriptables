import typescript from '@rollup/plugin-typescript';
import packageJson from './package.json' assert {type: 'json'};

export default {
  input: 'src/index.ts',
  external: [...Object.keys(packageJson.dependencies || [])],
  output: [
    {file: packageJson.main, format: 'cjs', sourcemap: true, exports: 'auto'},
    {file: packageJson.module, format: 'es', sourcemap: true},
  ],
  plugins: [typescript()],
};
