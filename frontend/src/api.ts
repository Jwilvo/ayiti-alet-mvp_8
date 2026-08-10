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
}
export interface CurrentUser { id: string; nom: string; telefon: string; komin?: string; katye?: string; wòl?: "sitwayen" | "admin"; }

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

  register: (body: { nom: string; telefon: string; motDePasse: string; komin?: string; katye?: string }) =>
    request<{ token: string; user: CurrentUser }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { telefon: string; motDePasse: string }) =>
    request<{ token: string; user: CurrentUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<CurrentUser>("/auth/me"),

  updateMe: (body: { komin?: string; katye?: string }) =>
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
