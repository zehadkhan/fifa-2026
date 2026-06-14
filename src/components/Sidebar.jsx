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

function findStaticChannels(teams) {
  const h = teams.home.toLowerCase();
  const a = teams.away.toLowerCase();
  const found = staticMatches.find(m => {
    const t = m.teams.toLowerCase();
    return t.includes(h) || t.includes(a);
  });
  return found?.channelIds ?? staticMatches[0]?.channelIds ?? [];
}

export default function Sidebar({ activeKey, onSelectChannel, isMobile = false, sidebarWidth = 290 }) {
  const [matches, setMatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [openId, setOpenId]       = useState(null);
  const [countdown, setCountdown] = useState('');
  const countdownRef = useRef(null);
  const now = useClock();

  const bdTimeStr = now.toLocaleTimeString('en-US', { timeZone: BD_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const bdDateStr = now.toLocaleDateString('en-US', { timeZone: BD_TZ, weekday: 'short', month: 'short', day: 'numeric' });

  useEffect(() => {
    fetchMatches(10)
      .then(data => {
        setMatches(data);
        const first = data.find(e => getStatus(e) !== 'finished');
        if (first) setOpenId(first.id);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const next = matches.find(e => getStatus(e) === 'upcoming');
    if (!next) { setCountdown(''); return; }
    const update = () => setCountdown(fmtCountdown(msUntil(next.date)));
    update();
    countdownRef.current = setInterval(update, 1000);
    return () => clearInterval(countdownRef.current);
  }, [matches]);

  const grouped = {};
  matches.forEach(e => {
    const key = toBDDateKey(e.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const toggle = id => setOpenId(prev => prev === id ? null : id);

  // ── Mobile layout: compact horizontal tabs + channel grid ──
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', overflow: 'hidden' }}>

        {/* BD clock strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🇧🇩</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{bdTimeStr}</span>
          </div>
          {countdown && (
            <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600 }}>⏱ Next: {countdown}</span>
          )}
        </div>

        {/* Horizontal match tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', flexShrink: 0, scrollbarWidth: 'none' }}>
          {loading && <div style={{ padding: '8px 14px', color: 'var(--muted)', fontSize: '0.78rem' }}>Loading...</div>}
          {Object.values(grouped).flat().map(event => {
            const status = getStatus(event);
            const teams  = getTeams(event);
            const isOpen = openId === event.id;
            return (
              <button key={event.id} onClick={() => toggle(event.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '8px 12px', flexShrink: 0,
                background: isOpen ? 'var(--surface2)' : 'none',
                border: 'none', borderBottom: `2px solid ${isOpen ? 'var(--accent)' : 'transparent'}`,
                cursor: 'pointer', color: isOpen ? 'var(--accent)' : 'var(--text)',
                fontFamily: 'inherit',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--live)', animation: 'blink 1.5s infinite', display: 'inline-block' }} />}
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: status === 'live' ? 'var(--live)' : 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {status === 'live' ? 'LIVE' : status === 'finished' ? 'FT' : toBDTime(event.date)}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {teams.home} vs {teams.away}
                </span>
              </button>
            );
          })}
        </div>

        {/* Channel grid for selected match */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.values(grouped).flat().map(event => {
            if (openId !== event.id) return null;
            const teams  = getTeams(event);
            const chIds  = findStaticChannels(teams);
            const status = getStatus(event);
            const score  = status !== 'upcoming' && getTeams(event).homeScore !== null;
            return (
              <div key={event.id}>
                {/* Score bar */}
                {score && (
                  <div style={{ padding: '6px 12px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
                    {teams.home} <span style={{ color: 'var(--accent)', margin: '0 6px' }}>{teams.homeScore} – {teams.awayScore}</span> {teams.away}
                  </div>
                )}
                {chIds.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--muted)', fontSize: '0.8rem', textAlign: 'center' }}>No channels available</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, padding: 1, background: 'var(--border)' }}>
                    {chIds.map(id => {
                      const ch = channelDefs[id];
                      if (!ch) return null;
                      const key = `${event.id}-${id}`;
                      const isActive = activeKey === key;
                      return (
                        <button key={id} onClick={() => onSelectChannel({ matchId: event.id, channelId: id, name: ch.name, flag: ch.flag, url: getChannelUrl(id), matchTeams: `${teams.home} vs ${teams.away}` })}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: isActive ? 'var(--surface2)' : 'var(--surface)', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ch.flag}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ch.name}</span>
                          {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'sonar 1.5s infinite' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Desktop / Tablet layout ──
  return (
    <aside style={{ width: sidebarWidth, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* BD Clock */}
      <div style={{ padding: '11px 14px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>🇧🇩</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{bdTimeStr}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 1 }}>{bdDateStr} · BST (UTC+6)</div>
          </div>
        </div>
        {countdown && (
          <div style={{ marginTop: 7, padding: '4px 9px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, fontSize: '0.7rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>⏱</span><span>Next match in <strong>{countdown}</strong></span>
          </div>
        )}
      </div>

      {/* Match list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading fixtures...</div>}

        {error && (
          <div style={{ padding: 10 }}>
            <div style={{ color: 'var(--live)', fontSize: '0.72rem', marginBottom: 6 }}>⚠ Live fixtures unavailable</div>
            {staticMatches.map(m => <StaticCard key={m.id} match={m} openId={openId} toggle={toggle} activeKey={activeKey} onSelectChannel={onSelectChannel} />)}
          </div>
        )}

        {!loading && !error && Object.entries(grouped).map(([dateKey, events]) => {
          const isToday = events.some(e => isBDToday(e.date));
          return (
            <div key={dateKey}>
              <div style={{ padding: '7px 14px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: isToday ? 'var(--accent)' : 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 5 }}>
                {isToday && <span style={{ color: 'var(--live)', animation: 'blink 2s infinite' }}>●</span>}
                {toBDDate(events[0].date)}
                {isToday && <span style={{ marginLeft: 'auto', color: 'var(--live)', fontWeight: 700 }}>TODAY</span>}
              </div>

              {events.map(event => {
                const status = getStatus(event);
                const teams  = getTeams(event);
                const clock  = getClock(event);
                const isOpen = openId === event.id;
                const chIds  = findStaticChannels(teams);

                return (
                  <div key={event.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => toggle(event.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: isOpen ? 'var(--surface2)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', fontFamily: 'inherit', transition: 'background 0.15s' }}>
                      {status === 'live' ? (
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 5px', background: 'var(--live)', color: '#fff', borderRadius: 4, letterSpacing: '0.5px', animation: 'blink 1.5s infinite', flexShrink: 0 }}>LIVE {clock}</span>
                      ) : status === 'finished' ? (
                        <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 5px', background: 'var(--surface3)', color: 'var(--muted)', borderRadius: 4, flexShrink: 0 }}>FT</span>
                      ) : (
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--live)', background: 'rgba(239,68,68,0.1)', padding: '2px 5px', borderRadius: 4, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{toBDTime(event.date)}</span>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {status !== 'upcoming' && teams.homeScore !== null ? (
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <span>{teams.home}</span>
                            <span style={{ background: status === 'live' ? 'var(--live)' : 'var(--surface3)', color: '#fff', padding: '1px 6px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{teams.homeScore} – {teams.awayScore}</span>
                            <span>{teams.away}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                            {teams.home} <span style={{ color: 'var(--muted)', fontWeight: 400, margin: '0 3px' }}>vs</span> {teams.away}
                          </div>
                        )}
                        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 2 }}>
                          {chIds.length > 0 ? `${chIds.length} channels` : 'Channels TBA'}
                        </div>
                      </div>
                      <span style={{ color: 'var(--muted)', fontSize: '0.6rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▶</span>
                    </button>

                    {isOpen && (
                      <div style={{ background: 'var(--bg)', paddingBottom: 4 }}>
                        {chIds.length === 0 ? (
                          <div style={{ padding: '8px 20px', fontSize: '0.75rem', color: 'var(--muted)' }}>No channels — paste schedule HTML to add</div>
                        ) : (
                          <>
                            <div style={{ padding: '5px 14px 3px', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.4px', color: 'var(--muted)' }}>{chIds.length} Channels</div>
                            {chIds.map(id => {
                              const ch = channelDefs[id];
                              if (!ch) return null;
                              const key = `${event.id}-${id}`;
                              const isActive = activeKey === key;
                              return (
                                <button key={id} onClick={() => onSelectChannel({ matchId: event.id, channelId: id, name: ch.name, flag: ch.flag, url: getChannelUrl(id), matchTeams: `${teams.home} vs ${teams.away}` })}
                                  style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '7px 14px 7px 20px', background: isActive ? 'var(--surface2)' : 'none', border: 'none', borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`, color: isActive ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem', fontFamily: 'inherit', transition: 'all 0.12s' }}>
                                  <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{ch.flag}</span>
                                  <span style={{ flex: 1, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</span>
                                  {isActive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'sonar 1.5s infinite' }} />}
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
        @keyframes sonar { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)} 70%{box-shadow:0 0 0 7px rgba(34,197,94,0)} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </aside>
  );
}

function StaticCard({ match, openId, toggle, activeKey, onSelectChannel }) {
  const isOpen = openId === match.id;
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => toggle(match.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: isOpen ? 'var(--surface2)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--live)', background: 'rgba(239,68,68,0.1)', padding: '2px 5px', borderRadius: 4 }}>{match.time}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>{match.teams}</span>
        <span style={{ color: 'var(--muted)', fontSize: '0.6rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
      </button>
      {isOpen && match.channelIds.map(id => {
        const ch = channelDefs[id];
        if (!ch) return null;
        const key = `${match.id}-${id}`;
        const isActive = activeKey === key;
        return (
          <button key={id} onClick={() => onSelectChannel({ matchId: match.id, channelId: id, name: ch.name, flag: ch.flag, url: getChannelUrl(id), matchTeams: match.teams })}
            style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '7px 14px 7px 20px', background: isActive ? 'var(--surface2)' : 'none', border: 'none', borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`, color: isActive ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem', fontFamily: 'inherit' }}>
            <span>{ch.flag}</span>
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</span>
          </button>
        );
      })}
    </div>
  );
}
