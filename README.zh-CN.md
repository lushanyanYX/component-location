[English](./README.md) | [中文](./README.zh-CN.md)

# Component Location

Component Location 是一个面向 React 本地开发的 Chrome 插件，用来快速找到页面 DOM 元素对应的本地源码位置。

它不需要业务项目额外安装运行时插件。插件会在 React dev 环境中读取 DOM/Fiber 上的调试信息，例如 `_debugSource`、`_debugStack` 和 `__reactFiber$*`，并把源码地址展示在页面高亮框上方。

## 功能

- 按住 `Option/Alt` 悬停页面元素，显示蓝色高亮框。
- 高亮框上方显示元素对应的本地源码地址。
- 单击锁定当前元素。
- 锁定后用方向键在 DOM 树中移动：
  - `ArrowUp`：父元素
  - `ArrowDown`：第一个子元素
  - `ArrowLeft`：上一个兄弟元素
  - `ArrowRight`：下一个兄弟元素
- 双击当前元素，按配置模板打开本地 IDE。
- `Esc` 清除锁定状态。
- 设置页支持配置 IDE URL 模板，适配 VS Code、Cursor、WebStorm 等编辑器。

## 使用场景

适合在本地 React 应用开发时快速回答这类问题：

- 这个按钮在哪个文件里？
- 当前页面这块 UI 是哪个组件渲染的？
- 如何从浏览器里直接跳到 IDE 的源码行列号？

## 安装与加载

安装依赖并构建：

```bash
npm install
npm run build
```

在 Chrome 中加载插件：

1. 打开 `chrome://extensions`
2. 开启 Developer mode
3. 点击 Load unpacked
4. 选择本仓库的 `dist` 目录，或选择打包后的 `release/component-location-extension`

生成可分发的 zip 包：

```bash
npm run package:extension
```

生成后的标准 Chrome 插件包位于：

```text
release/component-location-extension-0.1.0-chrome.zip
```

这个 zip 的根目录直接包含 `manifest.json`，可作为标准 Chrome 插件包使用。

## 本地 Demo

启动 demo：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:5173/demo.html
```

然后加载插件，在 demo 页面按住 `Option/Alt` 悬停元素即可验证高亮、源码地址、锁定、方向键导航和双击打开 IDE。

## IDE 模板

设置页支持以下变量：

- `{file}`：源码文件地址
- `{line}`：行号
- `{column}`：列号
- `{component}`：组件名

默认模板：

```text
vscode://file/{file}:{line}:{column}
```

常用模板：

```text
cursor://file/{file}:{line}:{column}
webstorm://open?file={file}&line={line}&column={column}
```

也可以填写自定义 URL scheme，只要目标 IDE 能识别即可。

## 技术实现

技术栈：

- Chrome Manifest V3
- React 18
- Vite
- TypeScript
- `@vitejs/plugin-react`
- `@babel/plugin-transform-react-jsx-source`

插件由两段 content script 协作：

- `world: "MAIN"` 的 bridge 脚本读取页面主世界中的 React 私有调试字段。
- 普通 content script 负责键鼠交互、高亮框、浮层和设置读取。

为了避免复杂页面中频繁触发 bridge 请求，hover 会通过 `requestAnimationFrame` 合并，scroll/resize 下的锁定元素刷新会做 debounce。

## 注意事项

- 该插件主要面向 React dev 环境。
- 生产构建、非 React 页面、或未包含 React 调试 source 信息的页面，可能无法获取源码位置。
- React 的 `_debugSource`、`_debugStack` 和 Fiber 字段都属于私有调试字段，未来 React 版本变化时可能需要适配。
- 当前默认匹配本地开发地址：`localhost`、`127.0.0.1`、`[::1]`。

## 常用命令

```bash
npm run dev
npm run typecheck
npm run test
npm run build
npm run package:extension
```
