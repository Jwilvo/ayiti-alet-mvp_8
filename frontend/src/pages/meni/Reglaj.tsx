import { Link, useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { clearSession, getSessionUser } from "../../api";

const ATIKÒL = [
  { to: "/meni/reglaj/kont", label: "Kont", icon: "👤" },
  { to: "/meni/reglaj/lang", label: "Lang", icon: "🌐" },
  { to: "/meni/reglaj/alèt", label: "Reglaj alèt", icon: "🔔" },
  { to: "/meni/reglaj/kat", label: "Vizyalizasyon map", icon: "🗺️" },
  { to: "/meni/reglaj/nouvèl", label: "Nouvèl", icon: "ℹ️" },
  { to: "/meni/reglaj/aparans", label: "Aparans", icon: "🎨" },
  { to: "/meni/reglaj/tèm", label: "Tèm ak kondisyon legal", icon: "📄" },
  { to: "/meni/reglaj/politik", label: "Politik konfidansyalite", icon: "🔒" },
];

export default function Reglaj() {
  const navigate = useNavigate();
  const user = getSessionUser();

  function fèmenSesyon() {
    clearSession();
    navigate("/");
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni")}>
          ← Retounen nan Meni
        </button>
        <h1 style={{ fontSize: 20 }}>Reglaj</h1>

        {ATIKÒL.map((a) => (
          <Link key={a.to} to={a.to} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <strong style={{ fontSize: 14, flex: 1 }}>{a.label}</strong>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          </Link>
        ))}

        {user && (
          <button
            className="btn btn-urgent btn-block"
            style={{ marginTop: 16 }}
            onClick={fèmenSesyon}
          >
            🚪 Fèmen sesyon
          </button>
        )}
      </div>
      <NavBar />
    </>
  );
}
