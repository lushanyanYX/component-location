import type { InspectorSettings } from '../types';
import { DEFAULT_COPY_TEMPLATE, DEFAULT_OPEN_TEMPLATE } from './template';

export const DEFAULT_SETTINGS: InspectorSettings = {
  openTemplate: DEFAULT_OPEN_TEMPLATE,
  copyTemplate: DEFAULT_COPY_TEMPLATE,
  closeOnOpen: false
};

export async function loadSettings(): Promise<InspectorSettings> {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return {
    openTemplate: String(stored.openTemplate || DEFAULT_SETTINGS.openTemplate),
    copyTemplate: String(stored.copyTemplate || DEFAULT_SETTINGS.copyTemplate),
    closeOnOpen: Boolean(stored.closeOnOpen)
  };
}

export async function saveSettings(settings: InspectorSettings): Promise<void> {
  await chrome.storage.sync.set(settings);
}
