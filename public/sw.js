const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'adnxs.com', 'adsrvr.org',
  'moatads.com', 'taboola.com', 'outbrain.com', 'popads.net', 'popcash.net',
  'propellerads.com', 'trafficjunky.com', 'juicyads.com', 'exoclick.com',
  'hilltopads.net', 'adsterra.com', 'clickadu.com', 'zeropark.com',
  'mgid.com', 'revcontent.com', 'adform.net', 'smartadserver.com',
  'openx.net', 'rubiconproject.com', 'pubmatic.com', 'criteo.com',
];

function isAd(url) {
  try {
    const host = new URL(url).hostname;
    return AD_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (e) => {
  if (isAd(e.request.url)) {
    e.respondWith(new Response('', { status: 204 }));
  }
});
