import {SCRIPTABLE_BANNER_STATIC_LINES} from './consts';
import {generateManifestText} from './generateManifestText';
import {ScriptableManifest} from './types';

export function generateScriptableBanner(manifest?: ScriptableManifest, noDefaults = false): string {
  return (
    [...SCRIPTABLE_BANNER_STATIC_LINES, generateManifestText(manifest, noDefaults)]
      .map(line => `// ${line}`)
      .join('\n') + '\n'
  );
}
