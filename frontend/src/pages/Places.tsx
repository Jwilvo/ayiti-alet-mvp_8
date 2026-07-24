import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { api, Place } from "../api";

const KATEGORI = [
  { key: "", label: "Tout", emoji: "📍" },
  { key: "sante", label: "Sante", emoji: "🏥" },
  { key: "sekirite", label: "Sekirite", emoji: "🚓" },
  { key: "administrasyon", label: "Administrasyon", emoji: "🏛️" },
  { key: "transpò", label: "Transpò", emoji: "⛽" },
];

export default function Places() {
  const [kategori, setKategori] = useState("");
  const [q, setQ] = useState("");
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [erè, setErè] = useState("");

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

  return (
    <>
      <TopBar />
      <div className="screen">
        <h1 style={{ fontSize: 20 }}>Sèvis toupre w</h1>
        <input placeholder="Chèche yon non (egzanp: lopital, mairi…)" value={q} onChange={(e) => setQ(e.target.value)} />

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
              {k.emoji} {k.label}
            </button>
          ))}
        </div>

        {erè && <div className="banner banner-error">{erè}</div>}
        {!places && !erè && <p className="empty">Ap chèche…</p>}
        {places && places.length === 0 && <p className="empty">Pa jwenn okenn kote ki koresponn.</p>}

        {places?.map((p) => (
          <div key={p.id} className="card">
            <div className="place-row">
              <strong style={{ fontSize: 14.5 }}>{p.non}</strong>
              {p.orè && <span className="place-dist">{p.orè}</span>}
            </div>
            <div className="report-meta">
              {p.adrès}
              {p.komin ? ` · ${p.komin}` : ""}
            </div>
            {p.telefon && (
              <div style={{ marginTop: 8 }}>
                <a href={`tel:${p.telefon}`} className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12.5 }}>
                  📞 {p.telefon}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      <NavBar />
    </>
  );
}
