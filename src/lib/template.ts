import type { SourceLocation } from '../types';

export const DEFAULT_OPEN_TEMPLATE = 'vscode://file/{file}:{line}:{column}';
export const DEFAULT_COPY_TEMPLATE = '{file}:{line}:{column}';

export function renderLocationTemplate(template: string, location: SourceLocation): string {
  const values: Record<string, string> = {
    file: location.fileName,
    line: String(location.lineNumber ?? 1),
    column: String(location.columnNumber ?? 1),
    component: location.componentName ?? ''
  };

  return template.replace(/\{(file|line|column|component)\}/g, (_, key: string) => values[key] ?? '');
}
