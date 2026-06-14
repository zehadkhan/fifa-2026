import { useState, useEffect, useRef } from 'react';

// Base HD stream bitrate ~3 Mbps — fluctuates ±20% each second
const BASE_BPS = (3 * 1024 * 1024) / 8; // ~393 KB/s in bytes

const LS_KEY = 'fifa2026_total_bytes';

function loadTotal() {
  try { return parseFloat(localStorage.getItem(LS_KEY) || '0'); }
  catch { return 0; }
}
function saveTotal(b) {
  try { localStorage.setItem(LS_KEY, String(b)); } catch {}
}

// Fluctuate ±20% around base to simulate real stream variance
function nextRate() {
  const variance = 0.2;
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.round(BASE_PS * factor);
}
// expose base for initial render
const BASE_PS = BASE_BPS;

export function fmtBytes(bytes) {
  if (bytes < 1024)      return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return                        `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function fmtSpeed(bytes) {
  if (bytes < 1024)      return `${bytes.toFixed(0)} B/s`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB/s`;
  return                        `${(bytes / 1024 ** 2).toFixed(2)} MB/s`;
}

export function useNetworkStats(isPlaying) {
  const [netSpeed, setNetSpeed] = useState(null);
  const [netType,  setNetType]  = useState(null);
  const [session,  setSession]  = useState(0);
  const [total,    setTotal]    = useState(loadTotal);
  const [rateNow,  setRateNow]  = useState(BASE_PS);
  const totalRef = useRef(loadTotal());
  const tickRef  = useRef(null);

  // Network Info API
  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return;
    const update = () => {
      setNetSpeed(conn.downlink ?? null);
      setNetType(conn.effectiveType ?? null);
    };
    update();
    conn.addEventListener('change', update);
    return () => conn.removeEventListener('change', update);
  }, []);

  // Tick: update rate + accumulate bytes
  useEffect(() => {
    clearInterval(tickRef.current);
    if (!isPlaying) { setRateNow(0); return; }

    tickRef.current = setInterval(() => {
      const rate = nextRate();
      setRateNow(rate);
      totalRef.current += rate;
      saveTotal(totalRef.current);
      setTotal(totalRef.current);
      setSession(s => s + rate);
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [isPlaying]);

  return {
    netSpeed,
    netType,
    session,
    total,
    rateNow,
    resetTotal: () => {
      totalRef.current = 0;
      saveTotal(0);
      setTotal(0);
      setSession(0);
    },
  };
}
