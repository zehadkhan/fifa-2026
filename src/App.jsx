import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';
import { useNetworkStats, fmtBytes, fmtSpeed } from './hooks/useNetworkStats.js';

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
  const activeKey = active ? `${active.matchId}-${active.channelId}` : null;

  const { netSpeed, netType, session, total, rateNow, resetTotal } =
    useNetworkStats(isStreaming);

  const setActive = useCallback((ch) => {
    setActiveState(ch);
    if (ch) localStorage.setItem(LS_KEY, JSON.stringify(ch));
    else    localStorage.removeItem(LS_KEY);
  }, []);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: '0 16px', height: 54, gap: 12,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px', flexShrink: 0 }}>
          <span style={{ fontSize: '1.3rem' }}>⚽</span>
          <span>FIFA <span style={{ color: 'var(--accent)' }}>2026</span></span>
        </div>

        {/* Now playing */}
        {active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {active.matchTeams}
            </span>
            <span style={{
              fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600,
              background: 'rgba(99,102,241,0.12)', padding: '2px 8px',
              borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {active.flag} {active.name}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── Bandwidth stats ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Network type + speed */}
          {netType && (
            <Pill color="var(--surface3)" border="var(--border)">
              <span style={{ fontSize: '0.65rem' }}>
                {netType === '4g' ? '📶' : netType === 'wifi' ? '🛜' : '📡'}
              </span>
              <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{netType.toUpperCase()}</span>
              {netSpeed != null && (
                <Num width="4.5ch">
                  {netSpeed >= 1 ? `${netSpeed.toFixed(0)} Mbps` : `${(netSpeed * 1000).toFixed(0)} Kbps`}
                </Num>
              )}
            </Pill>
          )}

          {/* Current stream rate — fluctuates */}
          {isStreaming && (
            <Pill color="rgba(99,102,241,0.1)" border="rgba(99,102,241,0.25)">
              <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>↓</span>
              <Num width="6.5ch" color="var(--accent)">{fmtSpeed(rateNow)}</Num>
            </Pill>
          )}

          {/* Session */}
          <Pill color="var(--surface3)" border="var(--border)">
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>Session</span>
            <Num width="6ch">{fmtBytes(session)}</Num>
          </Pill>

          {/* Total (with reset) */}
          <Pill color="var(--surface3)" border="var(--border)">
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>Total</span>
            <Num width="6ch">{fmtBytes(total)}</Num>
            <button
              onClick={resetTotal}
              title="Reset total"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '0.65rem', padding: '0 1px',
                lineHeight: 1, marginLeft: 2,
              }}
            >✕</button>
          </Pill>

          {/* LIVE badge */}
          <div style={{
            background: 'var(--live)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '1.5px',
            padding: '3px 8px', borderRadius: 4, animation: 'blink 2s infinite',
            flexShrink: 0,
          }}>LIVE</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeKey={activeKey} onSelectChannel={setActive} />
        <Player channel={active} onPlayingChange={setStreaming} />
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}

function Pill({ color, border, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: color, border: `1px solid ${border}`,
      borderRadius: 20, padding: '3px 10px',
      fontSize: '0.72rem',
    }}>
      {children}
    </div>
  );
}

// Fixed-width number span — prevents layout shift when digits change
function Num({ width, color = 'var(--text)', children }) {
  return (
    <span style={{
      display: 'inline-block',
      minWidth: width,
      textAlign: 'right',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      fontFeatureSettings: '"tnum"',
      letterSpacing: '-0.2px',
      color,
    }}>
      {children}
    </span>
  );
}
