import {matchAllBannerManifest} from './matchAllBannerManifest';
import {ScriptableBannerManifestKeys, ScriptableManifest, ScriptableShareSheetInputs} from './types';

export function extractScriptableManifest(
  script: string,
  attrs: ScriptableBannerManifestKeys[] = [],
): Partial<ScriptableManifest> {
  const manifest: Partial<ScriptableManifest> = {};
  const lines = script.split('\n', 20);
  attrs = attrs.length ? attrs : [...ScriptableBannerManifestKeys];

  for (const line of lines) {
    const matches = matchAllBannerManifest(line);
    if (matches.length) {
      for (const m of matches) {
        const [, key, value] = m;
        if (attrs.includes(key as ScriptableBannerManifestKeys)) {
          switch (key as ScriptableBannerManifestKeys) {
            case 'always-run-in-app':
              if (manifest.always_run_in_app === undefined) manifest.always_run_in_app = value === 'true';
              break;
            case 'share-sheet-inputs':
              if (!manifest.share_sheet_inputs)
                manifest.share_sheet_inputs = value.split(',').map(v => v.trim()) as ScriptableShareSheetInputs;
              break;
            case 'icon-color':
              if (!manifest.icon) {
                manifest.icon = {};
              }
              if (manifest.icon.color === undefined) manifest.icon.color = value.trim();
              break;
            case 'icon-glyph':
              if (!manifest.icon) {
                manifest.icon = {};
              }
              if (manifest.icon.glyph === undefined) manifest.icon.glyph = value.trim();
              break;
          }
        }
      }
    }
  }

  return manifest;
}
