# @scriptables/manifest

@scriptables/manifest is a toolkit designed to streamline Scriptable script development by automating manifest and
comment generation for better documentation and maintainability.

## Installation

To install the package, use the following command:

```sh
yarn add @scriptables/manifest
```

or with npm:

```sh
npm install @scriptables/manifest
```

## Usage

To use the `generateBanner` function, import it and pass the manifest object:

```typescript
import generateBanner from '@scriptables/manifest';

const meta = {
  name: 'Test Script',
  always_run_in_app: true,
  icon: {
    color: 'red',
    glyph: 'star',
  },
  share_sheet_inputs: ['file-url', 'url'],
};

const banner = generateBanner(meta);
console.log(banner);
```

## Acknowledgements

Portions of code and functionality are referenced from the
[rollup-plugin-scriptable](https://github.com/jag-k/rollup-plugin-scriptable) project. Many thanks!

## License

This project is licensed under the Apache-2.0 License.
