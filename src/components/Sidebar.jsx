import React, { useState, useEffect, useRef } from 'react';
import { channelDefs, getChannelUrl, matches as staticMatches } from '../channels.js';
import {
  fetchMatches, toBDTime, toBDDate, toBDDateKey, isBDToday,
  getStatus, getTeams, getClock, msUntil, fmtCountdown, BD_TZ,
} from '../api.js';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// Match team names against our static channel data
function findStaticChannels(teams) {
  const h = teams.home.toLowerCase();
  const a = teams.away.toLowerCase();
  const found = staticMatches.find(m => {
    const t = m.teams.toLowerCase();
    return t.includes(h) || t.includes(a);
  });
  return found?.channelIds ?? staticMatches[0]?.channelIds ?? [];
}

export default function Sidebar({ activeKey, onSelectChannel }) {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [openId, setOpenId]     = useState(null);
  const [countdown, setCountdown] = useState('');
  const countdownRef = useRef(null);
  const now = useClock();

  const bdTimeStr = now.toLocaleTimeString('en-US', {
    timeZone: BD_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  const bdDateStr = now.toLocaleDateString('en-US', {
    timeZone: BD_TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  useEffect(() => {
    fetchMatches(10)
      .then(data => {
        setMatches(data);
        // Auto-open first upcoming or live match
        const first = data.find(e => getStatus(e) !== 'finished');
        if (first) setOpenId(first.id);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Countdown to next match
  useEffect(() => {
    const next = matches.find(e => getStatus(e) === 'upcoming');
    if (!next) { setCountdown(''); return; }
    const update = () => setCountdown(fmtCountdown(msUntil(next.date)));
    update();
    countdownRef.current = setInterval(update, 1000);
    return () => clearInterval(countdownRef.current);
  }, [matches]);

  // Group by BD date
  const grouped = {};
  matches.forEach(e => {
    const key = toBDDateKey(e.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const toggle = id => setOpenId(prev => prev === id ? null : id);

  return (
    <aside style={{
      width: 290, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* BD Clock */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--surface2)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem' }}>🇧🇩</span>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
              {bdTimeStr}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 1 }}>
              {bdDateStr} · BST (UTC+6)
            </div>
          </div>
        </div>

        {countdown && (
          <div style={{
            marginTop: 8, padding: '5px 10px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 6, fontSize: '0.72rem', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>⏱</span>
            <span>Next match in <strong>{countdown}</strong></span>
          </div>
        )}
      </div>

      {/* Match list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Loading fixtures...
          </div>
        )}

        {error && (
          <div style={{ padding: 14 }}>
            <div style={{ color: 'var(--live)', fontSize: '0.75rem', marginBottom: 8 }}>
              ⚠ Could not load live fixtures
            </div>
            {/* Fall back to static matches */}
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Showing saved schedule</div>
            {staticMatches.map(m => (
              <StaticMatchCard
                key={m.id} match={m} openId={openId} toggle={toggle}
                activeKey={activeKey} onSelectChannel={onSelectChannel}
              />
            ))}
          </div>
        )}

        {!loading && !error && Object.entries(grouped).map(([dateKey, events]) => {
          const isToday = events.some(e => isBDToday(e.date));
          return (
            <div key={dateKey}>
              {/* Date header */}
              <div style={{
                padding: '8px 14px',
                fontSize: '0.65rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1.5px',
                color: isToday ? 'var(--accent)' : 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {isToday && <span style={{ color: 'var(--live)', animation: 'blink 2s infinite' }}>●</span>}
                {toBDDate(events[0].date)}
                {isToday && <span style={{ marginLeft: 'auto', color: 'var(--live)', fontWeight: 700 }}>TODAY</span>}
              </div>

              {events.map(event => {
                const status  = getStatus(event);
                const teams   = getTeams(event);
                const clock   = getClock(event);
                const isOpen  = openId === event.id;
                const chIds   = findStaticChannels(teams);

                return (
                  <div key={event.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Match row */}
                    <button
                      onClick={() => toggle(event.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '10px 14px',
                        background: isOpen ? 'var(--surface2)' : 'none',
                        border: 'none', cursor: 'pointer',
                        textAlign: 'left', color: 'var(--text)',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Status badge */}
                      {status === 'live' ? (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px',
                          background: 'var(--live)', color: '#fff', borderRadius: 4,
                          letterSpacing: '0.5px', animation: 'blink 1.5s infinite',
                          flexShrink: 0,
                        }}>
                          LIVE {clock && `${clock}`}
                        </span>
                      ) : status === 'finished' ? (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px',
                          background: 'var(--surface3)', color: 'var(--muted)',
                          borderRadius: 4, flexShrink: 0,
                        }}>FT</span>
                      ) : (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          color: 'var(--live)',
                          background: 'rgba(239,68,68,0.1)',
                          padding: '2px 6px', borderRadius: 4,
                          flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                        }}>
                          {toBDTime(event.date)}
                        </span>
                      )}

                      {/* Teams + score */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {status !== 'upcoming' && teams.homeScore !== null ? (
                          /* Live / Finished: show score between teams */
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <span>{teams.home}</span>
                            <span style={{
                              background: status === 'live' ? 'var(--live)' : 'var(--surface3)',
                              color: '#fff', padding: '1px 7px', borderRadius: 4,
                              fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              {teams.homeScore} – {teams.awayScore}
                            </span>
                            <span>{teams.away}</span>
                          </div>
                        ) : (
                          /* Upcoming: home vs away */
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>
                            <span>{teams.home}</span>
                            <span style={{ color: 'var(--muted)', margin: '0 5px', fontWeight: 400 }}>vs</span>
                            <span>{teams.away}</span>
                          </div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 2 }}>
                          {chIds.length > 0 ? `${chIds.length} channels available` : 'Channels TBA'}
                        </div>
                      </div>

                      <span style={{
                        color: 'var(--muted)', fontSize: '0.65rem',
                        transform: isOpen ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s', flexShrink: 0,
                      }}>▶</span>
                    </button>

                    {/* Channel list */}
                    {isOpen && (
                      <div style={{ background: 'var(--bg)', paddingBottom: 4 }}>
                        {chIds.length === 0 ? (
                          <div style={{ padding: '8px 20px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                            No channels available — paste schedule HTML to add
                          </div>
                        ) : (
                          <>
                            <div style={{
                              padding: '5px 14px 3px',
                              fontSize: '0.6rem', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '1.4px', color: 'var(--muted)',
                            }}>
                              {chIds.length} Channels
                            </div>
                            {chIds.map(id => {
                              const ch = channelDefs[id];
                              if (!ch) return null;
                              const key = `${event.id}-${id}`;
                              const isActive = activeKey === key;
                              return (
                                <button key={id}
                                  onClick={() => onSelectChannel({
                                    matchId: event.id, channelId: id,
                                    name: ch.name, flag: ch.flag,
                                    url: getChannelUrl(id),
                                    matchTeams: `${teams.home} vs ${teams.away}`,
                                  })}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    width: '100%', padding: '7px 14px 7px 20px',
                                    background: isActive ? 'var(--surface2)' : 'none',
                                    border: 'none',
                                    borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                                    color: isActive ? 'var(--accent)' : 'var(--text)',
                                    cursor: 'pointer', textAlign: 'left',
                                    fontSize: '0.8rem', transition: 'all 0.12s',
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{ch.flag}</span>
                                  <span style={{
                                    flex: 1, fontWeight: isActive ? 600 : 400,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                  }}>{ch.name}</span>
                                  {isActive && (
                                    <span style={{
                                      width: 7, height: 7, borderRadius: '50%',
                                      background: '#22c55e', flexShrink: 0,
                                      animation: 'sonar 1.5s infinite',
                                    }} />
                                  )}
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes sonar {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
          70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:.4; }
        }
      `}</style>
    </aside>
  );
}

// Fallback static card (used when API fails)
function StaticMatchCard({ match, openId, toggle, activeKey, onSelectChannel }) {
  const isOpen = openId === match.id;
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => toggle(match.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 14px',
          background: isOpen ? 'var(--surface2)' : 'none',
          border: 'none', cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit',
        }}
      >
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: 'var(--live)',
          background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4,
        }}>{match.time}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{match.teams}</span>
        <span style={{ color: 'var(--muted)', fontSize: '0.65rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
      </button>
      {isOpen && (
        <div style={{ background: 'var(--bg)', paddingBottom: 4 }}>
          {match.channelIds.map(id => {
            const ch = channelDefs[id];
            if (!ch) return null;
            const key = `${match.id}-${id}`;
            const isActive = activeKey === key;
            return (
              <button key={id}
                onClick={() => onSelectChannel({
                  matchId: match.id, channelId: id,
                  name: ch.name, flag: ch.flag,
                  url: getChannelUrl(id),
                  matchTeams: match.teams,
                })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 14px 7px 20px',
                  background: isActive ? 'var(--surface2)' : 'none',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem',
                  fontFamily: 'inherit',
                }}
              >
                <span>{ch.flag}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
