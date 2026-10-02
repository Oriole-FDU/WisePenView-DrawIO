import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../src/main/webapp/js/WisePenTheme.js', import.meta.url), 'utf8');

function setup(query = 'wisepenOrigin=https%3A%2F%2Fwisepen.example') {
  const attributes = new Map();
  const styles = new Map();
  const classes = new Set();
  const parent = {};
  const listeners = new Map();
  const root = {
    setAttribute: (key, value) => attributes.set(key, value),
    classList: { toggle: (key, enabled) => enabled ? classes.add(key) : classes.delete(key) },
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: (key) => styles.delete(key) },
  };
  let dark = false;
  const switches = [];
  const window = {
    parent,
    location: { search: `?${query}` },
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  vm.runInNewContext(source, { window, document: { documentElement: root }, URLSearchParams,
    Editor: { isDarkMode: () => dark } });
  const ui = {
    setDarkMode: (value) => { dark = value; switches.push(value); },
    isAutoDarkMode: () => true,
  };
  const send = (message, overrides = {}) => listeners.get('message')({
    source: parent, origin: 'https://wisepen.example', data: JSON.stringify(message), ...overrides,
  });
  return { attributes, styles, classes, switches, send, ui, attach: () => window.WisePenTheme.attach(ui) };
}

test('六套配色支持明暗首屏，并迁移旧 default 到 mist', () => {
  for (const scheme of ['aqua', 'mist', 'floral', 'sunset', 'emerald', 'lavender', 'default']) {
    for (const theme of ['light', 'dark']) {
      const env = setup(`wisepenTheme=${theme}&wisepenColorScheme=${scheme}`);
      assert.equal(env.attributes.get('data-theme'), theme);
      assert.equal(env.attributes.get('data-color-scheme'), scheme === 'default' ? 'mist' : scheme);
      assert.equal(env.classes.has('dark'), theme === 'dark');
    }
  }
});

test('实例创建前收到的主题在 attach 时生效，配色更新不重复刷新画布', () => {
  const env = setup();
  env.send({ action: 'wisepenTheme', theme: 'dark', colorScheme: 'floral', tokens: { '--accent': '#be435a' } });
  assert.deepEqual(env.switches, []);
  env.attach();
  assert.deepEqual(env.switches, [true]);
  assert.equal(env.styles.get('--accent'), '#be435a');
  env.send({ action: 'wisepenTheme', theme: 'dark', colorScheme: 'emerald', tokens: { '--accent': '#2f8a64' } });
  assert.deepEqual(env.switches, [true]);
  env.send({ action: 'wisepenTheme', theme: 'light', colorScheme: 'mist' });
  assert.deepEqual(env.switches, [true, false]);
});

test('只接收指定 origin 的父窗口消息，拒绝无宿主配置与非法载荷', () => {
  const env = setup();
  const message = { action: 'wisepenTheme', theme: 'dark', colorScheme: 'floral' };
  env.send(message, { origin: 'https://other.example' });
  env.send(message, { source: {} });
  env.send(message, { data: '{invalid' });
  env.send({ ...message, theme: 'invalid' });
  env.send({ ...message, action: 'load' });
  assert.equal(env.attributes.get('data-theme'), 'light');
  const standalone = setup('');
  standalone.send(message);
  assert.equal(standalone.attributes.get('data-theme'), 'light');
});

test('只更新外壳变量，清除缺失值且不接受任意 CSS 属性', () => {
  const env = setup();
  env.attach();
  env.send({ action: 'wisepenTheme', theme: 'light', colorScheme: 'lavender', tokens: {
    '--accent': '#835ec7', '--radius': '8px', '--arbitrary': 'red', color: 'red',
  } });
  assert.equal(env.styles.get('--accent'), '#835ec7');
  assert.equal(env.styles.get('--radius'), '8px');
  assert.equal(env.styles.has('--arbitrary'), false);
  assert.equal(env.styles.has('color'), false);
  env.send({ action: 'wisepenTheme', theme: 'light', colorScheme: 'aqua', tokens: { '--accent': '' } });
  assert.equal(env.styles.has('--accent'), false);
  assert.equal(env.styles.has('--radius'), false);
});

test('嵌入时禁用 DrawIO 自身的自动主题，独立运行仍保留原生模式', () => {
  const embedded = setup();
  embedded.attach();
  assert.equal(embedded.ui.isAutoDarkMode(), false);
  const standalone = setup('');
  standalone.attach();
  assert.equal(standalone.ui.isAutoDarkMode(), true);
});
