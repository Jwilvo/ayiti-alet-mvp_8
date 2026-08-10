import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { getSessionUser } from "../api";

const ATIKÒL = [
  { to: "/meni/pwofil-sekirite", label: "Pwofil sekirite", icon: "🛡️" },
  { to: "/meni/lye-mw-yo", label: "Lye mw yo", icon: "📌" },
  { to: "/meni/group", label: "Group", icon: "👥" },
  { to: "/meni/envite", label: "Envite zanmiw", icon: "✉️" },
  { to: "/meni/blog", label: "Blog", icon: "📰" },
  { to: "/meni/sijesyon", label: "Sijesyon", icon: "💡" },
  { to: "/meni/gid-kominotè", label: "Gid kominotè", icon: "📖" },
];

export default function Meni() {
  const user = getSessionUser();

  return (
    <>
      <TopBar />
      <div className="screen">
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: "50%", background: "var(--surface-raised)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              border: "1px solid var(--border)", flexShrink: 0,
            }}
          >
            {user ? user.nom.slice(0, 1).toUpperCase() : "👤"}
          </div>
          <div>
            <strong style={{ fontSize: 14.5 }}>{user ? user.nom : "Ou pa konekte"}</strong>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              {user ? user.telefon : "Konekte pou plis fonksyon"}
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        {ATIKÒL.map((a) => (
          <Link key={a.to} to={a.to} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
              <span style={{ fontSize: 19 }}>{a.icon}</span>
              <strong style={{ fontSize: 14, flex: 1 }}>{a.label}</strong>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          </Link>
        ))}

        <div style={{ height: 6 }} />

        <Link to="/meni/reglaj" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
            <span style={{ fontSize: 19 }}>⚙️</span>
            <strong style={{ fontSize: 14, flex: 1 }}>Reglaj</strong>
            <span style={{ color: "var(--text-muted)" }}>›</span>
          </div>
        </Link>
      </div>
      <NavBar />
    </>
  );
}
