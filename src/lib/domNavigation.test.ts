import { describe, expect, it } from 'vitest';
import { getElementByPath, getElementPath, navigateElement } from './domNavigation';

describe('domNavigation', () => {
  it('moves between parent, child, and siblings', () => {
    document.body.innerHTML = '<main><button id="a"></button><section id="b"><span id="c"></span></section></main>';
    const section = document.getElementById('b')!;

    expect(navigateElement(section, 'up')?.tagName).toBe('MAIN');
    expect(navigateElement(section, 'down')?.id).toBe('c');
    expect(navigateElement(section, 'left')?.id).toBe('a');
    expect(navigateElement(document.getElementById('a')!, 'right')?.id).toBe('b');
  });

  it('round-trips element paths', () => {
    document.body.innerHTML = '<main><section><span id="target"></span></section></main>';
    const target = document.getElementById('target')!;

    expect(getElementByPath(getElementPath(target))).toBe(target);
  });
});
