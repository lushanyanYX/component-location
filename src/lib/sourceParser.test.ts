import { describe, expect, it } from 'vitest';
import { getSourceFromElement, getSourceFromFiber, parseDebugStack } from './sourceParser';

describe('sourceParser', () => {
  it('reads direct _debugSource from an element', () => {
    const element = document.createElement('button') as HTMLButtonElement & {
      _debugSource?: unknown;
    };
    element._debugSource = {
      fileName: '/project/src/Button.tsx',
      lineNumber: 4,
      columnNumber: 9
    };

    expect(getSourceFromElement(element)).toEqual({
      fileName: '/project/src/Button.tsx',
      lineNumber: 4,
      columnNumber: 9,
      componentName: undefined,
      source: 'debugSource'
    });
  });

  it('walks up React fiber return chain', () => {
    function Button(): null {
      return null;
    }
    const childFiber = {
      type: 'button',
      return: {
        type: Button,
        _debugSource: {
          fileName: '/project/src/Button.tsx',
          lineNumber: 12,
          columnNumber: 3
        }
      }
    };

    expect(getSourceFromFiber(childFiber)).toEqual({
      fileName: '/project/src/Button.tsx',
      lineNumber: 12,
      columnNumber: 3,
      componentName: 'Button',
      source: 'debugSource'
    });
  });

  it('reads fiber expando from DOM element', () => {
    const element = document.createElement('div') as HTMLDivElement & Record<string, unknown>;
    element.__reactFiber$abc = {
      _debugSource: {
        fileName: '/project/src/Card.tsx',
        lineNumber: 20,
        columnNumber: 1
      }
    };

    expect(getSourceFromElement(element)?.fileName).toBe('/project/src/Card.tsx');
    expect(getSourceFromElement(element)?.source).toBe('reactFiber');
  });

  it('parses file locations from debug stacks', () => {
    const stack = 'Error\\n    at Button (/project/src/Button.tsx:8:11)\\n    at div';

    expect(parseDebugStack(stack, 'Button')).toEqual({
      fileName: '/project/src/Button.tsx',
      lineNumber: 8,
      columnNumber: 11,
      componentName: 'Button',
      source: 'debugStack'
    });
  });

  it('prefers application frames over React runtime frames', () => {
    const stack = [
      'Error: react-stack-top-frame',
      '    at exports.jsxDEV (http://127.0.0.1:5173/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=abc:244:30)',
      '    at ActivityList (http://127.0.0.1:5173/src/demo/main.tsx:58:93)'
    ].join('\n');

    expect(parseDebugStack(stack, 'ActivityList')).toEqual({
      fileName: 'http://127.0.0.1:5173/src/demo/main.tsx',
      lineNumber: 58,
      columnNumber: 93,
      componentName: 'ActivityList',
      source: 'debugStack'
    });
  });
});
