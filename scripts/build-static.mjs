import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  defaultQuery,
  distRoot,
  editorPath,
  editorUrl,
  mountPath,
  sourceDir,
} from './drawio-static-config.mjs';

const targetDir = path.join(distRoot, mountPath);
const excludedTopLevel = new Set(['WEB-INF', 'META-INF']);

async function assertDirectory(dir) {
  const info = await stat(dir);

  if (!info.isDirectory()) {
    throw new Error(`不是有效目录: ${dir}`);
  }
}

function shouldCopy(src) {
  const relative = path.relative(sourceDir, src);

  if (!relative) {
    return true;
  }

  const topLevelName = relative.split(path.sep)[0];
  return !excludedTopLevel.has(topLevelName);
}

await assertDirectory(sourceDir);
await rm(targetDir, { recursive: true, force: true });
await mkdir(path.dirname(targetDir), { recursive: true });
await cp(sourceDir, targetDir, {
  recursive: true,
  filter: shouldCopy,
});

const manifest = {
  name: 'WisePen DrawIO static bundle',
  source: path.relative(process.cwd(), sourceDir),
  output: path.relative(process.cwd(), targetDir),
  mountPath: `/${mountPath}/`,
  editorPath,
  defaultQuery,
  editorUrl,
  excludedTopLevel: [...excludedTopLevel],
  builtAt: new Date().toISOString(),
};

await writeFile(
  path.join(distRoot, 'wise-pen-drawio.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(`DrawIO 静态资源已输出到: ${manifest.output}`);
console.log(`WisePenView 可访问 URL: ${editorUrl}`);
