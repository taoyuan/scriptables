# @scriptables/rollup-plugin-manifest

> A rollup plugin helps create a Scriptable bundle from your project by automating manifest and comment generation.

## Installation

To install the plugin, use npm or yarn:

```sh
npm install rollup-plugin-manifest --save-dev
# or
yarn add rollup-plugin-manifest --dev
```

## Usage

Add the plugin to your `rollup.config.js`:

```javascript
import bundle from 'rollup-plugin-manifest';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  plugins: [bundle()],
  // or customize the manifest file extension
  // plugins: [bundle({ manifest: mockManifest, bundleManifest: { extension: '.json' } })],
};
```

## Options

The plugin accepts the following options:

- `manifest`: An object representing the manifest data.
- `bundleManifest`: A boolean or object to configure manifest bundling. Default is `true`.
  - `extension`: The file extension for the manifest file. Default is `.manifest.json`.

## Example

```javascript
import bundle from 'rollup-plugin-manifest';

const mockManifest = {
  name: 'Example Script',
  version: '1.0.0',
};

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  // disable manifest bundling
  plugins: [bundle({manifest: mockManifest, bundleManifest: false})],
};
```

## Acknowledgements

Portions of code and functionality are referenced from the
[rollup-plugin-manifest](https://github.com/jag-k/rollup-plugin-manifest) project. Many thanks!

## License

This project is licensed under the Apache-2.0 License.
