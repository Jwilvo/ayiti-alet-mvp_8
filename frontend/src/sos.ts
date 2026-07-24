import { api, KontakIjans } from "./api";

const SOS_KEY = "ayiti_alet_active_sos";

export interface ActiveSos {
  id: string;
  tokèn: string;
  kreyeNan: string;
  kontakIjans: KontakIjans[];
}

type Listener = (sos: ActiveSos | null) => void;
const listeners = new Set<Listener>();

function notify() {
  const s = getActiveSos();
  listeners.forEach((l) => l(s));
}

export function subscribeSos(listener: Listener): () => void {
  listeners.add(listener);
  listener(getActiveSos());
  return () => listeners.delete(listener);
}

export function getActiveSos(): ActiveSos | null {
  try {
    const raw = localStorage.getItem(SOS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let watchId: number | null = null;
let intervalId: number | null = null;
let dènyePozisyon: { lat: number; lng: number } | null = null;

function kòmanseSwiv(sosId: string, tokèn: string) {
  if (!navigator.geolocation) return;

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      dènyePozisyon = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    },
    () => {},
    { enableHighAccuracy: true }
  );

  // Voye yon mizajou chak 15 segond pito pase chak fwa GPS la deklanche
  // (evite bombade sèvè a e ekonomize done selilè).
  intervalId = window.setInterval(() => {
    if (dènyePozisyon) {
      api.sosUpdatePosition(sosId, tokèn, dènyePozisyon.lat, dènyePozisyon.lng).catch(() => {});
    }
  }, 15000);
}

function fèmeSwiv() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  if (intervalId !== null) window.clearInterval(intervalId);
  watchId = null;
  intervalId = null;
  dènyePozisyon = null;
}

export async function deklancheSos(lat: number, lng: number): Promise<ActiveSos> {
  const res = await api.sosTrigger(lat, lng);
  const sos: ActiveSos = { id: res.id, tokèn: res.tokèn, kreyeNan: res.kreyeNan, kontakIjans: res.kontakIjans };
  localStorage.setItem(SOS_KEY, JSON.stringify(sos));
  notify();
  kòmanseSwiv(sos.id, sos.tokèn);
  return sos;
}

export async function fèmenSos() {
  const sos = getActiveSos();
  if (!sos) return;
  fèmeSwiv();
  localStorage.removeItem(SOS_KEY);
  notify();
  try {
    await api.sosClose(sos.id, sos.tokèn);
  } catch {
    // menm si rekèt la echwe, nou toujou wete SOS la lokalman
  }
}

// Si moun nan rechaje paj la pandan SOS aktif, remete swiv pozisyon an ann mach.
export function reprannSosSiAktif() {
  const sos = getActiveSos();
  if (sos) kòmanseSwiv(sos.id, sos.tokèn);
}

export function lyenSwiv(sosId: string) {
  return `${window.location.origin}/swiv/${sosId}`;
}

export function mesajSmsSos(kontak: KontakIjans, sosId: string) {
  const tèks = encodeURIComponent(
    `Ayiti Alèt — Mwen deklanche yon SOS, mwen bezwen èd. Swiv pozisyon m an tan reyèl: ${lyenSwiv(sosId)}`
  );
  return `sms:${kontak.telefon}?body=${tèks}`;
}
