import {SCRIPTABLE_BANNER_STATIC_LINES} from './consts';

export function isStaticBanner(line: string): boolean {
  return SCRIPTABLE_BANNER_STATIC_LINES.some(header => line.includes(header));
}
