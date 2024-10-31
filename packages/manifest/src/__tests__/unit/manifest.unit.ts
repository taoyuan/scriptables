import {SCRIPTABLE_BANNER_STATIC_LINES} from '../../consts';
import {
  buildBannerManifestRegex,
  extractScriptableManifest,
  generateManifestText,
  generateScriptableBanner,
  hasBannerManifest,
  isScriptableBanner,
  isStaticBanner,
  matchAllBannerManifest,
  updateScriptableManifest,
} from '../../manifest';
import {ScriptableManifest} from '../../types';

describe('manifest', () => {
  describe('buildBannerManifestRegex', () => {
    it('should generate regex for a single attribute', () => {
      const regex = buildBannerManifestRegex(['icon-color']);
      const testString = '// icon-color: red;';
      const matches = [...testString.matchAll(regex)];
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(1);
      const match = matches[0];
      expect(match[0]).toBe(' icon-color: red;');
      expect(match[1]).toBe('icon-color');
      expect(match[2]).toBe('red');
    });

    it('should generate regex for multiple attributes', () => {
      const regex = buildBannerManifestRegex(['icon-color', 'icon-glyph']);
      const testString = '// icon-glyph: circle;';
      const matches = [...testString.matchAll(regex)];
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(1);
      const match = matches[0];
      expect(match[0]).toBe(' icon-glyph: circle;');
      expect(match[1]).toBe('icon-glyph');
      expect(match[2]).toBe('circle');
    });

    it('should generate regex for attributes with special characters', () => {
      const regex = buildBannerManifestRegex(['always-run-in-app', 'share-sheet-inputs']);
      const testString = '// always-run-in-app: true;';
      const matches = [...testString.matchAll(regex)];
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(1);
      const match = matches[0];
      expect(match[0]).toBe(' always-run-in-app: true;');
      expect(match[1]).toBe('always-run-in-app');
      expect(match[2]).toBe('true');
    });

    it('should return null for no matching attributes', () => {
      const regex = buildBannerManifestRegex(['icon-color']);
      const testString = '// icon-glyph: circle;';
      const matches = testString.match(regex);
      expect(matches).toBeNull();
    });

    it('should return all for empty attributes array', () => {
      const regex = buildBannerManifestRegex([]);
      const testString =
        '// icon-glyph: circle; icon-color: red; always-run-in-app: true; share-sheet-inputs: file-url, url;';
      const matches = testString.matchAll(regex);
      expect(matches).not.toBeNull();
      const matchesArray = [...matches];
      expect(matchesArray.length).toBe(4);
      expect(matchesArray[0][0]).toBe(' icon-glyph: circle;');
      expect(matchesArray[1][0]).toBe(' icon-color: red;');
      expect(matchesArray[2][0]).toBe(' always-run-in-app: true;');
      expect(matchesArray[3][0]).toBe(' share-sheet-inputs: file-url, url;');
    });

    it('should return all wihtout attributes', () => {
      const regex = buildBannerManifestRegex();
      const testString =
        '// icon-glyph: circle; icon-color: red; always-run-in-app: true; share-sheet-inputs: file-url, url;';
      const matches = testString.matchAll(regex);
      expect(matches).not.toBeNull();
      const matchesArray = [...matches];
      expect(matchesArray.length).toBe(4);
      expect(matchesArray[0][0]).toBe(' icon-glyph: circle;');
      expect(matchesArray[1][0]).toBe(' icon-color: red;');
      expect(matchesArray[2][0]).toBe(' always-run-in-app: true;');
      expect(matchesArray[3][0]).toBe(' share-sheet-inputs: file-url, url;');
    });
  });

  describe('matchAllBannerManifest', () => {
    it('should return matches for a single attribute', () => {
      const line = '// icon-color: red;';
      const matches = matchAllBannerManifest(line);
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(1);
      const match = matches[0];
      expect(match[0]).toBe(' icon-color: red;');
      expect(match[1]).toBe('icon-color');
      expect(match[2]).toBe('red');
    });

    it('should return matches for multiple attributes', () => {
      const line = '// icon-color: red; icon-glyph: circle;';
      const matches = matchAllBannerManifest(line);
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(2);
      expect(matches[0][0]).toBe(' icon-color: red;');
      expect(matches[0][1]).toBe('icon-color');
      expect(matches[0][2]).toBe('red');
      expect(matches[1][0]).toBe(' icon-glyph: circle;');
      expect(matches[1][1]).toBe('icon-glyph');
      expect(matches[1][2]).toBe('circle');
    });

    it('should return matches for attributes with special characters', () => {
      const line = '// always-run-in-app: true; share-sheet-inputs: file-url, url;';
      const matches = matchAllBannerManifest(line);
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(2);
      expect(matches[0][0]).toBe(' always-run-in-app: true;');
      expect(matches[0][1]).toBe('always-run-in-app');
      expect(matches[0][2]).toBe('true');
      expect(matches[1][0]).toBe(' share-sheet-inputs: file-url, url;');
      expect(matches[1][1]).toBe('share-sheet-inputs');
      expect(matches[1][2]).toBe('file-url, url');
    });

    it('should return an empty array for no matching attributes', () => {
      const line = '// no-match: value;';
      const matches = matchAllBannerManifest(line);
      expect(matches).toEqual([]);
    });

    it('should return an empty array for an empty string', () => {
      const line = '';
      const matches = matchAllBannerManifest(line);
      expect(matches).toEqual([]);
    });
  });

  describe('hasBannerManifest', () => {
    it('should return true if the script contains a banner manifest', () => {
      const script = `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: blue; icon-glyph: circle;\n`;
      expect(hasBannerManifest(script)).toBe(true);
    });

    it('should return false if the script does not contain a banner manifest', () => {
      const script = `// This is a script without a banner manifest.\nconsole.log('Hello, world!');\n`;
      expect(hasBannerManifest(script)).toBe(false);
    });

    it('should return false if the script is empty', () => {
      const script = ``;
      expect(hasBannerManifest(script)).toBe(false);
    });

    it('should return true if the script contains a partial banner manifest', () => {
      const script = `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: blue;\n`;
      expect(hasBannerManifest(script)).toBe(true);
    });

    it('should return true if the script contains a banner manifest with special characters', () => {
      const script = `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// always-run-in-app: true; share-sheet-inputs: file-url, url;\n`;
      expect(hasBannerManifest(script)).toBe(true);
    });
  });

  describe('isStaticBanner', () => {
    it('should return true for static banner lines', () => {
      SCRIPTABLE_BANNER_STATIC_LINES.forEach(line => {
        expect(isStaticBanner(line)).toBe(true);
      });
    });

    it('should return false for non-static banner lines', () => {
      const nonStaticLines = [
        '// icon-color: red;',
        '// icon-glyph: circle;',
        '// always-run-in-app: true;',
        '// share-sheet-inputs: file-url, url;',
        'console.log("Hello, world!");',
      ];
      nonStaticLines.forEach(line => {
        expect(isStaticBanner(line)).toBe(false);
      });
    });
  });

  describe('isScriptableBanner', () => {
    it('should return true for static banner lines', () => {
      SCRIPTABLE_BANNER_STATIC_LINES.forEach(line => {
        expect(isScriptableBanner(line)).toBe(true);
      });
    });

    it('should return true for manifest banner lines', () => {
      const manifestLines = [
        '// icon-color: red;',
        '// icon-glyph: circle;',
        '// always-run-in-app: true;',
        '// share-sheet-inputs: file-url, url;',
      ];
      manifestLines.forEach(line => {
        expect(isScriptableBanner(line)).toBe(true);
      });
    });

    it('should return false for non-banner lines', () => {
      const nonBannerLines = ['console.log("Hello, world!");', '// This is a comment.', ''];
      nonBannerLines.forEach(line => {
        expect(isScriptableBanner(line)).toBe(false);
      });
    });
  });

  describe('generateManifestText', () => {
    it('should generate manifest text with all attributes', () => {
      const manifest: ScriptableManifest = {
        always_run_in_app: true,
        icon: {
          color: 'red',
          glyph: 'star',
        },
        share_sheet_inputs: ['file-url', 'url'],
      };
      const result = generateManifestText(manifest);
      expect(result).toBe(
        'always-run-in-app: true; share-sheet-inputs: file-url, url; icon-color: red; icon-glyph: star;',
      );
    });

    it('should generate manifest text with partial attributes and defaults', () => {
      const manifest: ScriptableManifest = {
        icon: {
          color: 'red',
        },
      };
      const result = generateManifestText(manifest);
      expect(result).toBe('icon-color: red; icon-glyph: circle;');
    });

    it('should generate manifest text with no attributes and defaults', () => {
      const manifest: ScriptableManifest = {};
      const result = generateManifestText(manifest);
      expect(result).toBe('icon-color: blue; icon-glyph: circle;');
    });

    it('should generate manifest text with no attributes and no defaults', () => {
      const manifest: ScriptableManifest = {};
      const result = generateManifestText(manifest, true);
      expect(result).toBe('');
    });

    it('should generate manifest text with partial attributes and no defaults', () => {
      const manifest: ScriptableManifest = {
        icon: {
          color: 'blue',
        },
      };
      const result = generateManifestText(manifest, true);
      expect(result).toBe('icon-color: blue;');
    });

    it('should handle undefined icon properties', () => {
      const manifest: ScriptableManifest = {
        icon: {
          color: undefined,
          glyph: undefined,
        },
      };
      const result = generateManifestText(manifest);
      expect(result).toBe('icon-color: blue; icon-glyph: circle;');
    });

    it('should handle undefined manifest properties', () => {
      const manifest: ScriptableManifest = {};
      const result = generateManifestText(manifest);
      expect(result).toBe('icon-color: blue; icon-glyph: circle;');
    });
  });

  describe('generateScriptableBanner', () => {
    it('should generate a banner with default values', () => {
      const expectedBanner =
        SCRIPTABLE_BANNER_STATIC_LINES.map(line => `// ${line}`).join('\n') +
        '\n// icon-color: blue; icon-glyph: circle;\n';

      const result = generateScriptableBanner();
      expect(result).toBe(expectedBanner);
    });

    it('should generate a banner with provided manifest values', () => {
      const manifest: ScriptableManifest = {
        always_run_in_app: true,
        share_sheet_inputs: ['file-url', 'url'],
        icon: {
          color: 'red',
          glyph: 'square',
        },
      };

      const expectedBanner =
        SCRIPTABLE_BANNER_STATIC_LINES.map(line => `// ${line}`).join('\n') +
        '\n// always-run-in-app: true; share-sheet-inputs: file-url, url; icon-color: red; icon-glyph: square;\n';

      const result = generateScriptableBanner(manifest);
      expect(result).toBe(expectedBanner);
    });

    it('should generate a banner without default values when noDefaults is true', () => {
      const manifest: ScriptableManifest = {
        always_run_in_app: true,
        share_sheet_inputs: ['file-url', 'url'],
      };

      const expectedBanner =
        SCRIPTABLE_BANNER_STATIC_LINES.map(line => `// ${line}`).join('\n') +
        '\n// always-run-in-app: true; share-sheet-inputs: file-url, url;\n';

      const result = generateScriptableBanner(manifest, true);
      expect(result).toBe(expectedBanner);
    });

    it('should generate a banner with empty manifest', () => {
      const expectedBanner = SCRIPTABLE_BANNER_STATIC_LINES.map(line => `// ${line}`).join('\n') + '\n// \n';

      const result = generateScriptableBanner({}, true);
      expect(result).toBe(expectedBanner);
    });
  });

  describe('extractScriptableManifest', () => {
    it('should extract the manifest from the script content', () => {
      const script = `
      // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: blue; icon-glyph: circle;
      // always-run-in-app: true;
      // share-sheet-inputs: plain-text, url;
    `;

      const expectedManifest: Partial<ScriptableManifest> = {
        always_run_in_app: true,
        share_sheet_inputs: ['plain-text', 'url'],
        icon: {
          color: 'blue',
          glyph: 'circle',
        },
      };

      const manifest = extractScriptableManifest(script);
      expect(manifest).toEqual(expectedManifest);
    });

    it('should extract only specified attributes from the script content', () => {
      const script = `
      // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: blue; icon-glyph: circle;
      // always-run-in-app: true;
      // share-sheet-inputs: plain-text, url;
    `;

      const expectedManifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'blue',
        },
      };

      const manifest = extractScriptableManifest(script, ['icon-color']);
      expect(manifest).toEqual(expectedManifest);
    });

    it('should return an empty manifest if no matching attributes are found', () => {
      const script = `
      // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // some-other-key: some-value;
    `;

      const expectedManifest: Partial<ScriptableManifest> = {};

      const manifest = extractScriptableManifest(script);
      expect(manifest).toEqual(expectedManifest);
    });

    it('should handle scripts with no manifest attributes', () => {
      const script = `
      // This is a script without any manifest attributes.
      console.log('Hello, world!');
    `;

      const expectedManifest: Partial<ScriptableManifest> = {};

      const manifest = extractScriptableManifest(script);
      expect(manifest).toEqual(expectedManifest);
    });

    it('should return the first occurrence of an attribute if there are multiple same attributes', () => {
      const script = `
      // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: blue; icon-glyph: circle;
      // icon-color: red;
    `;

      const expectedManifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'blue',
        },
      };

      const manifest = extractScriptableManifest(script, ['icon-color']);
      expect(manifest).toEqual(expectedManifest);
    });

    it('should handle empty icon properties', () => {
      // Test with different icon property order
      const script1 = `
    // Variables used by Scriptable.
    // These must be at the very top of the file. Do not edit.
    // icon-color: ; icon-glyph: ;
    `;

      const script2 = `
    // Variables used by Scriptable.
    // These must be at the very top of the file. Do not edit.
    // icon-glyph: ; icon-color: ;
    `;
      const expectedManifest: Partial<ScriptableManifest> = {
        icon: {
          color: '',
          glyph: '',
        },
      };
      const manifest1 = extractScriptableManifest(script1);
      expect(manifest1).toEqual(expectedManifest);
      const manifest2 = extractScriptableManifest(script2);
      expect(manifest2).toEqual(expectedManifest);
    });

    it('should handle undefined manifest properties', () => {
      const script = `// Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      `;
      const expectedManifest: Partial<ScriptableManifest> = {};
      const manifest = extractScriptableManifest(script);
      expect(manifest).toEqual(expectedManifest);
    });
  });

  describe('updateScriptableManifest', () => {
    it('should update the manifest in the script', () => {
      const script = ` // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: blue; icon-glyph: circle;

      // Your script code here...
      `;

      const manifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'red',
          glyph: 'square',
        },
      };

      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: red;');
      expect(banner).toContain('icon-glyph: square;');
      expect(updatedScript).toContain('// Your script code here...');
    });

    it('should add a new manifest if none exists', () => {
      const script = `; // Your script code here...`;

      const manifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'red',
          glyph: 'square',
        },
      };

      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: red;');
      expect(banner).toContain('icon-glyph: square;');
      expect(updatedScript).toBe(script);
    });

    it('should preserve static banner lines', () => {
      const script = `// Variables used by Scriptable.
    // These must be at the very top of the file. Do not edit.
    // icon-color: blue; icon-glyph: circle;
    
    // Your script code here...
    `;

      const manifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'red',
          glyph: 'square',
        },
      };

      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain(SCRIPTABLE_BANNER_STATIC_LINES[0]);
      expect(updatedScript).toContain('// Your script code here...');
    });

    it('should handle empty manifest', () => {
      const script = `// Variables used by Scriptable.
    // These must be at the very top of the file. Do not edit.
    // icon-color: blue; icon-glyph: circle;
    
    // Your script code here...
    `;

      const manifest: Partial<ScriptableManifest> = {};

      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: ;');
      expect(banner).toContain('icon-glyph: ;');
      expect(updatedScript).toContain('// Your script code here...');
    });

    it('should handle script without static banner lines', () => {
      const script = `// icon-color: blue; icon-glyph: circle;\nconsole.log('Hello, world!');\n`;
      const manifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'red',
          glyph: 'square',
        },
      };
      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: red;');
      expect(banner).toContain('icon-glyph: square;');
      expect(updatedScript).toContain("console.log('Hello, world!');");
    });

    it('should handle script with no manifest attributes', () => {
      const script = `// Variables used by Scriptable.\n// These must be at the very top of the file. Do not edit.\n// icon-color: blue; icon-glyph: circle;\nconsole.log('Hello, world!');\n`;
      const manifest: Partial<ScriptableManifest> = {};
      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: ;');
      expect(banner).toContain('icon-glyph: ;');
      expect(updatedScript).toContain("console.log('Hello, world!');");
    });

    it('should update the manifest in the script with all attributes', () => {
      const script = ` // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: blue; icon-glyph: circle; always-run-in-app: false; share-sheet-inputs: file-url, url;

      // Your script code here...
      `;

      const manifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'red',
          glyph: 'square',
        },
        always_run_in_app: true,
        share_sheet_inputs: ['plain-text', 'url'],
      };

      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: red;');
      expect(banner).toContain('icon-glyph: square;');
      expect(banner).toContain('always-run-in-app: true;');
      expect(banner).toContain('share-sheet-inputs: plain-text, url;');
      expect(updatedScript).toContain('// Your script code here...');
    });

    it('should update the manifest in the script with always_run_in_app is false', () => {
      const script = ` // Variables used by Scriptable.
      // These must be at the very top of the file. Do not edit.
      // icon-color: blue; icon-glyph: circle; always-run-in-app: true; share-sheet-inputs: file-url, url;

      // Your script code here...
      `;

      const manifest: Partial<ScriptableManifest> = {
        icon: {
          color: 'red',
          glyph: 'square',
        },
        always_run_in_app: false,
        share_sheet_inputs: ['plain-text', 'url'],
      };

      const [banner, updatedScript] = updateScriptableManifest(script, manifest);
      expect(banner).toContain('icon-color: red;');
      expect(banner).toContain('icon-glyph: square;');
      expect(banner).toContain('always-run-in-app: false;');
      expect(banner).toContain('share-sheet-inputs: plain-text, url;');
      expect(updatedScript).toContain('// Your script code here...');
    });
  });
});
