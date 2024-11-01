import {generateScriptableBanner, ScriptableManifest} from '@scriptables/manifest';
import {existsSync, readFileSync} from 'fs';
import {basename, dirname, extname, resolve} from 'path';
import type {Plugin} from 'rollup';

const SUPPORTED_MANIFEST_EXTENSIONS = ['.manifest.json', '.manifest', '.json'];
const SCRIPTABLE_EXTENSION = '.scriptable';
const SOURCE_EXT = /\.[tj]sx?$/;

export default function bundle(manifest: ScriptableManifest = {}): Plugin {
  return {
    name: 'scriptable',
    renderChunk(code, chunk) {
      const path = chunk.facadeModuleId;
      let customManifest: ScriptableManifest = {};

      if (path) {
        const chunkDir = dirname(path);
        const chunkBaseName = getFileBaseName(path);
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
      const banner = generateScriptableBanner(finalManifest);

      const result = {
        ...finalManifest,
        script: code,
      };

      if (path) {
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

function getFileBaseName(filePath: string) {
  const fileName = basename(filePath);
  const ext = extname(fileName);
  return basename(filePath).replace(ext, '');
}
