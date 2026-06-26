import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExternalLink, MousePointer2, Settings } from 'lucide-react';
import '../ui.css';

function Popup(): React.ReactElement {
  const openOptions = (): void => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <main className="panel popup-panel">
      <header className="panel-header">
        <MousePointer2 size={18} />
        <div>
          <h1>Component Location</h1>
          <p>React 本地组件定位</p>
        </div>
      </header>

      <section className="hint-list">
        <div>
          <kbd>Option</kbd>
          <span>按住后悬停 DOM 元素</span>
        </div>
        <div>
          <kbd>Click</kbd>
          <span>锁定当前元素</span>
        </div>
        <div>
          <kbd>↑ ↓ ← →</kbd>
          <span>在 DOM 树中移动</span>
        </div>
        <div>
          <kbd>Double click</kbd>
          <span>打开本地 IDE</span>
        </div>
      </section>

      <button className="primary-button" type="button" onClick={openOptions}>
        <Settings size={16} />
        打开设置
        <ExternalLink size={14} />
      </button>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);
