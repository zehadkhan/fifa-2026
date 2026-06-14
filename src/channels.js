function streamUrl(n) {
  if (n > 1500) {
    const mod = parseInt(String(n).substring(2)).toString();
    return `https://zonatvlive.xyz/nplayer/sTLv/${mod}`;
  }
  return `https://zonatvlive.xyz/nplayer/sTLv/${n}`;
}

export const channelDefs = {
  39:   { name: "Fox Sports 1 USA",         flag: "🇺🇸" },
  49:   { name: "Sport TV1 Portugal",        flag: "🇵🇹" },
  54:   { name: "FOX USA",                  flag: "🇺🇸" },
  78:   { name: "SporTV BR",                flag: "🇧🇷" },
  111:  { name: "TSN1",                     flag: "🇨🇦" },
  113:  { name: "TSN3",                     flag: "🇨🇦" },
  114:  { name: "TSN4",                     flag: "🇨🇦" },
  116:  { name: "beIN Sports 1 France",     flag: "🇫🇷" },
  127:  { name: "Match TV Russia",          flag: "🇷🇺" },
  128:  { name: "TVP Sport Poland",         flag: "🇵🇱" },
  131:  { name: "Telemundo",                flag: "🇺🇸" },
  134:  { name: "Arena 1 Premium Serbia",   flag: "🇷🇸" },
  136:  { name: "Match! Football 1 Russia", flag: "🇷🇺" },
  140:  { name: "Sport 1 Israel",           flag: "🇮🇱" },
  141:  { name: "Sport 2 Israel",           flag: "🇮🇱" },
  142:  { name: "Sport 3 Israel",           flag: "🇮🇱" },
  143:  { name: "Sport 4 Israel",           flag: "🇮🇱" },
  203:  { name: "NRK 1 Norway",             flag: "🇳🇴" },
  204:  { name: "TV 2 Norway",              flag: "🇳🇴" },
  265:  { name: "M4 Sports Hungary",        flag: "🇭🇺" },
  270:  { name: "T Sports Bangladesh",      flag: "🇧🇩" },
  290:  { name: "Sport TV5 Portugal",       flag: "🇵🇹" },
  350:  { name: "ITV 1 UK",                flag: "🇬🇧" },
  355:  { name: "Channel 5 UK",            flag: "🇬🇧" },
  356:  { name: "BBC One UK",              flag: "🇬🇧" },
  359:  { name: "BBC Four UK",             flag: "🇬🇧" },
  365:  { name: "RTE 2 Ireland",           flag: "🇮🇪" },
  393:  { name: "Ziggo Sport 1 NL",        flag: "🇳🇱" },
  412:  { name: "Supersport Grandstand",   flag: "🇿🇦" },
  413:  { name: "SuperSport PSL",          flag: "🇿🇦" },
  470:  { name: "M6 France",               flag: "🇫🇷" },
  476:  { name: "BNT 1 Bulgaria",          flag: "🇧🇬" },
  478:  { name: "BNT 3 Bulgaria",          flag: "🇧🇬" },
  533:  { name: "TVE La 1 Spain",          flag: "🇪🇸" },
  561:  { name: "TVP2 Poland",             flag: "🇵🇱" },
  573:  { name: "Match Premier Russia",    flag: "🇷🇺" },
  579:  { name: "Arena Sport 1P",          flag: "🇷🇸" },
  602:  { name: "CTV Canada",              flag: "🇨🇦" },
  619:  { name: "DSports 1 Argentina",     flag: "🇦🇷" },
  621:  { name: "DSports+ Argentina",      flag: "🇦🇷" },
  719:  { name: "RTP 1 Portugal",          flag: "🇵🇹" },
  723:  { name: "TVI Portugal",            flag: "🇵🇹" },
  727:  { name: "ZDF DE",                  flag: "🇩🇪" },
  746:  { name: "TyC Sports Argentina",    flag: "🇦🇷" },
  774:  { name: "ERT 1 Greece",            flag: "🇬🇷" },
  801:  { name: "DR 1 DK",                flag: "🇩🇰" },
  802:  { name: "DR 2 DK",                flag: "🇩🇰" },
  817:  { name: "TV2 Denmark",             flag: "🇩🇰" },
  835:  { name: "Noovo CA",               flag: "🇨🇦" },
  839:  { name: "RDS CA",                 flag: "🇨🇦" },
  840:  { name: "RDS 2 CA",               flag: "🇨🇦" },
  844:  { name: "Azteca 7 Mexico",         flag: "🇲🇽" },
  845:  { name: "NBC Universo",            flag: "🇺🇸" },
  850:  { name: "RAI 1 IT",               flag: "🇮🇹" },
  889:  { name: "TRT Spor Turkey",         flag: "🇹🇷" },
  935:  { name: "TUDN Mexico",             flag: "🇲🇽" },
  936:  { name: "Canal5 MX",              flag: "🇲🇽" },
  966:  { name: "beIN Sports MAX 1",       flag: "🌍" },
  967:  { name: "beIN Sports MAX 2",       flag: "🌍" },
  968:  { name: "beIN Sports XTRA 3",      flag: "🌍" },
  969:  { name: "beIN Sports XTRA 4",      flag: "🌍" },
  1012: { name: "TRT 1 Turkey",            flag: "🇹🇷" },
  1033: { name: "ČT Sport CZ",             flag: "🇨🇿" },
};

const ALL_CH = [
  350,54,39,365,935,844,111,113,114,128,290,839,1012,889,533,727,49,
  966,967,719,968,969,723,561,850,393,470,1033,116,265,127,136,573,
  835,270,579,131,134,817,746,840,355,774,476,478,78,413,412,140,141,
  602,801,802,619,621,142,143,936,356,359,845,203,204,
];

// All times are Bangladesh Standard Time (BST, UTC+6)
export const matches = [
  {
    id: 1,
    teams: "🇩🇪 Germany vs 🇭🇷 Croatia",
    time: "04:00 AM",
    date: "Jun 15",
    channelIds: ALL_CH,
  },
  {
    id: 2,
    teams: "🇮🇹 Italy vs 🇺🇾 Uruguay",
    time: "06:00 AM",
    date: "Jun 15",
    channelIds: ALL_CH,
  },
  {
    id: 3,
    teams: "🇳🇱 Netherlands vs 🇨🇦 Canada",
    time: "06:00 AM",
    date: "Jun 15",
    channelIds: ALL_CH,
  },
  {
    id: 4,
    teams: "🇧🇪 Belgium vs 🇲🇽 Mexico",
    time: "08:00 AM",
    date: "Jun 15",
    channelIds: ALL_CH,
  },
];

export function getChannelUrl(id) {
  return streamUrl(id);
}
