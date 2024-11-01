import {REGEXP_BANNER_MANIFEST} from './bannerManifestRegex';

export function matchAllBannerManifest(line: string) {
  return [...line.matchAll(REGEXP_BANNER_MANIFEST)];
}
