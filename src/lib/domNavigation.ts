import type { NavigationDirection } from '../types';

export function isInspectableElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement
    && !element.hasAttribute('data-component-location-overlay')
    && element.tagName !== 'SCRIPT'
    && element.tagName !== 'STYLE';
}

function firstInspectableChild(element: Element): HTMLElement | null {
  for (const child of Array.from(element.children)) {
    if (isInspectableElement(child)) {
      return child;
    }
  }
  return null;
}

function sibling(element: Element, direction: 'left' | 'right'): HTMLElement | null {
  let current = direction === 'left' ? element.previousElementSibling : element.nextElementSibling;
  while (current) {
    if (isInspectableElement(current)) {
      return current;
    }
    current = direction === 'left' ? current.previousElementSibling : current.nextElementSibling;
  }
  return null;
}

export function navigateElement(element: Element, direction: NavigationDirection): HTMLElement | null {
  if (direction === 'up') {
    return isInspectableElement(element.parentElement) ? element.parentElement : null;
  }
  if (direction === 'down') {
    return firstInspectableChild(element);
  }
  return sibling(element, direction);
}

export function getElementPath(element: Element): number[] {
  const path: number[] = [];
  let current: Element | null = element;

  while (current && current.parentElement) {
    path.unshift(Array.from(current.parentElement.children).indexOf(current));
    current = current.parentElement;
  }

  return path;
}

export function getElementByPath(path: number[]): Element | null {
  let current: Element = document.documentElement;
  for (const index of path) {
    const next = current.children.item(index);
    if (!next) {
      return null;
    }
    current = next;
  }
  return current;
}
