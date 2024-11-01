import {SCRIPTABLE_BANNER_STATIC_LINES} from './consts';
import {extractScriptableManifest} from './extractScriptableManifest';
import {generateScriptableBanner} from './generateScriptableBanner';
import {isStaticBanner} from './isStaticBanner';
import {matchAllBannerManifest} from './matchAllBannerManifest';
import {ScriptableBannerManifestKeys, ScriptableManifest} from './types';

export function mergeScriptableBanner(
  script: string,
  manifestOrOldScript?: Partial<ScriptableManifest> | string,
): [string, string] {
  const manifest =
    typeof manifestOrOldScript === 'string'
      ? extractScriptableManifest(manifestOrOldScript, ['icon-color', 'icon-glyph'])
      : manifestOrOldScript;

  let banner = '';
  let scriptNew = script;
  const newLines = scriptNew.split('\n');

  let matches: RegExpMatchArray[];

  if (scriptNew.trim().includes(SCRIPTABLE_BANNER_STATIC_LINES[0])) {
    for (let line of newLines) {
      if (isStaticBanner(line)) {
        banner += `${line}\n`;
        scriptNew = scriptNew.substring(line.length + 1);
      } else if ((matches = matchAllBannerManifest(line)) && matches.length) {
        scriptNew = scriptNew.substring(line.length + 1);

        if (manifest) {
          for (const m of matches) {
            const [, key, value] = m;
            switch (key as ScriptableBannerManifestKeys) {
              case 'always-run-in-app':
                if (manifest.always_run_in_app !== undefined)
                  line = line.replace(value, manifest.always_run_in_app ? 'true' : 'false');
                break;
              case 'share-sheet-inputs':
                if (manifest.share_sheet_inputs) line = line.replace(value, manifest.share_sheet_inputs.join(', '));
                break;
              case 'icon-color':
                if (manifest.icon?.color) line = line.replace(value, manifest.icon?.color);
                break;
              case 'icon-glyph':
                if (manifest.icon?.glyph) line = line.replace(value, manifest.icon?.glyph);
                break;
            }
          }
        }

        banner += `${line}\n`;
      } else {
        break;
      }
    }
  } else {
    banner = generateScriptableBanner(manifest);
  }

  return [banner, scriptNew];
}
