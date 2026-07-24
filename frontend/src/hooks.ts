import { useEffect, useState } from "react";
import { PendingReport, subscribeQueue } from "./offline";
import { ActiveSos, subscribeSos } from "./sos";

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
