import { getElementByPath, getElementPath, isInspectableElement, navigateElement } from '../lib/domNavigation';
import { getSourceFromElement } from '../lib/sourceParser';
import type { InspectResult } from '../types';

const REQUEST_EVENT = 'CLOC_BRIDGE_REQUEST';
const RESPONSE_EVENT = 'CLOC_BRIDGE_RESPONSE';

declare global {
  interface Window {
    __COMPONENT_LOCATION_BRIDGE__?: boolean;
  }
}

if (!window.__COMPONENT_LOCATION_BRIDGE__) {
  window.__COMPONENT_LOCATION_BRIDGE__ = true;
  window.addEventListener(REQUEST_EVENT, onRequest as EventListener);
}

function onRequest(event: CustomEvent): void {
  const detail = event.detail;
  if (!detail || typeof detail.id !== 'string') {
    return;
  }

  let result: InspectResult = emptyResult();
  if (detail.type === 'CLOC_INSPECT_POINT') {
    result = resultForElement(document.elementFromPoint(detail.x, detail.y));
  }
  if (detail.type === 'CLOC_INSPECT_PATH') {
    result = resultForElement(Array.isArray(detail.path) ? getElementByPath(detail.path) : null);
  }
  if (detail.type === 'CLOC_NAVIGATE') {
    const current = Array.isArray(detail.path) ? getElementByPath(detail.path) : null;
    const next = current ? navigateElement(current, detail.direction) : null;
    result = resultForElement(next || current);
  }

  window.dispatchEvent(new CustomEvent(RESPONSE_EVENT, {
    detail: { id: detail.id, result }
  }));
}

function emptyResult(): InspectResult {
  return { location: null, rect: null, path: null, tagName: null };
}

function resultForElement(element: Element | null): InspectResult {
  if (!isInspectableElement(element)) {
    return emptyResult();
  }
  const rect = element.getBoundingClientRect();
  return {
    location: getSourceFromElement(element),
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    },
    path: getElementPath(element),
    tagName: element.tagName.toLowerCase()
  };
}
