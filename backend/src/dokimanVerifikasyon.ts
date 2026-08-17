import fs from "fs/promises";
import { createWorker } from "tesseract.js";

// Verifikasyon dokiman idantite pa OCR gratis (Tesseract.js, san kle API).
// AVÈTISMAN ONÈT: sa a se yon verifikasyon "premye liy", pa yon sèvis
// pwofesyonèl KYC/verifikasyon idantite sètifye. Presizyon depann anpil de
// kalite foto (limyè, netete, ang). Nou pa konsève foto a apre verifikasyon
// an — li efase imedyatman, kèlkeswa rezilta a, pou pwoteje vi prive.

const MO_KLE_PA_TIP: Record<string, string[]> = {
  CIN: ["IDENTIFICATION", "IDENTITE", "CARTE", "CIN", "REPIBLIK", "REPUBLIQUE"],
  "Paspò": ["PASSEPORT", "PASSPORT", "REPIBLIK", "REPUBLIQUE"],
  "Permi Kondwi": ["PERMIS", "CONDUIRE", "DRIVER", "LICENSE", "LICENCE"],
};

function nòmalize(tèks: string): string {
  return tèks
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire aksan pou konparezon pi souple
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface RezilteVerifikasyon {
  reyisi: boolean;
  erè?: string;
}

export async function verifyeDokiman(
  chminFichye: string,
  nonAtann: string,
  tipAtann: string
): Promise<RezilteVerifikasyon> {
  let tèksBrit = "";
  try {
    const worker = await createWorker("fra");
    try {
      const { data } = await worker.recognize(chminFichye);
      tèksBrit = data.text || "";
    } finally {
      await worker.terminate();
    }
  } catch (e) {
    console.error("Erè OCR pandan verifikasyon dokiman:", e);
    return { reyisi: false, erè: "Nou pa t ka li dokiman an — eseye yon foto pi klè, byen klere." };
  } finally {
    // JANM konsève foto a — efase l imedyatman kèlkeswa rezilta a.
    await fs.unlink(chminFichye).catch(() => {});
  }

  const tèksNòmalize = nòmalize(tèksBrit);

  // 1. Verifye tip dokiman an (mo kle karakteristik pou chak tip)
  const mòKleAtann = MO_KLE_PA_TIP[tipAtann] ?? [];
  const tipMatche = mòKleAtann.some((mk) => tèksNòmalize.includes(nòmalize(mk)));
  if (!tipMatche) {
    return { reyisi: false, erè: "Dokiman sa pa koresponn ak tip dokiman ou chwazi a." };
  }

  // 2. Verifye non an (souple: konpare mo pa mo, tolere kèk erè OCR)
  const mòNon = nòmalize(nonAtann).split(" ").filter((m) => m.length >= 2);
  if (mòNon.length > 0) {
    const mòJwenn = mòNon.filter((m) => tèksNòmalize.includes(m));
    const pwopòsyon = mòJwenn.length / mòNon.length;
    if (pwopòsyon < 0.5) {
      return { reyisi: false, erè: "Non ou pa koresponn ak sa ki nan dokiman otorize a." };
    }
  }

  return { reyisi: true };
}
