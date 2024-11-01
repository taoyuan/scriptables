import {ScriptableBannerManifest, ScriptableBannerManifestKeys, ScriptableManifest} from './types';

export function generateManifestText(manifest: ScriptableManifest = {}, noDefaults = false): string {
  const bannerManifest: ScriptableBannerManifest = {
    'always-run-in-app': manifest.always_run_in_app,
    'share-sheet-inputs': manifest.share_sheet_inputs?.join(', '),
    'icon-color': manifest.icon?.color ?? (noDefaults ? '' : 'blue'),
    'icon-glyph': manifest.icon?.glyph ?? (noDefaults ? '' : 'circle'),
  };

  return Object.keys(bannerManifest)
    .filter(key => !!bannerManifest[key as ScriptableBannerManifestKeys])
    .map(key => `${key}: ${bannerManifest[key as ScriptableBannerManifestKeys]};`)
    .join(' ');
}
