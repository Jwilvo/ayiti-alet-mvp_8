import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import { api, Report, getSessionUser } from "../api";
import { categoryMeta, severityColor, timeAgo } from "../categories";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];

const FILTRES = [
  { key: "", label: "Tout" },
  { key: "grav", label: "Grav" },
  { key: "mwayen", label: "Mwayen" },
  { key: "ba", label: "Ba" },
];

export default function MapScreen() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [filtre, setFiltre] = useState("");
  const [sèlmanZònMwen, setSèlmanZònMwen] = useState(false);
  const [erè, setErè] = useState("");
  const navigate = useNavigate();
  const user = getSessionUser();

  useEffect(() => {
    setReports(null);
    api
      .listReports({
        niveauIjans: filtre || undefined,
        komin: sèlmanZònMwen ? user?.komin : undefined,
      })
      .then(setReports)
      .catch((e) => setErè(e.message));
  }, [filtre, sèlmanZònMwen]);

  const markers = (reports ?? []).map((r) => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    color: severityColor(r.niveauIjans),
    label: r.tit,
    sublabel: categoryMeta(r.kategori).label,
    onClick: () => navigate(`/rapò/${r.id}`),
  }));

  return (
    <>
      <TopBar />
      <div className="screen">
        <h1 style={{ fontSize: 20 }}>Kat ensidan</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Peze yon pwen sou kat la pou wè detay rapò a.
        </p>

        <IncidentMap center={PÒTOPRENS_CENTER} zoom={12} height={260} markers={markers} />

        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {FILTRES.map((f) => (
            <button
              key={f.key}
              className="btn btn-ghost"
              style={{
                padding: "8px 12px",
                fontSize: 13,
                borderColor: filtre === f.key ? "var(--official)" : "var(--border)",
                color: filtre === f.key ? "var(--text)" : "var(--text-muted)",
              }}
              onClick={() => setFiltre(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {user?.komin && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              style={{ width: "auto", margin: 0 }}
              checked={sèlmanZònMwen}
              onChange={(e) => setSèlmanZònMwen(e.target.checked)}
            />
            Sèlman zòn mwen ({user.komin})
          </label>
        )}

        {erè && <div className="banner banner-error">{erè}</div>}
        {!reports && !erè && <p className="empty">Ap chaje ensidan yo…</p>}
        {reports && reports.length === 0 && <p className="empty">Pa gen ensidan pou filtè sa a kounye a.</p>}

        {reports?.map((r) => {
          const meta = categoryMeta(r.kategori);
          return (
            <Link key={r.id} to={`/rapò/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card report-row">
                <div className="report-icon">{meta.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: 14 }}>{r.tit}</strong>
                    <span className={`tag tag-${r.niveauIjans}`}>{r.niveauIjans}</span>
                  </div>
                  <div className="report-meta">
                    {meta.label} · {r.adrès || "Kote pa presize"} · {timeAgo(r.kreyeNan)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <NavBar />
    </>
  );
}
