export interface ScriptableManifest {
  always_run_in_app?: boolean;
  icon?: {
    color?: string;
    glyph?: string;
  };
  share_sheet_inputs?: Array<'file-url' | 'url' | 'image' | 'plain-text'>;
}
