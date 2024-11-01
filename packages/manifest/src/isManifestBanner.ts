import {hasBannerManifest} from './hasBannerManifest';

export function isManifestBanner(line: string): boolean {
  return hasBannerManifest(line);
}
