import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { getSessionUser } from "../api";
import { t } from "../i18n";
import { useLangVèsyon } from "../hooks";

const ATIKÒL = [
  { to: "/meni/pwofil-sekirite", kle: "meni.pwofil_sekirite", icon: "🛡️" },
  { to: "/meni/lye-mw-yo", kle: "meni.lye_mw_yo", icon: "📌" },
  { to: "/meni/group", kle: "meni.group", icon: "👥" },
  { to: "/meni/envite", kle: "meni.envite", icon: "✉️" },
  { to: "/meni/blog", kle: "meni.blog", icon: "📰" },
  { to: "/meni/sijesyon", kle: "meni.sijesyon", icon: "💡" },
  { to: "/meni/gid-kominotè", kle: "meni.gid_kominotè", icon: "📖" },
];

export default function Meni() {
  useLangVèsyon();
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
            <strong style={{ fontSize: 14.5 }}>{user ? user.nom : t("meni.pa_konekte")}</strong>
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
              <strong style={{ fontSize: 14, flex: 1 }}>{t(a.kle)}</strong>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          </Link>
        ))}

        <div style={{ height: 6 }} />

        <Link to="/meni/reglaj" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
            <span style={{ fontSize: 19 }}>⚙️</span>
            <strong style={{ fontSize: 14, flex: 1 }}>{t("meni.reglaj")}</strong>
            <span style={{ color: "var(--text-muted)" }}>›</span>
          </div>
        </Link>

        {user?.wòl === "admin" && (
          <Link to="/admin" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderColor: "var(--official)" }}>
              <span style={{ fontSize: 19 }}>🏛️</span>
              <strong style={{ fontSize: 14, flex: 1 }}>{t("meni.admin")}</strong>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          </Link>
        )}
      </div>
      <NavBar />
    </>
  );
}
