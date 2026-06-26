import { copyFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const releaseDir = resolve(root, 'release');
const extensionDir = resolve(releaseDir, 'component-location-extension');
const zipPath = resolve(releaseDir, 'component-location-extension-0.1.0-chrome.zip');

const files = [
  ['dist/manifest.json', 'manifest.json'],
  ['dist/popup.html', 'popup.html'],
  ['dist/options.html', 'options.html'],
  ['dist/assets/background.js', 'assets/background.js'],
  ['dist/assets/content.js', 'assets/content.js'],
  ['dist/assets/pageBridgeMain.js', 'assets/pageBridgeMain.js'],
  ['dist/assets/popup.js', 'assets/popup.js'],
  ['dist/assets/options.js', 'assets/options.js'],
  ['dist/assets/client.js', 'assets/client.js'],
  ['dist/assets/ui.js', 'assets/ui.js'],
  ['dist/assets/ui.css', 'assets/ui.css']
];

await rm(extensionDir, { recursive: true, force: true });
await rm(zipPath, { force: true });

for (const [from, to] of files) {
  const target = resolve(extensionDir, to);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, from), target);
}

if (!existsSync(resolve(extensionDir, 'manifest.json'))) {
  throw new Error('manifest.json was not copied into the extension package');
}

await execFileAsync('zip', ['-r', '../component-location-extension-0.1.0-chrome.zip', '.'], {
  cwd: extensionDir
});

console.log(`Created ${zipPath}`);
