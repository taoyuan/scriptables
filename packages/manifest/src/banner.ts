import {ScriptableManifest} from './types';

interface BannerMetadata {
  'always-run-in-app'?: boolean | string;
  'share-sheet-inputs'?: string;
  'icon-color'?: string;
  'icon-glyph'?: string;

  [key: string]: boolean | string | number | undefined;
}

export function generateBanner(manifest: ScriptableManifest = {}): string {
  const bannerMetadata: BannerMetadata = {
    'always-run-in-app': manifest.always_run_in_app || false,
    'share-sheet-inputs': manifest.share_sheet_inputs ? manifest.share_sheet_inputs.join(', ') : '',
  };

  if (manifest.icon) {
    if (manifest.icon.color) {
      bannerMetadata['icon-color'] = manifest.icon.color;
    }
    if (manifest.icon.glyph) {
      bannerMetadata['icon-glyph'] = manifest.icon.glyph;
    }
  }

  const manifestText = Object.keys(bannerMetadata)
    .filter(key => !!bannerMetadata[key])
    .map(key => `${key}: ${bannerMetadata[key]};`)
    .join(' ');

  return (
    `// Variables used by Scriptable.\n` +
    `// These must be at the very top of the file. Do not edit.\n` +
    `// ${manifestText}\n`
  );
}
