import {SCRIPTABLE_BANNER_STATIC_LINES} from './consts';
import {
  ScriptableBannerManifest,
  ScriptableBannerManifestKeys,
  ScriptableManifest,
  ScriptableShareSheetInputs,
} from './types';

export function buildBannerManifestRegex(attrs: ScriptableBannerManifestKeys[] = []) {
  attrs = attrs.length ? attrs : [...ScriptableBannerManifestKeys];
  const text = attrs.join('|');
  return new RegExp(`(?:^|\\s)(${text}+):\\s*([^;]+);`, 'g');
}

export const REGEXP_BANNER_MANIFEST = buildBannerManifestRegex([...ScriptableBannerManifestKeys]);

export function matchAllBannerManifest(line: string) {
  return [...line.matchAll(REGEXP_BANNER_MANIFEST)];
}

export function hasBannerManifest(script: string): boolean {
  return !!script.match(REGEXP_BANNER_MANIFEST);
}

export function isStaticBanner(line: string): boolean {
  return SCRIPTABLE_BANNER_STATIC_LINES.some(header => line.includes(header));
}

export function isManifestBanner(line: string): boolean {
  return hasBannerManifest(line);
}

export function isScriptableBanner(line: string): boolean {
  return isStaticBanner(line) || isManifestBanner(line);
}

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

export function generateScriptableBanner(manifest?: ScriptableManifest, noDefaults = false): string {
  return (
    [...SCRIPTABLE_BANNER_STATIC_LINES, generateManifestText(manifest, noDefaults)]
      .map(line => `// ${line}`)
      .join('\n') + '\n'
  );
}

/**
 * Extracts a partial Scriptable manifest from the given script content.
 *
 * This function scans the first 20 lines of the provided script for specific
 * manifest keys and extracts their values into a partial `ScriptableManifest` object.
 * If the `attrs` parameter is provided, only the specified keys will be extracted.
 *
 * @param script - The script content to extract the manifest from.
 * @param attrs - An optional array of manifest keys to extract. If not provided, all keys will be extracted.
 * @returns A partial `ScriptableManifest` object containing the extracted manifest data.
 */
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

/**
 * Update the manifest text for a Scriptable script.
 *
 * @param script The script to update.
 * @param manifestOrOldScript The manifest to update the script with, or the old script to extract the manifest from.
 * @returns The updated script with the manifest text.
 * @example
 *
 * ```ts
 * const script = `// Variables used by Scriptable.
 * // These must be at the very top of the file. Do not edit.
 * // icon-color: blue; icon-glyph: circle;
 *
 * // Your script code here...
 * `;
 *
 * const manifest = {
 *   icon: {
 *     color: 'red',
 *     glyph: 'square',
 *   },
 * };
 *
 * const [banner, mergedScript] = mergeScriptableBanner(manifest, script);
 * console.log(mergedScript);
 * ```
 */
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

  let matches: RegExpExecArray[];

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
