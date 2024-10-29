import {generateBanner} from '../../banner';
import {ScriptableManifest} from '../../types';

describe('generateBanner', () => {
  it('should generate banner with all manifest', () => {
    const meta: ScriptableManifest = {
      always_run_in_app: true,
      icon: {
        color: 'red',
        glyph: 'star',
      },
      share_sheet_inputs: ['file-url', 'url'],
    };

    const expectedBanner =
      `// Variables used by Scriptable.\n` +
      `// These must be at the very top of the file. Do not edit.\n` +
      `// always-run-in-app: true; share-sheet-inputs: file-url, url; icon-color: red; icon-glyph: star;\n`;

    expect(generateBanner(meta)).toBe(expectedBanner);
  });

  it('should generate banner with partial manifest', () => {
    const meta: ScriptableManifest = {
      icon: {
        color: 'blue',
      },
    };

    const expectedBanner =
      `// Variables used by Scriptable.\n` +
      `// These must be at the very top of the file. Do not edit.\n` +
      `// icon-color: blue;\n`;

    expect(generateBanner(meta)).toBe(expectedBanner);
  });

  it('should generate banner with no optional manifest', () => {
    const meta: ScriptableManifest = {};

    const expectedBanner =
      `// Variables used by Scriptable.\n` + `// These must be at the very top of the file. Do not edit.\n` + `// \n`;

    expect(generateBanner(meta)).toBe(expectedBanner);
  });

  it('should generate banner with no manifest', () => {
    const meta = undefined;

    const expectedBanner =
      `// Variables used by Scriptable.\n` + `// These must be at the very top of the file. Do not edit.\n` + `// \n`;

    expect(generateBanner(meta)).toBe(expectedBanner);
  });
});
