export interface CategoryMeta { key: string; label: string; emoji: string; }

export const CATEGORIES: CategoryMeta[] = [
  { key: "kidnaping", label: "Kidnaping", emoji: "🚨" },
  { key: "kout_zam", label: "Kout zam", emoji: "🔫" },
  { key: "gang_ame", label: "Gang ame", emoji: "⚠️" },
  { key: "vòl", label: "Vòl", emoji: "🧤" },
  { key: "vyolans", label: "Vyolans", emoji: "✊" },
  { key: "zak_sispèk", label: "Zak sispèk", emoji: "👀" },
  { key: "dife", label: "Dife", emoji: "🔥" },
  { key: "aksidan", label: "Aksidan", emoji: "🚗" },
  { key: "ijans_medikal", label: "Ijans medikal", emoji: "🩺" },
  { key: "inondasyon", label: "Inondasyon", emoji: "🌊" },
  { key: "glisman_tè", label: "Glisman tè", emoji: "⛰️" },
  { key: "tranblemanntè", label: "Tranblemanntè", emoji: "🏚️" },
  { key: "pann_kouran", label: "Pann kouran", emoji: "💡" },
  { key: "fwit_gaz", label: "Fwit gaz", emoji: "🛢️" },
  { key: "wout_bloke", label: "Wout bloke", emoji: "🚧" },
  { key: "moun_disparèt", label: "Moun disparèt", emoji: "🔍" },
  { key: "timoun_disparèt", label: "Timoun disparèt", emoji: "🧒" },
  { key: "lòt", label: "Lòt ijans", emoji: "❗" },
];

export function categoryMeta(key: string): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? { key, label: key, emoji: "❗" };
}

export function severityColor(niveau: string) {
  if (niveau === "grav") return "var(--urgent)";
  if (niveau === "ba") return "var(--calm)";
  return "var(--amber)";
}

export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "kounye a";
  if (min < 60) return `${min} min pase`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h pase`;
  const day = Math.floor(hr / 24);
  return `${day}j pase`;
}

// Distans ant 2 pwen GPS an kilomèt (fòmil Haversine) — itilize pou detèmine
// otomatikman si yon rapò "toupre" itilizatè a (san nou pa bezwen konnen non
// komin/depatman ni mande yo chwazi anyen manyèlman).
export function distansKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Sèy yo (an km) ki apwoksime gwosè yon komin vs yon depatman, san nou pa
// bezwen okenn kat non zòn — jis distans reyèl ant 2 pwen.
export const RAYON_IJANS_KM = 15;
export const RAYON_ENFÒMASYON_KM = 80;

export type NivoPètinans = "ijans" | "enfòmasyon" | "lwen";

export function nivoPètinans(distKm: number | null): NivoPètinans {
  if (distKm === null) return "enfòmasyon";
  if (distKm <= RAYON_IJANS_KM) return "ijans";
  if (distKm <= RAYON_ENFÒMASYON_KM) return "enfòmasyon";
  return "lwen";
}
