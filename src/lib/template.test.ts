import { describe, expect, it } from 'vitest';
import { renderLocationTemplate } from './template';
import type { SourceLocation } from '../types';

describe('renderLocationTemplate', () => {
  const location: SourceLocation = {
    fileName: '/tmp/app/src/Button.tsx',
    lineNumber: 10,
    columnNumber: 7,
    componentName: 'Button',
    source: 'debugSource'
  };

  it('renders known placeholders', () => {
    expect(renderLocationTemplate('{file}:{line}:{column}:{component}', location))
      .toBe('/tmp/app/src/Button.tsx:10:7:Button');
  });

  it('uses 1 as fallback line and column', () => {
    expect(renderLocationTemplate('{file}:{line}:{column}', { fileName: 'a.tsx', source: 'reactFiber' }))
      .toBe('a.tsx:1:1');
  });
});
