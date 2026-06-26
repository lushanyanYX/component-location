import type { InspectResult, InspectorSettings, NavigationDirection } from '../types';
import { requestBridge } from './pageBridge';
import { InspectorOverlay } from './overlay';

const DEFAULT_SETTINGS: InspectorSettings = {
  openTemplate: 'vscode://file/{file}:{line}:{column}',
  copyTemplate: '{file}:{line}:{column}',
  closeOnOpen: false
};

let settings: InspectorSettings;
let overlay: InspectorOverlay;
let hoverResult: InspectResult | null = null;
let lockedResult: InspectResult | null = null;
let optionDown = false;
let lastPoint: { x: number; y: number } | null = null;
let requestSeq = 0;
let hoverFrame = 0;
let pendingHoverPoint: { x: number; y: number } | null = null;
let refreshTimer = 0;

async function bootstrap(): Promise<void> {
  settings = await loadContentSettings();
  overlay = new InspectorOverlay();
  bindEvents();
}

function bindEvents(): void {
  window.addEventListener('mousemove', onMouseMove, true);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('dblclick', onDoubleClick, true);
  window.addEventListener('scroll', scheduleRefreshLocked, true);
  window.addEventListener('resize', scheduleRefreshLocked, true);
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }
    settings = {
      ...settings,
      openTemplate: String(changes.openTemplate?.newValue ?? settings.openTemplate),
      copyTemplate: String(changes.copyTemplate?.newValue ?? settings.copyTemplate),
      closeOnOpen: Boolean(changes.closeOnOpen?.newValue ?? settings.closeOnOpen)
    };
    renderCurrent();
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'CLOC_CLEAR_SELECTION') {
      clearSelection();
    }
  });
}

function onMouseMove(event: MouseEvent): void {
  optionDown = event.altKey;
  lastPoint = { x: event.clientX, y: event.clientY };
  if (!optionDown || lockedResult) {
    if (!lockedResult && !optionDown) {
      overlay.hide();
    }
    return;
  }
  scheduleInspectPoint(event.clientX, event.clientY);
}

function onKeyDown(event: KeyboardEvent): void {
  optionDown = event.altKey || optionDown;
  if (event.key === 'Alt' && lastPoint && !lockedResult) {
    scheduleInspectPoint(lastPoint.x, lastPoint.y);
    return;
  }

  if (event.key === 'Escape') {
    clearSelection();
    return;
  }

  if (!lockedResult?.path) {
    return;
  }

  const direction = keyToDirection(event.key);
  if (!direction) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  navigate(direction);
}

function onKeyUp(event: KeyboardEvent): void {
  if (event.key !== 'Alt') {
    return;
  }
  optionDown = false;
  cancelPendingHover();
  if (!lockedResult) {
    hoverResult = null;
    overlay.hide();
  }
}

function onClick(event: MouseEvent): void {
  if (!optionDown && !hoverResult && !lockedResult) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (hoverResult?.path) {
    lockedResult = hoverResult;
    renderCurrent();
  }
}

async function onDoubleClick(event: MouseEvent): Promise<void> {
  const target = lockedResult || hoverResult;
  if (!target?.location) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const url = renderLocationTemplate(settings.openTemplate, target.location);
  window.open(url, '_self');
  if (settings.closeOnOpen) {
    clearSelection();
  }
}

async function inspectPoint(x: number, y: number): Promise<void> {
  const seq = ++requestSeq;
  const result = await requestBridge({ type: 'CLOC_INSPECT_POINT', x, y });
  if (seq !== requestSeq || lockedResult) {
    return;
  }
  hoverResult = result;
  overlay.update(result, settings.copyTemplate, false);
}

function scheduleInspectPoint(x: number, y: number): void {
  pendingHoverPoint = { x, y };
  if (hoverFrame) {
    return;
  }

  hoverFrame = window.requestAnimationFrame(() => {
    hoverFrame = 0;
    const point = pendingHoverPoint;
    pendingHoverPoint = null;
    if (!point || !optionDown || lockedResult) {
      return;
    }
    inspectPoint(point.x, point.y);
  });
}

function cancelPendingHover(): void {
  pendingHoverPoint = null;
  if (!hoverFrame) {
    return;
  }
  window.cancelAnimationFrame(hoverFrame);
  hoverFrame = 0;
}

async function navigate(direction: NavigationDirection): Promise<void> {
  if (!lockedResult?.path) {
    return;
  }
  const result = await requestBridge({ type: 'CLOC_NAVIGATE', path: lockedResult.path, direction });
  lockedResult = result;
  renderCurrent();
}

function refreshLocked(): void {
  if (!lockedResult?.path) {
    return;
  }
  requestBridge({ type: 'CLOC_INSPECT_PATH', path: lockedResult.path }).then((result) => {
    lockedResult = result.path ? result : lockedResult;
    renderCurrent();
  });
}

function scheduleRefreshLocked(): void {
  if (!lockedResult?.path) {
    return;
  }
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(refreshLocked, 80);
}

function renderCurrent(): void {
  const current = lockedResult || hoverResult;
  if (!current) {
    overlay.hide();
    return;
  }
  overlay.update(current, settings.copyTemplate, Boolean(lockedResult));
}

function clearSelection(): void {
  lockedResult = null;
  hoverResult = null;
  overlay.hide();
}

function keyToDirection(key: string): NavigationDirection | null {
  if (key === 'ArrowUp') return 'up';
  if (key === 'ArrowDown') return 'down';
  if (key === 'ArrowLeft') return 'left';
  if (key === 'ArrowRight') return 'right';
  return null;
}

bootstrap().catch((error) => {
  console.error('[Component Location] failed to start', error);
});

async function loadContentSettings(): Promise<InspectorSettings> {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return {
    openTemplate: String(stored.openTemplate || DEFAULT_SETTINGS.openTemplate),
    copyTemplate: String(stored.copyTemplate || DEFAULT_SETTINGS.copyTemplate),
    closeOnOpen: Boolean(stored.closeOnOpen)
  };
}

function renderLocationTemplate(template: string, location: NonNullable<InspectResult['location']>): string {
  const values: Record<string, string> = {
    file: location.fileName,
    line: String(location.lineNumber ?? 1),
    column: String(location.columnNumber ?? 1),
    component: location.componentName ?? ''
  };

  return template.replace(/\{(file|line|column|component)\}/g, (_, key: string) => values[key] ?? '');
}
