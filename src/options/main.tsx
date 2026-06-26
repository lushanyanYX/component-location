import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, Code2, RotateCcw, Save } from 'lucide-react';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../lib/settings';
import { renderLocationTemplate } from '../lib/template';
import type { InspectorSettings, SourceLocation } from '../types';
import '../ui.css';

const sampleLocation: SourceLocation = {
  fileName: '/Users/me/project/src/components/Button.tsx',
  lineNumber: 12,
  columnNumber: 5,
  componentName: 'Button',
  source: 'debugSource'
};

const presets = [
  {
    label: 'VS Code',
    value: 'vscode://file/{file}:{line}:{column}'
  },
  {
    label: 'Cursor',
    value: 'cursor://file/{file}:{line}:{column}'
  },
  {
    label: 'WebStorm',
    value: 'webstorm://open?file={file}&line={line}&column={column}'
  }
];

function Options(): React.ReactElement {
  const [settings, setSettings] = useState<InspectorSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const preview = useMemo(() => renderLocationTemplate(settings.openTemplate, sampleLocation), [settings.openTemplate]);

  const update = (patch: Partial<InspectorSettings>): void => {
    setSaved(false);
    setSettings((current) => ({ ...current, ...patch }));
  };

  const persist = async (): Promise<void> => {
    await saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  return (
    <main className="panel options-panel">
      <header className="panel-header">
        <Code2 size={20} />
        <div>
          <h1>设置</h1>
          <p>配置双击打开 IDE 的地址模板</p>
        </div>
      </header>

      <section className="field-group">
        <label htmlFor="open-template">打开模板</label>
        <div className="preset-row">
          {presets.map((preset) => (
            <button
              key={preset.label}
              className={settings.openTemplate === preset.value ? 'chip active' : 'chip'}
              type="button"
              onClick={() => update({ openTemplate: preset.value })}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          id="open-template"
          value={settings.openTemplate}
          onChange={(event) => update({ openTemplate: event.target.value })}
          spellCheck={false}
        />
        <p className="help">可用变量：{'{file}'}、{'{line}'}、{'{column}'}、{'{component}'}</p>
      </section>

      <section className="field-group">
        <label htmlFor="copy-template">显示/复制格式</label>
        <input
          id="copy-template"
          value={settings.copyTemplate}
          onChange={(event) => update({ copyTemplate: event.target.value })}
          spellCheck={false}
        />
      </section>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={settings.closeOnOpen}
          onChange={(event) => update({ closeOnOpen: event.target.checked })}
        />
        双击打开后清除选中状态
      </label>

      <section className="preview-box">
        <span>预览</span>
        <code>{preview}</code>
      </section>

      <footer className="action-row">
        <button className="secondary-button" type="button" onClick={() => update(DEFAULT_SETTINGS)}>
          <RotateCcw size={16} />
          恢复默认
        </button>
        <button className="primary-button" type="button" onClick={persist}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '已保存' : '保存设置'}
        </button>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Options />);
