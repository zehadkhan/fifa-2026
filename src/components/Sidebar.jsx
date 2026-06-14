import React, { useState } from 'react';
import { channelDefs, getChannelUrl } from '../channels.js';

export default function Sidebar({ matches, activeKey, onSelectChannel }) {
  const [openMatchId, setOpenMatchId] = useState(matches[0]?.id ?? null);

  const toggleMatch = (id) => setOpenMatchId(prev => prev === id ? null : id);

  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 14px',
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.8px',
        color: 'var(--muted)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>⚽ Schedule — Jun 15</span>
        <span style={{
          background: 'rgba(99,102,241,0.15)',
          color: 'var(--accent)',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: '0.6rem',
          letterSpacing: '1px',
        }}>🇧🇩 BD Time</span>
      </div>

      {/* Match list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {matches.map(match => {
          const isOpen = openMatchId === match.id;
          return (
            <div key={match.id} style={{ borderBottom: '1px solid var(--border)' }}>

              {/* Match header */}
              <button
                onClick={() => toggleMatch(match.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '11px 14px',
                  background: isOpen ? 'var(--surface2)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text)',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--live)',
                  background: 'rgba(239,68,68,0.1)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  flexShrink: 0,
                  letterSpacing: '0.3px',
                }}>
                  {match.time}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  flex: 1,
                  lineHeight: 1.3,
                }}>
                  {match.teams}
                </span>
                <span style={{
                  color: 'var(--muted)',
                  fontSize: '0.7rem',
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>▶</span>
              </button>

              {/* Channel list */}
              {isOpen && (
                <div style={{ background: 'var(--bg)', paddingBottom: 4 }}>
                  <div style={{
                    padding: '6px 14px 4px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.4px',
                    color: 'var(--muted)',
                  }}>
                    {match.channelIds.length} channels available
                  </div>
                  {match.channelIds.map(id => {
                    const ch = channelDefs[id];
                    if (!ch) return null;
                    const key = `${match.id}-${id}`;
                    const isActive = activeKey === key;
                    return (
                      <button
                        key={id}
                        onClick={() => onSelectChannel({ matchId: match.id, channelId: id, name: ch.name, flag: ch.flag, url: getChannelUrl(id), matchTeams: match.teams })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '7px 14px 7px 20px',
                          background: isActive ? 'var(--surface2)' : 'none',
                          border: 'none',
                          borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                          color: isActive ? 'var(--accent)' : 'var(--text)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.82rem',
                          transition: 'all 0.12s',
                        }}
                      >
                        <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{ch.flag}</span>
                        <span style={{
                          flex: 1,
                          fontWeight: isActive ? 600 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {ch.name}
                        </span>
                        {isActive && (
                          <span style={{
                            width: 7, height: 7,
                            borderRadius: '50%',
                            background: '#22c55e',
                            flexShrink: 0,
                            animation: 'sonar 1.5s infinite',
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes sonar {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </aside>
  );
}
