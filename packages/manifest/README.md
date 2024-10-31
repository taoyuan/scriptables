# @scriptables/manifest

An utilities to generate, parse, and update manifest headers in [Scriptable](https://scriptable.app) scripts.

## Overview

[Scriptable](https://scriptable.app) scripts can include special manifest comments at the top of the file that configure
various script behaviors and appearance settings. This library makes it easy to work with these manifests
programmatically.

Example manifest:

```
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: circle; always-run-in-app: true; share-sheet-inputs: file-url, url;
```

## Installation

Choose your preferred package manager:

```bash
# npm
npm install @scriptables/manifest

# yarn
yarn add @scriptables/manifest

# pnpm
pnpm add @scriptables/manifest

# bun
bun add @scriptables/manifest
```

## API

### Functions

#### `generateScriptableBanner(manifest?: ScriptableManifest, noDefaults = false): string`

Generates a complete Scriptable manifest banner with the specified settings.

```typescript
const manifest = {
  icon: {
    color: 'red',
    glyph: 'square',
  },
  always_run_in_app: true,
  share_sheet_inputs: ['file-url', 'url'],
};

const banner = generateScriptableBanner(manifest);
```

#### `extractScriptableManifest(script: string, attrs?: ScriptableBannerManifestKeys[]): Partial<ScriptableManifest>`

Extracts manifest settings from a script's content.

```typescript
const script = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: square;

console.log('Hello world');`;

const manifest = extractScriptableManifest(script);
// Result: { icon: { color: 'red', glyph: 'square' } }
```

#### `mergeScriptableBanner(script: string, manifestOrOldScript?: Partial<ScriptableManifest> | string): [string, string]`

Updates an existing script's manifest with new settings. Returns a tuple of [banner, mergedScript].

```typescript
const [banner, mergedScript] = mergeScriptableBanner(script, {
  icon: {
    color: 'blue',
    glyph: 'circle',
  },
});
```

### Helper Functions

- `hasBannerManifest(script: string): boolean` - Checks if a script has a manifest banner
- `isStaticBanner(line: string): boolean` - Checks if a line is part of the static banner
- `isManifestBanner(line: string): boolean` - Checks if a line contains manifest settings
- `isScriptableBanner(line: string): boolean` - Checks if a line is part of any banner type

## Types

```typescript
interface ScriptableManifest {
  always_run_in_app?: boolean;
  share_sheet_inputs?: ScriptableShareSheetInputs;
  icon?: {
    color?: string;
    glyph?: string;
  };
}

type ScriptableShareSheetInputs = Array<'file-url' | 'url' | 'plain-text' | 'images'>;

enum ScriptableBannerManifestKeys {
  'always-run-in-app',
  'share-sheet-inputs',
  'icon-color',
  'icon-glyph',
}
```

## Usage Examples

### Basic Usage

```typescript
import {generateScriptableBanner, mergeScriptableBanner} from '@scriptables/manifest';

// Generate a new banner
const manifest = {
  icon: {
    color: 'red',
    glyph: 'square',
  },
};
const banner = generateScriptableBanner(manifest);

// Update existing script
const script = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: circle;

console.log('Hello world');`;

const [newBanner, mergedScript] = mergeScriptableBanner(script, manifest);
```

### Extract and Modify Manifest

```typescript
import {extractScriptableManifest, mergeScriptableBanner} from '@scriptables/manifest';

// Extract existing manifest
const script = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: circle;

console.log('Hello world');`;

const manifest = extractScriptableManifest(script);

// Modify manifest
manifest.icon.color = 'red';

// Update script with modified manifest
const [newBanner, mergedScript] = mergeScriptableBanner(script, manifest);
```

### Merge with old script

```typescript
import {mergeScriptableBanner} from '@scriptables/manifest';

const oldScript = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: circle;

console.log('Hello world');`;

const newScript = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: square;

console.log('Hello world');`;

const [newBanner, mergedScript] = mergeScriptableBanner(newScript, oldScript);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

This project draws inspiration and references code from:

- [rollup-plugin-scriptable](https://github.com/jag-k/rollup-plugin-scriptable)

Special thanks to jag-k for their contributions to the Scriptable community.

## License

Apache-2.0
