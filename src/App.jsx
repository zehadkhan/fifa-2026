import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';
import { channels } from './channels.js';

export default function App() {
  const [activeChannel, setActiveChannel] = useState(null);

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
        height: 56,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
          <span style={{ fontSize: '1.5rem' }}>⚽</span>
          <span>FIFA <span style={{ color: 'var(--accent)' }}>2026</span> Live</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeChannel && (
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Watching: <strong style={{ color: 'var(--text)' }}>{activeChannel.name}</strong>
            </span>
          )}
          <div style={{
            background: 'var(--live)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            padding: '3px 9px',
            borderRadius: 5,
            animation: 'blink 2s infinite',
          }}>
            LIVE
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          channels={channels}
          activeId={activeChannel?.id}
          onSelect={(ch) => setActiveChannel(ch)}
        />
        <Player channel={activeChannel} />
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
