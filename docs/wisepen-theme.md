# WisePen 主题同步

WisePenView 与此编辑器需要一起发布。应用通过 `VITE_DRAWIO_EMBED_URL` 指向本项目的静态入口；官方 `embed.diagrams.net` 不支持这里的自定义主题消息。

## 行为

- 首屏通过 `wisepenTheme=light|dark` 和 `wisepenColorScheme` 指定主题，支持 aqua、mist、floral、sunset、emerald、lavender。
- `wisepenOrigin` 指定宿主 origin，编辑器只接受该 origin 的父窗口消息。
- WisePenView 观察根节点的主题属性，读取实际 CSS 语义变量，通过 `wisepenTheme` 消息实时更新编辑器。
- 初始 URL 在会话内保持主题参数稳定，切换配色或系统明暗不会重载 iframe。
- DrawIO 原生 `setDarkMode` 更新图标和画布显示；文档内容、保存状态和撤销历史不由主题桥接修改。
- 嵌入时隐藏编辑器独立的外观设置入口，统一从 WisePenView 设置主题。

消息示例：

```json
{
  "action": "wisepenTheme",
  "theme": "dark",
  "colorScheme": "aqua",
  "tokens": {
    "--accent": "#248286",
    "--background": "#0d1616",
    "--surface": "#111113"
  }
}
```

编辑器仅写入 `js/WisePenTheme.js` 中列出的变量。消息可在编辑器实例创建前到达，最后一次明暗设置会在实例创建后应用。

## 更新静态主题

`styles/WisePenTheme.css` 是从 WisePenView 提取的首屏与独立打开用色板；嵌入后的实际变量来自宿主，不依赖该快照。修改 WisePenView 的主题文件后运行：

```sh
pnpm sync:theme
pnpm test
pnpm build
```

同步脚本默认读取相邻的 `../WisePenView`，需要其已安装的 `@radix-ui/colors`。可以通过 `WISEPEN_VIEW_ROOT` 指定其它路径。静态构建只读取已生成的 CSS，不要求 WisePenView 源码或依赖存在。

静态快照使用 Radix 的 sRGB 色值；嵌入后下发浏览器实际计算值，包括宽色域色值。
