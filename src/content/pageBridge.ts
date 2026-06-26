import type { InspectResult, NavigationDirection } from '../types';

type BridgeRequestInput =
  | { type: 'CLOC_INSPECT_POINT'; x: number; y: number }
  | { type: 'CLOC_INSPECT_PATH'; path: number[] }
  | { type: 'CLOC_NAVIGATE'; path: number[]; direction: NavigationDirection };

const REQUEST_EVENT = 'CLOC_BRIDGE_REQUEST';
const RESPONSE_EVENT = 'CLOC_BRIDGE_RESPONSE';

export function requestBridge(request: BridgeRequestInput): Promise<InspectResult> {
  const id = `cloc-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener(RESPONSE_EVENT, onResponse as EventListener);
      resolve({ location: null, rect: null, path: null, tagName: null });
    }, 800);

    function onResponse(event: CustomEvent<{ id: string; result: InspectResult }>): void {
      if (event.detail?.id !== id) {
        return;
      }

      window.clearTimeout(timeout);
      window.removeEventListener(RESPONSE_EVENT, onResponse as EventListener);
      resolve(event.detail.result);
    }

    window.addEventListener(RESPONSE_EVENT, onResponse as EventListener);
    window.dispatchEvent(new CustomEvent(REQUEST_EVENT, {
      detail: { ...request, id }
    }));
  });
}

declare global {
  interface Window {
    __COMPONENT_LOCATION_BRIDGE__?: boolean;
  }
}
