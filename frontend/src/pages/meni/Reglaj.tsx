import { Link, useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { clearSession, getSessionUser } from "../../api";
import { t } from "../../i18n";
import { useLangVèsyon } from "../../hooks";

const ATIKÒL = [
  { to: "/meni/reglaj/kont", kle: "reglaj.kont", icon: "👤" },
  { to: "/meni/reglaj/lang", kle: "reglaj.lang", icon: "🌐" },
  { to: "/meni/reglaj/alèt", kle: "reglaj.alèt", icon: "🔔" },
  { to: "/meni/reglaj/kat", kle: "reglaj.kat", icon: "🗺️" },
  { to: "/meni/reglaj/nouvèl", kle: "reglaj.nouvèl", icon: "ℹ️" },
  { to: "/meni/reglaj/aparans", kle: "reglaj.aparans", icon: "🎨" },
  { to: "/meni/reglaj/tèm", kle: "reglaj.tèm", icon: "📄" },
  { to: "/meni/reglaj/politik", kle: "reglaj.politik", icon: "🔒" },
];

export default function Reglaj() {
  const navigate = useNavigate();
  useLangVèsyon();
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
          ← {t("meni.tit")}
        </button>
        <h1 style={{ fontSize: 20 }}>{t("meni.reglaj")}</h1>

        {ATIKÒL.map((a) => (
          <Link key={a.to} to={a.to} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <strong style={{ fontSize: 14, flex: 1 }}>{t(a.kle)}</strong>
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
            🚪 {t("reglaj.fèmen_sesyon")}
          </button>
        )}
      </div>
      <NavBar />
    </>
  );
}
