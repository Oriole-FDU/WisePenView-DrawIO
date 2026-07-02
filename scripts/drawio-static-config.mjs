import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(scriptsDir, '..');
export const sourceDir = path.join(projectRoot, 'src/main/webapp');
export const distRoot = path.resolve(projectRoot, process.env.WISEPEN_DRAWIO_DIST ?? 'dist');
export const host = process.env.WISEPEN_DRAWIO_HOST ?? 'http://localhost:5174';
export const defaultQuery =
  process.env.WISEPEN_DRAWIO_QUERY ??
  'embed=1&proto=json&spin=1&offline=1&local=1&lang=zh&sync=manual&pages=0&hide-pages=1';

export function normalizeMountPath(value = process.env.WISEPEN_DRAWIO_MOUNT ?? 'drawio') {
  const trimmed = String(value).trim().replace(/^\/+|\/+$/g, '');
  const mountPath = trimmed || 'drawio';
  const parts = mountPath.split('/').filter(Boolean);

  // 防止构建脚本把 dist 之外的目录当成输出目录删除。
  if (parts.some((part) => part === '.' || part === '..')) {
    throw new Error(`WISEPEN_DRAWIO_MOUNT 不能包含 "." 或 "..": ${value}`);
  }

  return parts.join('/');
}

export const mountPath = normalizeMountPath();
export const editorPath = `/${mountPath}/index.html`;
export const editorUrl = `${host}${editorPath}?${defaultQuery}`;
