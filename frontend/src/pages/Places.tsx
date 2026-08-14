import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { api, Place } from "../api";
import { t } from "../i18n";
import { useLangVèsyon, useUserPosition } from "../hooks";
import { distansKm } from "../categories";

const REYON_TOUPRE_KM = 100; // apwoksimatif gwosè yon depatman

const KATEGORI = [
  { key: "", kle: "sèvis.tout", emoji: "📍" },
  { key: "sante", kle: "sèvis.sante", emoji: "🏥" },
  { key: "sekirite", kle: "sèvis.sekirite", emoji: "🚓" },
  { key: "administrasyon", kle: "sèvis.administrasyon", emoji: "🏛️" },
  { key: "transpò", kle: "sèvis.transpò", emoji: "⛽" },
];

export default function Places() {
  useLangVèsyon();
  const [kategori, setKategori] = useState("");
  const [q, setQ] = useState("");
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [erè, setErè] = useState("");
  const [wèTout, setWèTout] = useState(false);
  const pozisyon = useUserPosition(); // otomatik, san bouton — gade hooks.ts

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPlaces(null);
      api
        .listPlaces({ kategori: kategori || undefined, q: q || undefined })
        .then(setPlaces)
        .catch((e) => setErè(e.message));
    }, 250);
    return () => clearTimeout(timeout);
  }, [kategori, q]);

  const placesAkDistans = (places ?? []).map((p) => ({
    plas: p,
    dist: pozisyon ? distansKm(pozisyon.lat, pozisyon.lng, p.latitude, p.longitude) : null,
  }));

  const toupre = placesAkDistans.filter((p) => p.dist === null || p.dist <= REYON_TOUPRE_KM);
  const montreTout = wèTout || !pozisyon || toupre.length === 0;
  const placesKlase = [...(montreTout ? placesAkDistans : toupre)].sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));

  return (
    <>
      <TopBar />
      <div className="screen">
        <h1 style={{ fontSize: 20 }}>{t("sèvis.tit")}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: -4, marginBottom: 12 }}>
          {montreTout
            ? "Sèlman enstitisyon piblik, tout peyi a."
            : `Sèlman enstitisyon piblik nan ${REYON_TOUPRE_KM}km de ou.`}
        </p>
        <input placeholder={t("sèvis.chèche")} value={q} onChange={(e) => setQ(e.target.value)} />

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
          {KATEGORI.map((k) => (
            <button
              key={k.key}
              className="btn btn-ghost"
              style={{
                padding: "8px 12px",
                fontSize: 13,
                whiteSpace: "nowrap",
                borderColor: kategori === k.key ? "var(--official)" : "var(--border)",
                color: kategori === k.key ? "var(--text)" : "var(--text-muted)",
              }}
              onClick={() => setKategori(k.key)}
            >
              {k.emoji} {t(k.kle)}
            </button>
          ))}
        </div>

        {erè && <div className="banner banner-error">{erè}</div>}
        {!places && !erè && <p className="empty">{t("sèvis.ap_chèche")}</p>}
        {places && placesKlase.length === 0 && <p className="empty">{t("sèvis.pa_jwenn")}</p>}

        {places && toupre.length === 0 && pozisyon && (
          <div className="banner" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
            <strong style={{ fontSize: 13 }}>Pa gen sèvis piblik nan {REYON_TOUPRE_KM}km de ou kounye a.</strong>
            <p style={{ fontSize: 12, margin: "4px 0 0", color: "var(--text-muted)" }}>
              Men lis sa a montre sèvis ki pi pre ou yo, kèlkeswa distans.
            </p>
          </div>
        )}

        {!montreTout && toupre.length > 0 && (
          <button className="btn btn-ghost btn-block" onClick={() => setWèTout(true)} style={{ marginBottom: 14 }}>
            Wè sèvis nan tout peyi a tou
          </button>
        )}
        {wèTout && (
          <button className="btn btn-ghost btn-block" onClick={() => setWèTout(false)} style={{ marginBottom: 14 }}>
            Retounen sou sèvis ki toupre m sèlman
          </button>
        )}

        {placesKlase.map(({ plas: p, dist }) => {
          return (
            <div key={p.id} className="card">
              <div className="place-row">
                <strong style={{ fontSize: 14.5 }}>{p.non}</strong>
                {dist !== null && <span className="place-dist">{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(0)}km`}</span>}
              </div>
              <div className="report-meta">
                {p.adrès}
                {p.komin ? ` · ${p.komin}` : ""}
              </div>
              {p.direktèNon && (
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
                  👤 {p.direktèNon}
                </div>
              )}
              {p.telefon && (
                <div style={{ marginTop: 8 }}>
                  <a href={`tel:${p.telefon}`} className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12.5 }}>
                    📞 {p.telefon}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <NavBar />
    </>
  );
}
