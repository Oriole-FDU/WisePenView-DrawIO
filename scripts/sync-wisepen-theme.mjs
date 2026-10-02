import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { projectRoot, sourceDir } from './drawio-static-config.mjs';

// 静态色板只用于独立打开与握手前的首屏；嵌入后由宿主的实际计算值覆盖。
const viewRoot = path.resolve(projectRoot, process.env.WISEPEN_VIEW_ROOT ?? '../WisePenView');
const themeDir = path.join(viewRoot, 'src/styles/theme');
const [palette, accents, geometry, globalCss] = await Promise.all([
  readFile(path.join(themeDir, 'palette.css'), 'utf8'),
  readFile(path.join(themeDir, 'custom-accents.css'), 'utf8'),
  readFile(path.join(themeDir, 'tokens.css'), 'utf8'),
  readFile(path.join(viewRoot, 'src/styles/global/index.css'), 'utf8'),
]);

function declarations(css) {
  const values = {};
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    // 普通语义定义取首次声明，深色覆盖在生成对应模式时单独应用。
    values[match[1]] ??= match[2].trim().replace(/\s+/g, ' ');
  }
  return values;
}

function resolve(value, values) {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    if (!values[name]) throw new Error(`WisePen 主题缺少变量: ${name}`);
    return resolve(values[name], values);
  });
}

const colorTokens = [
  'accent', 'accent-foreground', 'accent-text', 'accent-text-strong', 'accent-soft',
  'accent-soft-foreground', 'accent-soft-hover', 'accent-selected', 'accent-border',
  'accent-hover', 'background', 'foreground', 'muted', 'surface', 'surface-foreground',
  'surface-secondary', 'surface-tertiary', 'surface-hover', 'overlay', 'overlay-foreground',
  'border', 'separator', 'field-background', 'field-foreground', 'focus', 'selection',
  'text-tertiary', 'scrollbar', 'scrollbar-thumb-hover', 'card-shadow', 'overlay-shadow',
];
const geometryTokens = [
  'font-size-base', 'font-size-xs', 'radius', 'radius-sm', 'radius-lg', 'radius-xl',
  'app-radius-popover',
];
const base = declarations(palette);
const sizes = declarations(geometry);
const fonts = declarations(globalCss);
let output = '/* 由 pnpm sync:theme 从 WisePenView 生成；请修改源主题后重新同步。 */\n:root {\n';
output += `\t--app-font-family: ${fonts['--app-font-family']};\n`;
for (const token of geometryTokens) output += `\t--${token}: ${resolve(sizes[`--${token}`], sizes)};\n`;
output += '}\n';

for (const mode of ['light', 'dark']) {
  const brand = declarations(mode === 'light' ? accents.split('.dark,')[0] : accents.split('.dark,')[1]);
  const modeOverrides = mode === 'dark'
    ? declarations(palette.split("[data-theme='dark'] {").at(-1).split('}')[0]) : {};
  for (const scheme of ['aqua', 'mist', 'floral', 'sunset', 'emerald', 'lavender']) {
    const schemeBlock = palette.split(`html[data-color-scheme='${scheme}'] {`)[1].split('}')[0];
    const neutral = schemeBlock.match(/--palette-neutral-1: var\(--(\w+)-1\)/)[1];
    const radix = declarations(await readFile(
      path.join(viewRoot, `node_modules/@radix-ui/colors/${neutral}${mode === 'dark' ? '-dark' : ''}.css`), 'utf8'
    ));
    const values = { ...base, ...modeOverrides };
    for (let step = 1; step <= 12; step++) {
      values[`--palette-neutral-${step}`] = radix[`--${neutral}-${step}`];
      values[`--palette-accent-${step}`] = brand[`--wisepen-${scheme}-${step}`];
    }
    values['--palette-accent-a5'] = brand[`--wisepen-${scheme}-a5`];
    values['--palette-accent-contrast'] = brand[`--wisepen-${scheme}-contrast`];
    if (scheme === 'aqua') output += mode === 'light' ? '\n:root,\n' : "\nhtml[data-theme='dark'],\n";
    output += `html[data-theme='${mode}'][data-color-scheme='${scheme}'] {\n\tcolor-scheme: ${mode};\n`;
    for (const token of colorTokens) output += `\t--${token}: ${resolve(values[`--${token}`], values)};\n`;
    output += '}\n';
  }
}

await writeFile(path.join(sourceDir, 'styles/WisePenTheme.css'), output);
console.log('已同步 WisePenView 六套配色的明暗主题与基础排版。');
