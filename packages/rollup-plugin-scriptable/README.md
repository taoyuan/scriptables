# rollup-plugin-scriptable

> A rollup plugin helps create a Scriptable bundle from your project by automating manifest and comment generation.

## Installation

To install the plugin, use npm or yarn:

```sh
npm install rollup-plugin-scriptable --save-dev
# or
yarn add rollup-plugin-scriptable --dev
```

## Usage

Add the plugin to your `rollup.config.js`:

```javascript
import scriptableBundle from 'rollup-plugin-scriptable';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  plugins: [scriptableBundle()],
  // or customize the manifest file extension
  // plugins: [scriptableBundle({ manifest: mockManifest, bundleManifest: { extension: '.json' } })],
};
```

## Options

The plugin accepts the following options:

- `manifest`: An object representing the manifest data.
- `bundleManifest`: A boolean or object to configure manifest bundling. Default is `true`.
  - `extension`: The file extension for the manifest file. Default is `.manifest.json`.

## Example

```javascript
import scriptableBundle from 'rollup-plugin-scriptable';

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
  plugins: [scriptableBundle({manifest: mockManifest, bundleManifest: false})],
};
```

## Acknowledgements

Portions of code and functionality are referenced from the
[rollup-plugin-scriptable](https://github.com/jag-k/rollup-plugin-scriptable) project. Many thanks!

## License

This project is licensed under the Apache-2.0 License.
