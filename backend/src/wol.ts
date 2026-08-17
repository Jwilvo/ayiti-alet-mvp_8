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
  delege: { label: "Delege Depatmantal", reyonMaksKm: 150, mandeZòn: true },
  "kazèk": { label: "Kazèk (CASEC)", reyonMaksKm: 10, mandeZòn: true },
};

export const WÒL_KAPAB_DEKLARE_IJANS = Object.keys(WÒL_ENFO).filter((w) => w !== "sitwayen");

export function reyonMaksPouWòl(wòl: string): number | null {
  return WÒL_ENFO[wòl]?.reyonMaksKm ?? 0;
}
