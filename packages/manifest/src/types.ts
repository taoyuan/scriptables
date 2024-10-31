export type ScriptableShareSheetInputs = Array<'file-url' | 'url' | 'image' | 'plain-text'>;

/**
 * The manifest for a Scriptable script.
 */
export interface ScriptableManifest {
  name?: string;
  always_run_in_app?: boolean;
  icon?: {
    color?: string;
    glyph?: string;
  };
  share_sheet_inputs?: ScriptableShareSheetInputs;
  script?: string;
  [key: string]: unknown;
}

export const ScriptableBannerManifestKeys = [
  'always-run-in-app',
  'share-sheet-inputs',
  'icon-color',
  'icon-glyph',
] as const;

export type ScriptableBannerManifestKeys = (typeof ScriptableBannerManifestKeys)[number];

export interface ScriptableBannerManifest {
  'always-run-in-app'?: boolean | string;
  'share-sheet-inputs'?: string;
  'icon-color'?: string;
  'icon-glyph'?: string;
}
