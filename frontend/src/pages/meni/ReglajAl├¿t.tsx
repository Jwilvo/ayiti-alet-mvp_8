import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { RAYON_IJANS_KM, RAYON_ENFÒMASYON_KM } from "../../categories";

export default function ReglajAlèt() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni/reglaj")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>Reglaj alèt</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Aplikasyon an itilize pozisyon telefòn ou otomatikman (san bouton) pou detèmine ki
          alèt konsène w dirèkteman.
        </p>

        <div className="card">
          <strong style={{ fontSize: 14 }}>🔔 Ijans pou ou</strong>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>
            Rapò ki nan yon reyon <strong>{RAYON_IJANS_KM} km</strong> de ou — ou resevwa yon
            notifikasyon push ak son.
          </p>
        </div>
        <div className="card">
          <strong style={{ fontSize: 14 }}>ℹ️ Nouvèl</strong>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>
            Rapò ant <strong>{RAYON_IJANS_KM}-{RAYON_ENFÒMASYON_KM} km</strong> de ou — parèt
            nan Nouvèl, san notifikasyon push.
          </p>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 20 }}>
          Kapasite pou chanje distans sa yo manyèlman ap vini nan yon pwochen vèsyon.
        </p>
      </div>
      <NavBar />
    </>
  );
}
