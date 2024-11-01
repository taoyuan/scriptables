import {REGEXP_BANNER_MANIFEST} from './bannerManifestRegex';

export function hasBannerManifest(script: string): boolean {
  return !!script.match(REGEXP_BANNER_MANIFEST);
}
