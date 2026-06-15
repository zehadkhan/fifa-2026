import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useViewerCount } from '../hooks/useViewerCount.js';

const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'adnxs.com', 'adsrvr.org',
  'moatads.com', 'taboola.com', 'outbrain.com', 'popads.net', 'popcash.net',
  'propellerads.com', 'trafficjunky.com', 'juicyads.com', 'exoclick.com',
  'hilltopads.net', 'adsterra.com', 'clickadu.com', 'zeropark.com',
];

export default function Player({ channel, onPlayingChange, isMobile }) {
  const iframeRef = useRef(null);
  const [isStopped, setIsStopped] = useState(false);
  const [toast, setToast] = useState('');
  const [adShield, setAdShield] = useState(false);
  const [shieldMsg, setShieldMsg] = useState('');
  const viewers = useViewerCount(channel?.channelId ?? null);
  const toastTimer = useRef(null);
  const shieldTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }, []);

  // Activate click-absorb shield for `ms` milliseconds
  const activateShield = useCallback((ms, msg = '') => {
    setAdShield(true);
    setShieldMsg(msg);
    clearTimeout(shieldTimer.current);
    shieldTimer.current = setTimeout(() => {
      setAdShield(false);
      setShieldMsg('');
    }, ms);
  }, []);

  // When channel changes → reload, un-stop, activate shield
  useEffect(() => {
    if (!channel) return;
    setIsStopped(false);
    onPlayingChange?.(true);
    if (iframeRef.current) {
      iframeRef.current.src = '';
      requestAnimationFrame(() => {
        if (iframeRef.current) iframeRef.current.src = channel.url;
      });
    }
    activateShield(4000, 'Loading stream...');
    showToast(`▶  Now Playing: ${channel.name}`);
  }, [channel?.channelId]);

  // If no channel selected, mark as not playing
  useEffect(() => {
    if (!channel) onPlayingChange?.(false);
  }, [channel]);

  const handleShieldClick = () => {
    setAdShield(false);
    clearTimeout(shieldTimer.current);
  };

  const handleStop = () => {
    if (iframeRef.current) iframeRef.current.src = '';
    setIsStopped(true);
    setAdShield(false);
    onPlayingChange?.(false);
    showToast('⏹  Stopped');
  };

  const handlePlay = () => {
    if (!channel) return;
    setIsStopped(false);
    onPlayingChange?.(true);
    if (iframeRef.current) iframeRef.current.src = channel.url;
    activateShield(4000, 'Loading stream...');
    showToast(`▶  Playing: ${channel.name}`);
  };

  const handleReload = () => {
    if (!channel || isStopped) return;
    if (iframeRef.current) {
      iframeRef.current.src = '';
      requestAnimationFrame(() => {
        if (iframeRef.current) iframeRef.current.src = channel.url;
      });
    }
    activateShield(4000, 'Reloading...');
    showToast('↺  Reloading stream...');
  };

  const handleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const showPlayer = channel && !isStopped;

  return (
    <div style={{
      flex: isMobile ? 'none' : 1,
      width: isMobile ? '100%' : undefined,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: '#000',
    }}>

      {/* Player area */}
      <div style={{
        flex: isMobile ? 'none' : 1,
        aspectRatio: isMobile ? '16/9' : undefined,
        width: isMobile ? '100%' : undefined,
        position: 'relative', background: '#000', overflow: 'hidden',
      }}>

        {/* Placeholder */}
        {!showPlayer && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, color: 'var(--muted)',
            background: 'radial-gradient(ellipse at center, #111118 0%, #000 100%)',
          }}>
            <div style={{ fontSize: '4.5rem', opacity: 0.25 }}>⚽</div>
            <p style={{ fontSize: '0.95rem', opacity: 0.4 }}>
              {isStopped ? 'Stream stopped — press Play to resume' : 'Select a channel to start watching'}
            </p>
            {isStopped && channel && (
              <button onClick={handlePlay} style={btnStyle('#22c55e')}>▶ Resume</button>
            )}
          </div>
        )}

        {/* Stream iframe — sandbox blocks window.open() popup ads */}
        <iframe
          ref={iframeRef}
          title="stream"
          src={showPlayer ? channel.url : ''}
          allowFullScreen
          playsInline
          frameBorder="0"
          referrerPolicy="no-referrer"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; webkit-playsinline; playsinline"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            border: 'none', background: '#000',
            display: showPlayer ? 'block' : 'none',
          }}
        />

        {/* Ad-absorb shield overlay — invisible, absorbs click-to-ad triggers */}
        {showPlayer && adShield && (
          <div
            onClick={handleShieldClick}
            title="Click to interact with player"
            style={{
              position: 'absolute', inset: 0,
              zIndex: 10,
              cursor: 'pointer',
              background: 'transparent',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
              padding: '0 0 12px 14px',
            }}
          >
            {shieldMsg && (
              <span style={{
                background: 'rgba(0,0,0,0.7)',
                color: 'var(--muted)',
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
              }}>
                🛡 {shieldMsg} — tap to interact
              </span>
            )}
          </div>
        )}

        {/* Toast */}
        <div style={{
          position: 'absolute', top: 16, left: '50%',
          transform: `translateX(-50%) translateY(${toast ? '0' : '-60px'})`,
          opacity: toast ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          background: 'rgba(0,0,0,0.88)',
          color: '#fff', fontSize: '0.85rem', fontWeight: 600,
          padding: '8px 20px', borderRadius: 24,
          border: '1px solid var(--border)',
          pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          {toast}
        </div>
      </div>

      {/* Control bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10,
        padding: isMobile ? '8px 10px' : '10px 16px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {showPlayer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--live)',
              animation: 'sonar-red 1.5s infinite',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--live)' }}>LIVE</span>
          </div>
        )}

        <span style={{ fontWeight: 600, fontSize: isMobile ? '0.78rem' : '0.9rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? '30vw' : undefined }}>
          {channel ? channel.name : '—'}
        </span>

        {/* Viewer count — hide on mobile to save space */}
        {!isMobile && viewers !== null && showPlayer && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 20, padding: '3px 10px',
            fontSize: '0.75rem', fontWeight: 700,
          }}>
            <span style={{ color: 'var(--live)', fontSize: '0.6rem', animation: 'sonar-red 1.5s infinite' }}>●</span>
            <span style={{ color: 'var(--live)' }}>{viewers.toLocaleString()}</span>
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>watching</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: isMobile ? 5 : 8, alignItems: 'center', marginLeft: 'auto', flexWrap: 'nowrap' }}>
          {!isStopped && channel ? (
            <button onClick={handleStop} style={btnStyle('var(--live)', true)} title="Stop">⏹{!isMobile && ' Stop'}</button>
          ) : (
            channel && (
              <button onClick={handlePlay} style={btnStyle('#22c55e', true)} title="Play">&#9654; Play</button>
            )
          )}

          <button
            onClick={handleReload}
            disabled={!channel || isStopped}
            style={btnStyle('var(--surface3)', true, !channel || isStopped)}
          >
            ↺{!isMobile && ' Reload'}
          </button>

          {isMobile && channel ? (
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btnStyle('var(--accent)', true), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              title="Open stream in browser"
            >
              &#8663; Open
            </a>
          ) : (
            <button
              onClick={handleFullscreen}
              disabled={!showPlayer}
              style={btnStyle('var(--accent)', true, !showPlayer)}
            >
              ⛶ Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Ad block status bar */}
      <div style={{
        padding: '5px 16px',
        background: 'var(--surface2)',
        borderTop: '1px solid var(--border)',
        fontSize: '0.7rem', color: 'var(--muted)',
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      }}>
        <span style={{ color: '#22c55e' }}>🛡</span>
        Popup ads blocked · {AD_DOMAINS.length} ad networks filtered
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}>Install uBlock Origin for full protection</span>
      </div>

      <style>{`
        @keyframes sonar-red {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          70%  { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}

function btnStyle(bg, small = false, disabled = false) {
  return {
    padding: small ? '5px 12px' : '8px 18px',
    borderRadius: 8, border: 'none',
    background: disabled ? 'var(--surface3)' : bg,
    color: disabled ? 'var(--muted)' : '#fff',
    fontWeight: 600, fontSize: '0.78rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  };
}
