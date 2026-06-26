import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function Toolbar(): React.ReactElement {
  return (
    <nav className="toolbar">
      <button type="button">Dashboard</button>
      <button type="button">Issues</button>
      <button type="button">Settings</button>
    </nav>
  );
}

function MetricCard(props: { title: string; value: string; tone: 'blue' | 'green' | 'rose' }): React.ReactElement {
  return (
    <article className={`metric-card ${props.tone}`}>
      <span>{props.title}</span>
      <strong>{props.value}</strong>
    </article>
  );
}

function ActivityList(): React.ReactElement {
  const [selected, setSelected] = useState('Button.tsx');

  return (
    <section className="activity-panel">
      <h2>Recent components</h2>
      <ul>
        {['Button.tsx', 'Header.tsx', 'MetricCard.tsx'].map((item) => (
          <li key={item}>
            <button
              className={selected === item ? 'active-row' : ''}
              type="button"
              onClick={() => setSelected(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DemoApp(): React.ReactElement {
  return (
    <main className="demo-shell">
      <header className="demo-header">
        <div>
          <p>React dev demo</p>
          <h1>Component Location Playground</h1>
        </div>
        <Toolbar />
      </header>

      <section className="metric-grid">
        <MetricCard title="Located" value="128" tone="blue" />
        <MetricCard title="Opened" value="42" tone="green" />
        <MetricCard title="Misses" value="3" tone="rose" />
      </section>

      <ActivityList />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<DemoApp />);
