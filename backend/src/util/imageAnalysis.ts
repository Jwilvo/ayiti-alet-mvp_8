import { Jimp } from "jimp";

export interface AnalizImaj {
  koulèDominant: string; // hex, egzanp "#c0392b"
  briyans: number; // 0 (nwa) - 1 (klere)
  flou: boolean;
  ahash: string; // "average hash" 64-bit pou konpare imaj (deteksyon doub)
}

// "Average hash" senp: redwi imaj la a 8x8 piksel gri, konpare chak piksel ak
// mwayèn nan → 64 bit. De imaj ki sanble jenere yon ahash prèske idantik,
// menm si yo konprese oswa retay yon ti kras diferan.
async function kalkileAhash(img: any): Promise<string> {
  const ti = img.clone().resize({ w: 8, h: 8 }).greyscale();
  const pikselYo: number[] = [];
  ti.scan(0, 0, ti.bitmap.width, ti.bitmap.height, (_x: number, _y: number, idx: number) => {
    pikselYo.push(ti.bitmap.data[idx]); // kanal gri (R=G=B apre greyscale)
  });
  const mwayèn = pikselYo.reduce((a, b) => a + b, 0) / pikselYo.length;
  const bits = pikselYo.map((p) => (p >= mwayèn ? "1" : "0")).join("");
  // konvèti 64 bit an hex (16 karaktè)
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

function distansHamming(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    dist += diff.toString(2).split("1").length - 1;
  }
  return dist;
}

export async function analizeImaj(chminFichye: string): Promise<AnalizImaj> {
  const img = await Jimp.read(chminFichye);

  // Koulè dominant ak briyans mwayèn — redui a yon ti vèsyon pou kalkil rapid
  const echantiyon = img.clone().resize({ w: 32, h: 32 });
  let totalR = 0, totalG = 0, totalB = 0, totalLum = 0, n = 0;
  echantiyon.scan(0, 0, echantiyon.bitmap.width, echantiyon.bitmap.height, (_x: number, _y: number, idx: number) => {
    const data = echantiyon.bitmap.data;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    totalR += r; totalG += g; totalB += b;
    totalLum += (r * 0.299 + g * 0.587 + b * 0.114);
    n++;
  });
  const r = Math.round(totalR / n), g = Math.round(totalG / n), b = Math.round(totalB / n);
  const koulèDominant = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const briyans = totalLum / n / 255;

  // Deteksyon flou senp: mezire vaha (variance) diferans ant piksel vwazen sou
  // yon vèsyon gri — yon imaj nèt/klè gen plis "kontras lokal" pase yon imaj flou.
  const gri = img.clone().resize({ w: 200, h: 200 }).greyscale();
  const valè: number[] = [];
  gri.scan(0, 0, gri.bitmap.width, gri.bitmap.height, (_x: number, _y: number, idx: number) => {
    valè.push(gri.bitmap.data[idx]);
  });
  let sòmDiferans = 0;
  const lajè = gri.bitmap.width;
  for (let i = 0; i < valè.length - 1; i++) {
    if ((i + 1) % lajè === 0) continue; // pa konpare bò dwat/goch liy yo
    sòmDiferans += Math.abs(valè[i] - valè[i + 1]);
  }
  const kontrasMwayèn = sòmDiferans / valè.length;
  const flou = kontrasMwayèn < 8; // sèy chwazi apre tès manyèl sou egzanp

  const ahash = await kalkileAhash(img);

  return { koulèDominant, briyans, flou, ahash };
}

export { distansHamming };
