import { api, Report } from "./api";

const QUEUE_KEY = "ayiti_alet_pending_reports";

export interface PendingReport {
  localId: string;
  payload: Partial<Report>;
  kreyeNanLokal: string;
  tantativ: number;
  dènyeErè?: string;
}

type Listener = (queue: PendingReport[]) => void;
const listeners = new Set<Listener>();

function notify() {
  const q = getQueue();
  listeners.forEach((l) => l(q));
}

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  listener(getQueue());
  return () => listeners.delete(listener);
}

export function getQueue(): PendingReport[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingReport[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  notify();
}

export function queueReport(payload: Partial<Report>): PendingReport {
  const entry: PendingReport = {
    localId: `lokal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    payload,
    kreyeNanLokal: new Date().toISOString(),
    tantativ: 0,
  };
  const queue = getQueue();
  queue.push(entry);
  saveQueue(queue);
  return entry;
}

let syncEnCour = false;

export async function trySyncQueue(): Promise<{ reyisi: number; echwe: number }> {
  if (syncEnCour) return { reyisi: 0, echwe: 0 };
  if (!navigator.onLine) return { reyisi: 0, echwe: 0 };

  syncEnCour = true;
  let reyisi = 0;
  let echwe = 0;
  try {
    let queue = getQueue();
    for (const entry of queue) {
      try {
        await api.createReport(entry.payload);
        queue = queue.filter((e) => e.localId !== entry.localId);
        saveQueue(queue);
        reyisi++;
      } catch (e: any) {
        entry.tantativ += 1;
        entry.dènyeErè = e.message || "Erè pandan senkwonizasyon.";
        saveQueue(queue);
        echwe++;
      }
    }
  } finally {
    syncEnCour = false;
  }
  return { reyisi, echwe };
}

export function initAutoSync() {
  window.addEventListener("online", () => {
    trySyncQueue();
  });
  if (navigator.onLine) {
    trySyncQueue();
  }
}
