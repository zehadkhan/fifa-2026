import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';

export default function App() {
  const [active, setActive] = useState(null);
  const activeKey = active ? `${active.matchId}-${active.channelId}` : null;

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', color: 'var(--text)',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 54,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚽</span>
          <span>FIFA <span style={{ color: 'var(--accent)' }}>2026</span> Live</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {active && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                {active.matchTeams}
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={{
                fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600,
                background: 'rgba(99,102,241,0.12)', padding: '2px 8px', borderRadius: 5,
              }}>
                {active.flag} {active.name}
              </span>
            </div>
          )}
          <div style={{
            background: 'var(--live)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '1.5px',
            padding: '3px 8px', borderRadius: 4, animation: 'blink 2s infinite',
          }}>LIVE</div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeKey={activeKey} onSelectChannel={setActive} />
        <Player channel={active} />
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}
