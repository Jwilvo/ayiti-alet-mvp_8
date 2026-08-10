import { useEffect, useState } from "react";
import { api } from "./api";
import { PendingReport, subscribeQueue } from "./offline";
import { ActiveSos, subscribeSos } from "./sos";
import { abòneChanjman } from "./unread";
import { abòneLang } from "./i18n";

export function useVèsyonMakè(): number {
  const [v, setV] = useState(0);
  useEffect(() => abòneChanjman(() => setV((x) => x + 1)), []);
  return v;
}

// Fòse re-rann lè lang lan chanje — itilize nan tout kòmpozan ki sèvi ak t()
export function useLangVèsyon(): number {
  const [v, setV] = useState(0);
  useEffect(() => abòneLang(() => setV((x) => x + 1)), []);
  return v;
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function usePendingQueue(): PendingReport[] {
  const [queue, setQueue] = useState<PendingReport[]>([]);
  useEffect(() => subscribeQueue(setQueue), []);
  return queue;
}

export function useActiveSos(): ActiveSos | null {
  const [sos, setSos] = useState<ActiveSos | null>(null);
  useEffect(() => subscribeSos(setSos), []);
  return sos;
}

// Pozisyon itilizatè a, jwenn otomatikman an background (yon sèl demann
// pèmisyon pou tout sesyon an — pa gen bouton, pa gen aksyon moun nan bezwen
// fè). Itilize pou detèmine ki rapò "toupre" li san nou pa bezwen mande l
// chwazi okenn non komin/depatman.
let pozisyonKache: { lat: number; lng: number } | null = null;
let demannAnKou: Promise<void> | null = null;

export function useUserPosition(): { lat: number; lng: number } | null {
  const [pozisyon, setPozisyon] = useState<{ lat: number; lng: number } | null>(pozisyonKache);

  useEffect(() => {
    if (pozisyonKache) {
      setPozisyon(pozisyonKache);
      return;
    }
    if (!navigator.geolocation) return;

    if (!demannAnKou) {
      demannAnKou = new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            pozisyonKache = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            // Silans: si moun nan konekte, voye pozisyon an bay backend la
            // pou l ka sèvi pou vize notifikasyon push "moun ki toupre".
            if (localStorage.getItem("ayiti_alet_token")) {
              api.mizajouPozisyon(pozisyonKache.lat, pozisyonKache.lng).catch(() => {});
            }
            resolve();
          },
          () => resolve(),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
        );
      });
    }
    demannAnKou.then(() => setPozisyon(pozisyonKache));
  }, []);

  return pozisyon;
}
