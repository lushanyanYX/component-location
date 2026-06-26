import type { SourceLocation } from '../types';

type AnyRecord = Record<PropertyKey, unknown>;

interface DebugSource {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getComponentName(fiber: unknown): string | undefined {
  if (!isRecord(fiber)) {
    return undefined;
  }

  const candidates = [fiber.elementType, fiber.type];
  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      const namedCandidate = candidate as Function & { displayName?: string };
      return namedCandidate.displayName || namedCandidate.name || undefined;
    }
    if (isRecord(candidate)) {
      const displayName = readString(candidate.displayName);
      const name = readString(candidate.name);
      if (displayName || name) {
        return displayName || name;
      }
      const render = candidate.render;
      if (typeof render === 'function') {
        const namedRender = render as Function & { displayName?: string };
        return namedRender.displayName || namedRender.name || undefined;
      }
    }
  }

  return undefined;
}

function sourceFromDebugSource(source: unknown, componentName?: string): SourceLocation | null {
  if (!isRecord(source)) {
    return null;
  }

  const debugSource = source as DebugSource;
  const fileName = readString(debugSource.fileName);
  if (!fileName) {
    return null;
  }

  return {
    fileName,
    lineNumber: readNumber(debugSource.lineNumber),
    columnNumber: readNumber(debugSource.columnNumber),
    componentName,
    source: 'debugSource'
  };
}

export function parseDebugStack(stackLike: unknown, componentName?: string): SourceLocation | null {
  const stack = typeof stackLike === 'string'
    ? stackLike
    : isRecord(stackLike) && typeof stackLike.stack === 'string'
      ? stackLike.stack
      : '';

  if (!stack) {
    return null;
  }

  const lines = stack.replace(/\\n/g, '\n').split('\n').map((line) => line.trim()).filter(Boolean);
  const candidates: SourceLocation[] = [];
  for (const line of lines) {
    const match = line.match(/(?:at\s+.*?\()?((?:file|https?):\/\/[^)\s]+|\/[^)\s]+|\w:[/\\][^)\s]+):(\d+):(\d+)\)?$/);
    if (!match) {
      continue;
    }

    candidates.push({
      fileName: match[1],
      lineNumber: Number(match[2]),
      columnNumber: Number(match[3]),
      componentName,
      source: 'debugStack'
    });
  }

  return candidates.find((candidate) => !isDependencyFrame(candidate.fileName)) ?? candidates[0] ?? null;
}

function isDependencyFrame(fileName: string): boolean {
  return fileName.includes('/node_modules/')
    || fileName.includes('/@fs/')
    || fileName.includes('react_jsx-dev-runtime')
    || fileName.includes('react-dom_client');
}

export function getSourceFromFiber(fiber: unknown): SourceLocation | null {
  let current = fiber;
  const seen = new Set<unknown>();

  while (isRecord(current) && !seen.has(current)) {
    seen.add(current);
    const componentName = getComponentName(current);
    const debugSource = sourceFromDebugSource(current._debugSource, componentName);
    if (debugSource) {
      return debugSource;
    }

    const debugStack = parseDebugStack(current._debugStack, componentName);
    if (debugStack) {
      return {
        ...debugStack,
        source: 'debugStack'
      };
    }

    current = current.return;
  }

  return null;
}

export function findReactFiber(element: Element): unknown {
  const keys = Object.keys(element);
  const fiberKey = keys.find((key) => key.startsWith('__reactFiber$'));
  if (fiberKey) {
    return (element as unknown as AnyRecord)[fiberKey];
  }

  const propsKey = keys.find((key) => key.startsWith('__reactProps$'));
  if (propsKey) {
    const props = (element as unknown as AnyRecord)[propsKey];
    if (isRecord(props) && isRecord(props.children)) {
      return props.children;
    }
  }

  return null;
}

export function getSourceFromElement(element: Element | null): SourceLocation | null {
  let current: Element | null = element;

  while (current) {
    const directSource = sourceFromDebugSource((current as unknown as AnyRecord)._debugSource);
    if (directSource) {
      return directSource;
    }

    const fiberSource = getSourceFromFiber(findReactFiber(current));
    if (fiberSource) {
      return {
        ...fiberSource,
        source: fiberSource.source === 'debugStack' ? 'debugStack' : 'reactFiber'
      };
    }

    current = current.parentElement;
  }

  return null;
}
