import React from 'react';

export default function Sidebar({ channels, activeId, onSelect }) {
  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '16px 16px 10px',
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.8px',
        color: 'var(--muted)',
        borderBottom: '1px solid var(--border)',
      }}>
        Channels
      </div>

      <div style={{ padding: '8px 0' }}>
        {channels.map(ch => {
          const isActive = ch.id === activeId;
          return (
            <button
              key={ch.id}
              onClick={() => onSelect(ch)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 14px',
                background: isActive ? 'var(--surface2)' : 'none',
                border: 'none',
                borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                color: isActive ? 'var(--accent)' : 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{ch.logo}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 2 }}>
                  {ch.category}
                </div>
              </span>

              {isActive && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--green)',
                  boxShadow: '0 0 0 0 rgba(34,197,94,0.6)',
                  animation: 'sonar 1.5s infinite',
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes sonar {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </aside>
  );
}
