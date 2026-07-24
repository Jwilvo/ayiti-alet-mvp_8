import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import ConnectivityBanner from "../components/ConnectivityBanner";
import { api, Report } from "../api";
import { usePendingQueue, useActiveSos } from "../hooks";
import { deklancheSos, fèmenSos, lyenSwiv, mesajSmsSos } from "../sos";
import { categoryMeta, severityColor, timeAgo } from "../categories";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];

export default function Home() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [erè, setErè] = useState("");
  const [sosArmed, setSosArmed] = useState(false);
  const [sosChaje, setSosChaje] = useState(false);
  const navigate = useNavigate();
  const pending = usePendingQueue();
  const activeSos = useActiveSos();

  useEffect(() => {
    api
      .listReports({ limit: 6 })
      .then(setReports)
      .catch((e) => setErè(e.message));
  }, []);

  function pranPozisyonKounyeA(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: PÒTOPRENS_CENTER[0], lng: PÒTOPRENS_CENTER[1] });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: PÒTOPRENS_CENTER[0], lng: PÒTOPRENS_CENTER[1] }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function handleSos() {
    if (activeSos) return; // deja aktif, aksyon yo nan bandwo a anba
    if (!sosArmed) {
      setSosArmed(true);
      setTimeout(() => setSosArmed(false), 4000);
      return;
    }
    setSosArmed(false);
    setSosChaje(true);
    try {
      const pos = await pranPozisyonKounyeA();
      await deklancheSos(pos.lat, pos.lng);
    } catch {
      setErè("Nou pa t ka deklanche SOS la. Eseye ankò.");
    } finally {
      setSosChaje(false);
    }
  }

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
        <ConnectivityBanner />

        {activeSos && (
          <div className="banner" style={{ background: "var(--urgent-dim)", borderColor: "rgba(255,90,78,0.4)" }}>
            <strong style={{ color: "var(--urgent)" }}>🚨 SOS aktif — pozisyon w ap pataje an tan reyèl</strong>
            <p style={{ fontSize: 13, margin: "6px 0 10px", color: "#ffcac4" }}>
              Voye lyen swiv la bay yon kontak, oswa kanpe SOS la si ou an sekirite.
            </p>
            {activeSos.kontakIjans.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {activeSos.kontakIjans.map((k) => (
                  <a key={k.telefon} href={mesajSmsSos(k, activeSos.id)} className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12.5 }}>
                    📩 Voye bay {k.non}
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12.5, color: "#ffcac4", marginBottom: 8 }}>
                Ou pa gen kontak ijans anrejistre. <Link to="/pwofil" style={{ color: "#ffcac4", textDecoration: "underline" }}>Ajoute nan Pwofil</Link>.
              </p>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={lyenSwiv(activeSos.id)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }}
              >
                🔗 Wè lyen swiv la
              </a>
              <button className="btn btn-urgent" style={{ flex: 1, padding: "8px 10px", fontSize: 12.5 }} onClick={() => fèmenSos()}>
                Kanpe SOS
              </button>
            </div>
          </div>
        )}

        <div className="sos-wrap">
          <div className="sos-ring">
            <button className="sos-btn" onClick={handleSos} disabled={sosChaje || !!activeSos}>
              {sosChaje ? <span className="spinner" /> : activeSos ? "AKTIF" : sosArmed ? "KONFIME?" : "SOS"}
            </button>
          </div>
          <p className="sos-caption">
            {activeSos
              ? "SOS ou a aktif — kontak ou yo ka swiv pozisyon w."
              : sosArmed
              ? "Peze ankò pou voye alèt ijans ak pozisyon ou."
              : "Peze si ou nan yon danje imedya. L ap voye pozisyon ou."}
          </p>
        </div>

        <div className="section-title">
          <h2>Kat aktivite</h2>
          <Link className="link" to="/kat">Wè tout →</Link>
        </div>
        <IncidentMap center={PÒTOPRENS_CENTER} zoom={12} markers={markers} />

        <div className="section-title">
          <h2>Rapò resan</h2>
          <Link className="link" to="/rapòte">+ Nouvo rapò</Link>
        </div>

        {erè && <div className="banner banner-error">{erè}</div>}

        {pending.map((p) => {
          const meta = categoryMeta(p.payload.kategori || "lòt");
          return (
            <div key={p.localId} className="card report-row" style={{ opacity: 0.75, borderStyle: "dashed" }}>
              <div className="report-icon">{meta.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: 14 }}>{p.payload.tit}</strong>
                  <span className="tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)" }}>
                    poko voye
                  </span>
                </div>
                <div className="report-meta">{meta.label} · Estoke lokalman, ap tann koneksyon</div>
              </div>
            </div>
          );
        })}

        {!reports && !erè && <p className="empty">Ap chaje rapò yo…</p>}
        {reports && reports.length === 0 && pending.length === 0 && (
          <p className="empty">Poko gen rapò. Se ou ki ka premye a — peze "+ Nouvo rapò".</p>
        )}

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
