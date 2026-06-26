import type { InspectResult, SourceLocation } from '../types';

export class InspectorOverlay {
  private frame: HTMLDivElement;
  private label: HTMLDivElement;

  constructor() {
    this.frame = document.createElement('div');
    this.label = document.createElement('div');
    this.frame.setAttribute('data-component-location-overlay', 'frame');
    this.label.setAttribute('data-component-location-overlay', 'label');
    this.frame.style.cssText = [
      'position:fixed',
      'z-index:2147483646',
      'pointer-events:none',
      'border:2px solid #1677ff',
      'box-shadow:0 0 0 1px rgba(22,119,255,.16),0 8px 26px rgba(22,119,255,.22)',
      'border-radius:4px',
      'display:none',
      'box-sizing:border-box'
    ].join(';');
    this.label.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'pointer-events:none',
      'max-width:min(760px,calc(100vw - 16px))',
      'padding:5px 8px',
      'border-radius:4px',
      'background:#1677ff',
      'color:#fff',
      'font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace',
      'white-space:nowrap',
      'overflow:hidden',
      'text-overflow:ellipsis',
      'display:none',
      'box-shadow:0 8px 24px rgba(0,0,0,.18)'
    ].join(';');
    document.documentElement.append(this.frame, this.label);
  }

  update(result: InspectResult, copyTemplate: string, locked: boolean): void {
    if (!result.rect) {
      this.hide();
      return;
    }

    const rect = result.rect;
    this.frame.style.display = 'block';
    this.frame.style.left = `${Math.max(0, rect.left ?? rect.x ?? 0)}px`;
    this.frame.style.top = `${Math.max(0, rect.top ?? rect.y ?? 0)}px`;
    this.frame.style.width = `${Math.max(0, rect.width ?? 0)}px`;
    this.frame.style.height = `${Math.max(0, rect.height ?? 0)}px`;
    this.frame.style.borderStyle = locked ? 'solid' : 'dashed';

    const text = this.labelText(result.location, copyTemplate, result.tagName);
    this.label.textContent = text;
    this.label.style.display = 'block';
    const labelTop = Math.max(8, (rect.top ?? rect.y ?? 0) - 30);
    const labelLeft = Math.min(Math.max(8, rect.left ?? rect.x ?? 0), window.innerWidth - 24);
    this.label.style.top = `${labelTop}px`;
    this.label.style.left = `${labelLeft}px`;
  }

  hide(): void {
    this.frame.style.display = 'none';
    this.label.style.display = 'none';
  }

  destroy(): void {
    this.frame.remove();
    this.label.remove();
  }

  private labelText(location: SourceLocation | null, copyTemplate: string, tagName: string | null): string {
    if (!location) {
      return tagName ? `<${tagName}> no React dev source` : 'no inspectable element';
    }
    const prefix = location.componentName ? `${location.componentName} ` : '';
    return `${prefix}${renderLocationTemplate(copyTemplate, location)}`;
  }
}

function renderLocationTemplate(template: string, location: SourceLocation): string {
  const values: Record<string, string> = {
    file: location.fileName,
    line: String(location.lineNumber ?? 1),
    column: String(location.columnNumber ?? 1),
    component: location.componentName ?? ''
  };

  return template.replace(/\{(file|line|column|component)\}/g, (_, key: string) => values[key] ?? '');
}
