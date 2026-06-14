const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';

export async function fetchMatches(days = 7) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(fmtDate(d));
  }
  const from = dates[0];
  const to   = dates[dates.length - 1];
  const res  = await fetch(`${ESPN}/scoreboard?dates=${from}-${to}&limit=50`);
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const json = await res.json();
  return json.events || [];
}

function fmtDate(d) {
  return d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
}

// BD time helpers (Asia/Dhaka = UTC+6)
export const BD_TZ = 'Asia/Dhaka';

export function toBDTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: BD_TZ, hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function toBDDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: BD_TZ, weekday: 'short', month: 'short', day: 'numeric',
  });
}

export function toBDDateKey(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: BD_TZ }); // YYYY-MM-DD
}

export function isBDToday(iso) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: BD_TZ });
  return toBDDateKey(iso) === today;
}

export function getStatus(event) {
  const s = event?.status?.type?.name;
  if (s === 'STATUS_IN_PROGRESS' || s === 'STATUS_HALFTIME') return 'live';
  if (s === 'STATUS_FINAL' || s === 'STATUS_FULL_TIME') return 'finished';
  return 'upcoming';
}

export function getTeams(event) {
  const comp = event?.competitions?.[0];
  const home = comp?.competitors?.find(c => c.homeAway === 'home');
  const away = comp?.competitors?.find(c => c.homeAway === 'away');
  return {
    home: home?.team?.shortDisplayName || home?.team?.name || '?',
    away: away?.team?.shortDisplayName || away?.team?.name || '?',
    homeFlag: home?.team?.flag || '',
    awayFlag: away?.team?.flag || '',
    homeLogo: home?.team?.logo || '',
    awayLogo: away?.team?.logo || '',
    homeScore: home?.score ?? null,
    awayScore: away?.score ?? null,
  };
}

export function getClock(event) {
  return event?.status?.displayClock || '';
}

export function msUntil(iso) {
  return new Date(iso) - Date.now();
}

export function fmtCountdown(ms) {
  if (ms <= 0) return 'Starting...';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 24) {
    const days = Math.floor(h / 24);
    return `${days}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
