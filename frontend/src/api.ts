const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export interface ReportMedia { id?: string; tip: string; url: string; koulèDominant?: string; briyans?: number; flou?: boolean; }
export interface Comment { id: string; nonAfiche: string; kò: string; kreyeNan: string; }
export interface Report {
  id: string;
  userId: string | null;
  anonim: boolean;
  kategori: string;
  tit: string;
  deskripsyon: string;
  niveauIjans: "ba" | "mwayen" | "grav";
  statut: string;
  latitude: number;
  longitude: number;
  adrès?: string;
  komin?: string;
  kreyeNan: string;
  media?: ReportMedia[];
  konfimasyon?: number;
  confirmations?: unknown[];
  kòmantè?: Comment[];
  kachePouRevizyon?: boolean;
  otèNon?: string;
  otèNivoKonfyans?: number;
}
export interface Place {
  id: string;
  non: string;
  kategori: string;
  souKategori?: string;
  adrès?: string;
  telefon?: string;
  orè?: string;
  latitude: number;
  longitude: number;
  komin?: string;
  direktèNon?: string;
}
export interface CurrentUser { id: string; nom: string; telefon: string; komin?: string; katye?: string; wòl?: "sitwayen" | "admin"; niveauKonfyans?: number; fotoPwofil?: string; }

export interface LyeItilizatè { id: string; non: string; latitude: number; longitude: number; kreyeNan: string; }
export interface IjansDeklare { id: string; tit: string; deskripsyon?: string; reyonKm: number; kreyeNan: string; }
export interface IjansAdmin extends IjansDeklare { aktif: boolean; konteNotifye: number; konteAnSekirite: number; konteBezwenÈd: number; }
export interface IjansRapòMoun { userId: string; nom: string; telefon: string; kreyeNan?: string; }
export interface IjansRapò { anSekirite: IjansRapòMoun[]; bezwenÈd: IjansRapòMoun[]; pokoReponn: IjansRapòMoun[]; }
export interface AletMeteyo { id: string; non: string; tip: string; entansiteKt?: number; lyenOfisyèl?: string; distansKm: number; kreyeNan: string; mizajouNan: string; }

export interface AdminTandans {
  paJou: { jou: string; n: number }[];
  paLè: { lè: number; n: number }[];
  kèdKat: { latitude: number; longitude: number; niveauIjans: string }[];
}

export interface AdminStats {
  totalRapò: number;
  totalItilizatè: number;
  totalKonfimasyon: number;
  parKategori: Record<string, number>;
  parNiveau: Record<string, number>;
  parStatut: Record<string, number>;
}

export interface DuplicateGroup {
  rapò: Report[];
  distansMèt: number;
  ekarMinit: number;
}

export interface KontakIjans { non: string; telefon: string; }
export interface SosStatus {
  id: string;
  statut: "aktif" | "fini";
  kreyeNan: string;
  dènyeMizajou: string;
  latitude: number;
  longitude: number;
  istorik: { latitude: number; longitude: number; kreyeNan: string }[];
}

export interface KominZòn { depatman: string; komin: string; }

function getToken() {
  return localStorage.getItem("ayiti_alet_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erè || "Yon erè rive. Eseye ankò.");
  }
  return data as T;
}

export const api = {
  health: () => request<{ statut: string }>("/health"),

  register: (body: {
    nom: string; telefon: string; motDePasse: string; email: string; komin?: string; katye?: string;
    nonKonplè?: string; dokimanTip?: "CIN" | "Paspò" | "Permi Kondwi"; dokimanNimewo?: string; dokimanFotoUrl?: string; adrèsKay: string;
  }) =>
    request<{ token: string; user: CurrentUser }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { telefon: string; motDePasse: string }) =>
    request<{ token: string; user: CurrentUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<CurrentUser>("/auth/me"),

  updateMe: (body: { komin?: string; katye?: string; fotoPwofil?: string }) =>
    request<CurrentUser>("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),

  mizajouPozisyon: (latitude: number, longitude: number) =>
    request("/auth/pozisyon", { method: "PATCH", body: JSON.stringify({ latitude, longitude }) }),

  anrejistreTokènPush: (tokèn: string) =>
    request("/notifications/token", { method: "POST", body: JSON.stringify({ tokèn }) }),

  listReports: (params: { kategori?: string; niveauIjans?: string; komin?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as any).toString();
    return request<Report[]>(`/reports${qs ? `?${qs}` : ""}`);
  },

  getReport: (id: string) => request<Report>(`/reports/${id}`),

  createReport: (body: Partial<Report>) =>
    request<{ report: Report; otoriteAvize: string[]; avètisman: string[] }>("/reports", { method: "POST", body: JSON.stringify(body) }),

  confirmReport: (id: string, tipAksyon: "konfime" | "siyale") =>
    request(`/reports/${id}/confirm`, { method: "POST", body: JSON.stringify({ tipAksyon }) }),

  ajouteKòmantè: (id: string, kò: string) =>
    request<Comment>(`/reports/${id}/komante`, { method: "POST", body: JSON.stringify({ kò }) }),

  voyeSijesyon: (kò: string) => request<{ ok: true }>("/sijesyon", { method: "POST", body: JSON.stringify({ kò }) }),

  listPlaces: (params: { kategori?: string; komin?: string; q?: string } = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
    return request<Place[]>(`/places${qs ? `?${qs}` : ""}`);
  },

  listKomin: () => request<KominZòn[]>("/zones/komin"),

  detèDepatmanOtomatik: (lat: number, lng: number) =>
    request<{ depatman: string | null; presizyon?: string }>(`/zones/depatman-otomatik?lat=${lat}&lng=${lng}`),

  adminStats: () => request<AdminStats>("/admin/stats"),

  adminListReports: (params: { statut?: string; niveauIjans?: string } = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
    return request<Report[]>(`/admin/reports${qs ? `?${qs}` : ""}`);
  },

  adminSetStatut: (id: string, statut: string) =>
    request<Report>(`/admin/reports/${id}`, { method: "PATCH", body: JSON.stringify({ statut }) }),

  adminDuplicates: () => request<DuplicateGroup[]>("/admin/duplicates"),

  sosTrigger: (latitude: number, longitude: number) =>
    request<{ id: string; statut: string; kreyeNan: string; tokèn: string; kontakIjans: KontakIjans[] }>("/sos/trigger", {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    }),

  sosUpdatePosition: (id: string, tokèn: string, latitude: number, longitude: number) =>
    request(`/sos/${id}/pozisyon`, {
      method: "POST",
      headers: { "x-sos-token": tokèn },
      body: JSON.stringify({ latitude, longitude }),
    }),

  sosClose: (id: string, tokèn: string) =>
    request(`/sos/${id}/fermen`, { method: "POST", headers: { "x-sos-token": tokèn } }),

  sosGet: (id: string) => request<SosStatus>(`/sos/${id}`),

  getKontakIjans: () => request<KontakIjans[]>("/sos/mwen/kontak-ijans"),

  mandeReyajisman: (telefon: string) =>
    request<{ ok: boolean; mesaj: string }>("/auth/mande-reyajisman", { method: "POST", body: JSON.stringify({ telefon }) }),

  konfimeReyajisman: (telefon: string, kòd: string, nouvoModDePasse: string) =>
    request<{ ok: boolean }>("/auth/konfime-reyajisman", { method: "POST", body: JSON.stringify({ telefon, kòd, nouvoModDePasse }) }),

  listLye: () => request<LyeItilizatè[]>("/lye"),
  ajouteLye: (non: string, latitude: number, longitude: number) =>
    request<LyeItilizatè>("/lye", { method: "POST", body: JSON.stringify({ non, latitude, longitude }) }),
  efaseLye: (id: string) => request<{ ok: boolean }>(`/lye/${id}`, { method: "DELETE" }),

  adminTandans: () => request<AdminTandans>("/admin/tandans"),

  ijansAktif: (lat: number, lng: number) =>
    request<IjansDeklare[]>(`/ijans/aktif?lat=${lat}&lng=${lng}`),
  ijansAnSekirite: (id: string, anSekirite: boolean) =>
    request<{ ok: boolean }>(`/ijans/${id}/an-sekirite`, { method: "POST", body: JSON.stringify({ anSekirite }) }),
  adminDeklareIjans: (body: { tit: string; deskripsyon?: string; latitude: number; longitude: number; reyonKm: number }) =>
    request<IjansDeklare>("/ijans", { method: "POST", body: JSON.stringify(body) }),
  adminListIjans: () => request<IjansAdmin[]>("/ijans/admin/tout"),
  adminDezaktiveIjans: (id: string) => request<{ ok: boolean }>(`/ijans/${id}/dezaktive`, { method: "PATCH" }),
  ijansRapò: (id: string) => request<IjansRapò>(`/ijans/${id}/rapo`),
  ijansMwenWòl: () => request<{ wòl: string | null; kapabDeklare: boolean; reyonMaks: number | null }>("/ijans/mwen/wòl"),

  adminOtoriteWòlEnfo: () => request<Record<string, { label: string; reyonMaksKm: number | null; mandeZòn: boolean }>>("/admin/otorite/wol-enfo"),
  adminListOtorite: () =>
    request<{ id: string; nom: string; telefon: string; wòl: string; zònResponsabilite: string | null; kreyeNan: string; reyonMaksKm: number | null }[]>(
      "/admin/otorite"
    ),
  adminAsiyeWòl: (id: string, wòl: string, zònResponsabilite?: string) =>
    request<{ id: string; nom: string; telefon: string; wòl: string; zònResponsabilite: string | null; reyonMaksKm: number | null }>(
      `/admin/otorite/${id}`,
      { method: "PATCH", body: JSON.stringify({ wòl, zònResponsabilite }) }
    ),

  adminChècheItilizatè: (telefon: string) =>
    request<{ id: string; nom: string; telefon: string; email: string | null; komin?: string; katye?: string; kreyeNan: string; genDokiman: boolean }>(
      `/admin/itilizate/cheche?telefon=${encodeURIComponent(telefon)}`
    ),
  adminLibereItilizatè: (id: string) => request<{ ok: boolean; mesaj: string }>(`/admin/itilizate/${id}/libere`, { method: "POST" }),

  aletMeteyoAktif: () => request<AletMeteyo[]>("/alet-meteyo/aktif"),

  setKontakIjans: (kontak: KontakIjans[]) =>
    request<KontakIjans[]>("/sos/mwen/kontak-ijans", { method: "PUT", body: JSON.stringify(kontak) }),

  uploadFile: async (file: File): Promise<{ url: string; tip: string }> => {
    const fd = new FormData();
    fd.append("fichye", file);
    const token = localStorage.getItem("ayiti_alet_token");
    const res = await fetch(`${API_URL}/uploads`, {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erè || "Erè pandan telechajman imaj la.");
    return data;
  },
};

export function saveSession(token: string, user: CurrentUser) {
  localStorage.setItem("ayiti_alet_token", token);
  localStorage.setItem("ayiti_alet_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("ayiti_alet_token");
  localStorage.removeItem("ayiti_alet_user");
}
export function getSessionUser(): CurrentUser | null {
  const raw = localStorage.getItem("ayiti_alet_user");
  return raw ? JSON.parse(raw) : null;
}
export function updateSessionUser(user: CurrentUser) {
  localStorage.setItem("ayiti_alet_user", JSON.stringify(user));
}
