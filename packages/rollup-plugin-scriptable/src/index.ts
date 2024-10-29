import type {ScriptableManifest} from '@scriptables/manifest';
import {generateBanner} from '@scriptables/manifest';
import {existsSync, readFileSync} from 'fs';
import {basename, dirname, resolve} from 'path';
import type {Plugin} from 'rollup';

const SUPPORTED_MANIFEST_EXTENSIONS = ['.manifest.json', '.manifest', '.json'];
const SCRIPTABLE_EXTENSION = '.scriptable';
const SOURCE_EXT = /\.[tj]sx?$/;

export default function scriptableBundle(manifest: ScriptableManifest = {}): Plugin {
  return {
    name: 'scriptable',
    renderChunk(code, chunk) {
      const fileFullPath = chunk.facadeModuleId || '';
      let customManifest: ScriptableManifest = {};

      if (fileFullPath) {
        const chunkDir = dirname(fileFullPath);
        const chunkBaseName = basename(fileFullPath, '.js');
        const manifestFilePath = SUPPORTED_MANIFEST_EXTENSIONS.map(ext =>
          resolve(chunkDir, `${chunkBaseName}${ext}`),
        ).find(existsSync);

        if (manifestFilePath && existsSync(manifestFilePath)) {
          try {
            const fileContent = readFileSync(manifestFilePath, 'utf-8');
            customManifest = JSON.parse(fileContent);
          } catch (error) {
            console.warn(`Could not read config file: ${manifestFilePath}`, error);
          }
        }
      }

      const finalManifest = {...manifest, ...customManifest};
      const banner = generateBanner(finalManifest);

      const result = {
        ...finalManifest,
        script: code,
      };

      if (fileFullPath) {
        this.emitFile({
          type: 'asset',
          name: chunk.name.replace(SOURCE_EXT, SCRIPTABLE_EXTENSION),
          fileName: chunk.fileName.replace(SOURCE_EXT, SCRIPTABLE_EXTENSION),
          source: JSON.stringify(result),
        });
      }

      return {
        code: banner + code,
      };
    },
  };
}
