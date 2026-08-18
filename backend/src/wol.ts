// Definisyon santral pou wòl enstitisyonèl yo — yon sèl kote pou modifye si
// nou ajoute/chanje yon wòl pita, pou admin.ts ak ijans.ts rete konsistan.

export interface EnfoWòl {
  label: string;
  reyonMaksKm: number | null; // null = nasyonal, san limit
  mandeZòn: boolean; // èske wòl sa a bezwen yon "zòn responsabilite" (egzanp non komin)
}

export const WÒL_ENFO: Record<string, EnfoWòl> = {
  sitwayen: { label: "Sitwayen", reyonMaksKm: 0, mandeZòn: false },
  admin: { label: "Admin (jeneral)", reyonMaksKm: 500, mandeZòn: false },
  prezidans: { label: "Prezidans", reyonMaksKm: null, mandeZòn: false },
  premye_minis: { label: "Premye Minis", reyonMaksKm: null, mandeZòn: false },
  minis_enteryè: { label: "Minis Enteryè ak Kolektivite Teritoryal", reyonMaksKm: null, mandeZòn: false },
  minis_jistis: { label: "Minis Jistis ak Sekirite Piblik", reyonMaksKm: null, mandeZòn: false },
  minis_defans: { label: "Minis Defans", reyonMaksKm: null, mandeZòn: false },
  minis_sante: { label: "Minis Sante Piblik ak Popilasyon (MSPP)", reyonMaksKm: null, mandeZòn: false },
  minis_afè_etranjè: { label: "Minis Afè Etranjè ak Kilt", reyonMaksKm: null, mandeZòn: false },
  minis_edikasyon: { label: "Minis Edikasyon Nasyonal", reyonMaksKm: null, mandeZòn: false },
  minis_agrikilti: { label: "Minis Agrikilti (MARNDR)", reyonMaksKm: null, mandeZòn: false },
  minis_travo_piblik: { label: "Minis Travo Piblik, Transpò ak Kominikasyon (MTPTC)", reyonMaksKm: null, mandeZòn: false },
  minis_komès: { label: "Minis Komès ak Endistri (MCI)", reyonMaksKm: null, mandeZòn: false },
  minis_afè_sosyal: { label: "Minis Afè Sosyal ak Travay (MAST)", reyonMaksKm: null, mandeZòn: false },
  minis_kilti: { label: "Minis Kilti ak Kominikasyon", reyonMaksKm: null, mandeZòn: false },
  minis_jenès: { label: "Minis Jenès ak Espò", reyonMaksKm: null, mandeZòn: false },
  minis_planifikasyon: { label: "Minis Planifikasyon ak Koperasyon Ekstèn (MPCE)", reyonMaksKm: null, mandeZòn: false },
  minis_tourism: { label: "Minis Tourism", reyonMaksKm: null, mandeZòn: false },
  minis_anviwonman: { label: "Minis Anviwonman", reyonMaksKm: null, mandeZòn: false },
  minis_kondisyon_feminen: { label: "Minis Kondisyon Feminen", reyonMaksKm: null, mandeZòn: false },
  minis_ayisyen_aletranje: { label: "Minis Ayisyen Viv Aletranje (MHAVE)", reyonMaksKm: null, mandeZòn: false },
  minis_ekonomi: { label: "Minis Ekonomi ak Finans (MEF)", reyonMaksKm: null, mandeZòn: false },
  delege: { label: "Delege Depatmantal", reyonMaksKm: 150, mandeZòn: true },
  vis_delege: { label: "Vis-Delege (Awondisman)", reyonMaksKm: 75, mandeZòn: true },
  majistra: { label: "Majistra (Meri)", reyonMaksKm: 25, mandeZòn: true },
  "kazèk": { label: "Kazèk (CASEC)", reyonMaksKm: 10, mandeZòn: true },
  asek: { label: "Manm ASEC", reyonMaksKm: 10, mandeZòn: true },
};

export const WÒL_KAPAB_DEKLARE_IJANS = Object.keys(WÒL_ENFO).filter((w) => w !== "sitwayen");

export function reyonMaksPouWòl(wòl: string): number | null {
  const enfo = WÒL_ENFO[wòl];
  if (!enfo) return 0; // wòl enkoni — pa gen dwa deklare anyen
  return enfo.reyonMaksKm; // ka null (== nasyonal, san limit) — se yon valè valid, pa yon absans
}
