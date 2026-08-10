import { useEffect, useState } from "react";
import { api, Report } from "./api";
import { useUserPosition } from "./hooks";
import { distansKm, nivoPètinans, NivoPètinans } from "./categories";

export interface RapòAkDistans {
  rapò: Report;
  distKm: number | null;
  nivo: NivoPètinans;
}

// Rekipere rapò yo epi klase yo pa distans, san okenn seleksyon manyèl —
// menm lojik ak Akèy la itilize, men pataje isit la pou Al\u00e8t/Nouvèl/NavBar
// ka tout itilize menm règ yo san repete kòd.
export function useRapòPaNivo(nivoVle: "ijans" | "enfòmasyon"): { lis: RapòAkDistans[]; chaje: boolean } {
  const [tout, setTout] = useState<Report[] | null>(null);
  const pozisyon = useUserPosition();

  useEffect(() => {
    api.listReports({ limit: 50 }).then(setTout).catch(() => setTout([]));
  }, []);

  const lis: RapòAkDistans[] = (tout ?? [])
    .map((r) => {
      const distKm = pozisyon ? distansKm(pozisyon.lat, pozisyon.lng, r.latitude, r.longitude) : null;
      return { rapò: r, distKm, nivo: nivoPètinans(distKm) };
    })
    .filter((r) => r.nivo === nivoVle)
    .sort((a, b) => (a.distKm ?? 0) - (b.distKm ?? 0));

  return { lis, chaje: tout !== null };
}
