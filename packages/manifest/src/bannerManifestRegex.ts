import {ScriptableBannerManifestKeys} from './types';

export function bannerManifestRegex(attrs: ScriptableBannerManifestKeys[] = []) {
  attrs = attrs.length ? attrs : [...ScriptableBannerManifestKeys];
  const text = attrs.join('|');
  return new RegExp(`(?:^|\\s)(${text}+):\\s*([^;]+);`, 'g');
}

export const REGEXP_BANNER_MANIFEST = bannerManifestRegex([...ScriptableBannerManifestKeys]);
