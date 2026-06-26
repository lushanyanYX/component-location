export interface SourceLocation {
  fileName: string;
  lineNumber?: number;
  columnNumber?: number;
  componentName?: string;
  source: 'debugSource' | 'debugStack' | 'reactFiber';
}

export interface InspectorSettings {
  openTemplate: string;
  copyTemplate: string;
  closeOnOpen: boolean;
}

export interface InspectResult {
  location: SourceLocation | null;
  rect: ElementRect | null;
  path: number[] | null;
  tagName: string | null;
}

export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';
