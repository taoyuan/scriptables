import {ScriptableManifest} from '@scriptables/manifest';
import {generateScriptableBanner} from '@scriptables/manifest/generateScriptableBanner';
import * as fs from 'fs';
import {join} from 'path';
import {OutputAsset, OutputChunk, rollup} from 'rollup';
import tmp from 'tmp';

import bundle from '../..';

describe('bundle', () => {
  const mockManifest: ScriptableManifest = {icon: {color: 'blue', glyph: 'star'}};
  const mockCode = 'console.log("Hello, world!");';
  let tmpDir: tmp.DirResult;

  beforeEach(() => {
    jest.clearAllMocks();
    tmpDir = tmp.dirSync({unsafeCleanup: true});
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  it('should generate a banner and emit a scriptable file', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const fileConfig = {
      name: 'fileConfig',
      always_run_in_app: true,
      share_sheet_inputs: ['text', 'url'],
      icon: {color: 'red', glyph: 'magic'},
    };
    const configFilePath = join(tmpDir.name, 'input.json');
    fs.writeFileSync(configFilePath, JSON.stringify(fileConfig));

    const mergedManifest = {...mockManifest, ...fileConfig} as ScriptableManifest;

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk, scriptableAsset] = output as [OutputChunk, OutputAsset];

    const expectedBanner = generateScriptableBanner(mergedManifest);

    expect(scriptChunk.fileName).toBe('input.js');
    expect(scriptChunk.type).toBe('chunk');
    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
    expect(scriptChunk.code).toContain('always-run-in-app: true');
    expect(scriptChunk.code).toContain('share-sheet-inputs: text, url');
    expect(scriptChunk.code).toContain('icon-color: red');
    expect(scriptChunk.code).toContain('icon-glyph: magic');

    expect(scriptableAsset).toBeDefined();
    expect(scriptableAsset.fileName).toBe('input.scriptable');
    expect(scriptableAsset.type).toBe('asset');
    expect(scriptableAsset.source).toBeDefined();

    const assetContent = JSON.parse(scriptableAsset.source as string);
    expect(assetContent).toMatchObject(mergedManifest);
  });

  it('should handle missing config file gracefully', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk, scriptableAsset] = output as [OutputChunk, OutputAsset];

    const expectedBanner = generateScriptableBanner(mockManifest);

    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
    expect(scriptableAsset.fileName).toBe('input.scriptable');
    expect(scriptableAsset.type).toBe('asset');
    expect(scriptableAsset.source).toBeDefined();
  });

  it('should use default options when no parameters are passed', async () => {
    const plugin = bundle();
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk, scriptableAsset] = output as [OutputChunk, OutputAsset];

    const expectedBanner = generateScriptableBanner();

    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
    expect(scriptableAsset.fileName).toBe('input.scriptable');
    expect(scriptableAsset.type).toBe('asset');
    expect(scriptableAsset.source).toBeDefined();
  });

  it('should warn if manifest file cannot be read', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const configFilePath = join(tmpDir.name, 'input.json');
    fs.writeFileSync(configFilePath, '{invalidJson}');

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    await rollupBuild.generate({
      format: 'es',
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Could not read config file: ${configFilePath}`,
      expect.any(SyntaxError),
    );

    consoleWarnSpy.mockRestore();
  });

  it('should use default schema extension if not provided', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [, scriptableAsset] = output as [OutputChunk, OutputAsset];

    expect(scriptableAsset.fileName).toBe('input.scriptable');
  });

  it('should use custom schema extension if provided', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [, scriptableAsset] = output as [OutputChunk, OutputAsset];

    expect(scriptableAsset.fileName).toBe('input.scriptable');
  });

  it('should build manifest when buildManifest option is true', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk, scriptableAsset] = output as [OutputChunk, OutputAsset];

    const expectedBanner = generateScriptableBanner(mockManifest);

    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
    expect(scriptableAsset.fileName).toBe('input.scriptable');
    expect(scriptableAsset.type).toBe('asset');
    expect(scriptableAsset.source).toBeDefined();
  });

  it('should prioritize manifest extensions correctly', async () => {
    const plugin = bundle(mockManifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const manifestFiles = [
      {ext: '.manifest.json', content: {always_run_in_app: true}},
      {ext: '.manifest', content: {always_run_in_app: false}},
      {ext: '.json', content: {always_run_in_app: 'unknown'}},
    ];

    // Create manifest files in reverse priority order
    manifestFiles.reverse().forEach(({ext, content}) => {
      const manifestPath = join(tmpDir.name, `input${ext}`);
      fs.writeFileSync(manifestPath, JSON.stringify(content));
    });

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk] = output as [OutputChunk];

    const expectedBanner = generateScriptableBanner({...mockManifest, always_run_in_app: true});

    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
  });

  it('should generate banners and emit scriptable files for multiple scripts', async () => {
    const plugin = bundle(mockManifest);
    const mockCode1 = 'console.log("Hello, world 1!");';
    const mockCode2 = 'console.log("Hello, world 2!");';
    const inputFilePath1 = join(tmpDir.name, 'input1.js');
    const inputFilePath2 = join(tmpDir.name, 'input2.js');
    fs.writeFileSync(inputFilePath1, mockCode1);
    fs.writeFileSync(inputFilePath2, mockCode2);

    const rollupBuild = await rollup({
      input: [inputFilePath1, inputFilePath2],
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });

    const scriptChunks = output.filter((chunk): chunk is OutputChunk => chunk.type === 'chunk');
    const scriptableAssets = output.filter((asset): asset is OutputAsset => asset.type === 'asset');

    expect(scriptChunks.length).toBe(2);
    expect(scriptableAssets.length).toBe(2);

    scriptChunks.forEach((chunk, index) => {
      const expectedBanner = generateScriptableBanner(mockManifest);
      expect(chunk.code).toContain(expectedBanner);
      expect(chunk.code).toContain(index === 0 ? mockCode1 : mockCode2);
    });

    scriptableAssets.forEach((asset, index) => {
      expect(asset.fileName).toBe(`input${index + 1}.scriptable`);
      expect(asset.source).toBeDefined();
    });
  });

  it('should include the name property in the generated scriptable file', async () => {
    const manifest: ScriptableManifest = {name: 'Test Script', icon: {color: 'blue', glyph: 'star'}};
    const plugin = bundle(manifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk, scriptableAsset] = output as [OutputChunk, OutputAsset];

    const expectedBanner = generateScriptableBanner(manifest);

    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
    expect(scriptableAsset.fileName).toBe('input.scriptable');
    expect(scriptableAsset.type).toBe('asset');
    expect(scriptableAsset.source).toContain('"name":"Test Script"');
  });

  it('should include the name property from the manifest file in the generated scriptable file', async () => {
    const manifest: ScriptableManifest = {icon: {color: 'blue', glyph: 'star'}};
    const plugin = bundle(manifest);
    const inputFilePath = join(tmpDir.name, 'input.js');
    fs.writeFileSync(inputFilePath, mockCode);

    const fileManifest = {
      name: 'Manifest Script',
      always_run_in_app: true,
      share_sheet_inputs: ['text', 'url'],
    };
    const configFilePath = join(tmpDir.name, 'input.json');
    fs.writeFileSync(configFilePath, JSON.stringify(fileManifest));

    const rollupBuild = await rollup({
      input: inputFilePath,
      plugins: [plugin],
    });

    const {output} = await rollupBuild.generate({
      format: 'es',
    });
    const [scriptChunk, scriptableAsset] = output as [OutputChunk, OutputAsset];

    const expectedBanner = generateScriptableBanner({...fileManifest, ...manifest} as ScriptableManifest);

    expect(scriptChunk.code).toContain(expectedBanner);
    expect(scriptChunk.code).toContain(mockCode);
    expect(scriptableAsset.fileName).toBe('input.scriptable');
    expect(scriptableAsset.type).toBe('asset');
    expect(scriptableAsset.source).toContain('"name":"Manifest Script"');
  });
});
