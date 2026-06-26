[English](./README.md) | [中文](./README.zh-CN.md)

# Component Location

Component Location is a Chrome extension for local React development. It helps you quickly find the local source file behind a DOM element on the page.

The extension does not require an extra runtime plugin in your application. In React development builds, it reads React debug metadata from DOM/Fiber internals, including `_debugSource`, `_debugStack`, and `__reactFiber$*`, then shows the source location above the highlighted element.

## Features

- Hold `Option/Alt` and hover a DOM element to show a blue highlight box.
- Show the local source location above the highlighted element.
- Click an element to lock the current selection.
- After locking, use arrow keys to navigate the DOM tree:
  - `ArrowUp`: parent element
  - `ArrowDown`: first child element
  - `ArrowLeft`: previous sibling element
  - `ArrowRight`: next sibling element
- Double-click the current element to open the source location in your local IDE.
- Press `Esc` to clear the locked selection.
- Configure IDE URL templates in the extension options page for VS Code, Cursor, WebStorm, or custom editors.

## Use Cases

This extension is useful when you are developing a local React app and want to answer questions like:

- Which file renders this button?
- Which component owns this part of the UI?
- How can I jump from the browser directly to the source line in my IDE?

## Install and Load

Install dependencies and build the extension:

```bash
npm install
npm run build
```

Load it in Chrome:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `dist` directory, or select `release/component-location-extension` after packaging

To generate a distributable zip package:

```bash
npm run package:extension
```

The generated Chrome extension zip is:

```text
release/component-location-extension-0.1.0-chrome.zip
```

The zip contains `manifest.json` at the root, so it can be used as a standard Chrome extension package.

## Local Demo

Start the demo:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/demo.html
```

Load the extension, then hold `Option/Alt` on the demo page to verify highlight, source location display, locked selection, keyboard navigation, and IDE opening.

## IDE Templates

The options page supports these variables:

- `{file}`: source file path
- `{line}`: line number
- `{column}`: column number
- `{component}`: component name

Default template:

```text
vscode://file/{file}:{line}:{column}
```

Common templates:

```text
cursor://file/{file}:{line}:{column}
webstorm://open?file={file}&line={line}&column={column}
```

You can also use any custom URL scheme supported by your IDE.

## How It Works

Tech stack:

- Chrome Manifest V3
- React 18
- Vite
- TypeScript
- `@vitejs/plugin-react`
- `@babel/plugin-transform-react-jsx-source`

The extension uses two content scripts:

- A `world: "MAIN"` bridge script reads React private debug fields from the page context.
- A regular content script handles keyboard/mouse interaction, highlight rendering, tooltip rendering, and settings.

To reduce work on large pages, hover inspection is batched with `requestAnimationFrame`, and locked-element refresh on scroll/resize is debounced.

## Notes

- This extension is designed for React development builds.
- Production builds, non-React pages, or pages without React source debug metadata may not provide source locations.
- React `_debugSource`, `_debugStack`, and Fiber fields are private debug internals and may require compatibility updates in future React versions.
- The extension currently matches local development origins: `localhost`, `127.0.0.1`, and `[::1]`.

## Scripts

```bash
npm run dev
npm run typecheck
npm run test
npm run build
npm run package:extension
```
