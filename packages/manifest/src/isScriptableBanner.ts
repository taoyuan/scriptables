import {isManifestBanner} from './isManifestBanner';
import {isStaticBanner} from './isStaticBanner';

export function isScriptableBanner(line: string): boolean {
  return isStaticBanner(line) || isManifestBanner(line);
}
