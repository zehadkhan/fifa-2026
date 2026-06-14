import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';
import { matches } from './channels.js';

export default function App() {
  const [active, setActive] = useState(null);
  // active = { matchId, channelId, name, flag, url, matchTeams }

  const activeKey = active ? `${active.matchId}-${active.channelId}` : null;

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 54,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚽</span>
          <span>FIFA <span style={{ color: 'var(--accent)' }}>2026</span> Live</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {active && (
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {active.matchTeams} · <span style={{ color: 'var(--text)', fontWeight: 600 }}>{active.flag} {active.name}</span>
            </span>
          )}
          <div style={{
            background: 'var(--live)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 800,
            letterSpacing: '1.5px', padding: '3px 8px',
            borderRadius: 4, animation: 'blink 2s infinite',
          }}>
            LIVE
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          matches={matches}
          activeKey={activeKey}
          onSelectChannel={setActive}
        />
        <Player channel={active} />
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
