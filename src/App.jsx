import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';
import { useNetworkStats, fmtBytes, fmtSpeed } from './hooks/useNetworkStats.js';
import { useBreakpoint } from './hooks/useBreakpoint.js';

const LS_KEY = 'fifa2026_active_channel';

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const ch = JSON.parse(raw);
    if (!ch?.channelId || !ch?.url || !ch.url.includes('zonatvlive.xyz')) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return ch;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
}

export default function App() {
  const [active, setActiveState]   = useState(loadSaved);
  const [isStreaming, setStreaming] = useState(false);
  const { isMobile, isTablet }     = useBreakpoint();
  const activeKey = active ? `${active.matchId}-${active.channelId}` : null;

  const { netSpeed, netType, session, total, rateNow, resetTotal } =
    useNetworkStats(isStreaming);

  const setActive = useCallback((ch) => {
    setActiveState(ch);
    if (ch) localStorage.setItem(LS_KEY, JSON.stringify(ch));
    else    localStorage.removeItem(LS_KEY);
  }, []);

  const sidebarW = isMobile ? '100%' : isTablet ? 240 : 290;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 16px',
        height: 50, gap: 10, flexShrink: 0,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: isMobile ? '0.95rem' : '1.05rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.2rem' }}>⚽</span>
          <span>FIFA <span style={{ color: 'var(--accent)' }}>2026</span></span>
        </div>

        {/* Now playing (hide on mobile) */}
        {!isMobile && active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isTablet ? 140 : 220 }}>
              {active.matchTeams}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, background: 'rgba(99,102,241,0.12)', padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {active.flag} {active.name}
            </span>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Stats pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Network — hide on mobile */}
          {!isMobile && netType && (
            <Pill color="var(--surface3)" border="var(--border)">
              <span>{netType === '4g' ? '📶' : '🛜'}</span>
              <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.65rem' }}>{netType.toUpperCase()}</span>
              {netSpeed != null && <Num width="4.5ch">{netSpeed >= 1 ? `${netSpeed.toFixed(0)}Mbps` : `${(netSpeed*1000).toFixed(0)}Kbps`}</Num>}
            </Pill>
          )}

          {/* Stream rate */}
          {isStreaming && (
            <Pill color="rgba(99,102,241,0.1)" border="rgba(99,102,241,0.25)">
              <span style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>↓</span>
              <Num width={isMobile ? '5ch' : '6.5ch'} color="var(--accent)">{fmtSpeed(rateNow)}</Num>
            </Pill>
          )}

          {/* Session — hide on mobile */}
          {!isMobile && (
            <Pill color="var(--surface3)" border="var(--border)">
              <span style={{ color: 'var(--muted)', fontWeight: 400 }}>Ses.</span>
              <Num width="5.5ch">{fmtBytes(session)}</Num>
            </Pill>
          )}

          {/* Total */}
          <Pill color="var(--surface3)" border="var(--border)">
            {!isMobile && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>Total</span>}
            <Num width="5.5ch">{fmtBytes(total)}</Num>
            <button onClick={resetTotal} title="Reset" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.6rem', padding: '0 1px', lineHeight: 1 }}>✕</button>
          </Pill>

          {/* LIVE badge */}
          <div style={{ background: 'var(--live)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', padding: '3px 7px', borderRadius: 4, animation: 'blink 2s infinite', flexShrink: 0 }}>
            LIVE
          </div>
        </div>
      </header>

      {/* Mobile: now playing bar */}
      {isMobile && active && (
        <div style={{ padding: '6px 12px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{active.matchTeams}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{active.flag} {active.name}</span>
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* On mobile: player first, sidebar below */}
        {isMobile ? (
          <>
            <Player channel={active} onPlayingChange={setStreaming} isMobile={true} />
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <Sidebar activeKey={activeKey} onSelectChannel={setActive} isMobile={true} />
            </div>
          </>
        ) : (
          <>
            <Sidebar activeKey={activeKey} onSelectChannel={setActive} sidebarWidth={sidebarW} />
            <Player channel={active} onPlayingChange={setStreaming} />
          </>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}

function Pill({ color, border, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: color, border: `1px solid ${border}`, borderRadius: 20, padding: '3px 9px', fontSize: '0.72rem' }}>
      {children}
    </div>
  );
}

function Num({ width, color = 'var(--text)', children }) {
  return (
    <span style={{ display: 'inline-block', minWidth: width, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"', letterSpacing: '-0.2px', color }}>
      {children}
    </span>
  );
}
