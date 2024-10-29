import type {ScriptableManifest} from '@scriptables/manifest';
import generateBanner from '@scriptables/manifest';
import {existsSync, readFileSync} from 'fs';
import {basename, dirname, resolve} from 'path';
import type {Plugin} from 'rollup';

export const SUPPORTED_MANIFEST_EXTENSIONS = ['.manifest.json', '.manifest', '.json'];
export const DEFAULT_MANIFEST_EXTENSION = '.manifest.json';

const SOURCE_EXT = /\.[tj]sx?$/;

interface ScriptableBundleOptions {
  /*
   * The manifest that will be used for all scripts.
   */
  manifest?: ScriptableManifest;

  /*
   * Whether to bundle the manifest with the script.
   */
  bundleManifest?:
    | boolean
    | {
        /*
         * The extension of the manifest file.
         */
        extension?: string;
      };
}

export function scriptableBundle(options: ScriptableBundleOptions = {}): Plugin {
  const bundledManifestExtension =
    normalizeExtension(typeof options.bundleManifest === 'object' ? options.bundleManifest.extension : null) ||
    DEFAULT_MANIFEST_EXTENSION;

  return {
    name: 'scriptable',
    renderChunk(code, chunk) {
      const fileFullPath = chunk.facadeModuleId || '';
      let fileConfig: ScriptableManifest = {};

      if (fileFullPath) {
        const chunkDir = dirname(fileFullPath);
        const chunkBaseName = basename(fileFullPath, '.js');
        const configFilePath = SUPPORTED_MANIFEST_EXTENSIONS.map(ext =>
          resolve(chunkDir, `${chunkBaseName}${ext}`),
        ).find(existsSync);

        if (configFilePath && existsSync(configFilePath)) {
          try {
            const fileContent = readFileSync(configFilePath, 'utf-8');
            fileConfig = JSON.parse(fileContent);
          } catch (error) {
            console.warn(`Could not read config file: ${configFilePath}`, error);
          }
        }
      }

      const finalConfig = {...fileConfig, ...options.manifest};
      const banner = generateBanner(finalConfig);

      const result = {
        ...finalConfig,
        script: code,
      };

      if (fileFullPath && options.bundleManifest !== false) {
        this.emitFile({
          type: 'asset',
          name: chunk.name.replace(SOURCE_EXT, bundledManifestExtension),
          fileName: chunk.fileName.replace(SOURCE_EXT, bundledManifestExtension),
          source: JSON.stringify(result),
        });
      }

      return {
        code: banner + code,
      };
    },
  };
}

export default scriptableBundle;

function normalizeExtension<T extends string | undefined | null>(extension: T): T {
  if (!extension) {
    return extension;
  }
  return extension.replace(/^\.+/, '.').replace(/^([^.])/, '.$1') as T;
}
