function streamUrl(n) {
  if (n > 1500) {
    const mod = parseInt(String(n).substring(2)).toString();
    return `https://zonatvlive.xyz/nplayer/sTLv/${mod}`;
  }
  return `https://zonatvlive.xyz/nplayer/sTLv/${n}`;
}

export const channels = [
  { id: 39, name: "Channel 39", category: "Live", logo: "⚽", url: streamUrl(39) },
  { id: 54, name: "Channel 54", category: "Live", logo: "🏆", url: streamUrl(54) },
];
