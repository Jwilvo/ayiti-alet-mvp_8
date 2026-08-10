import { NavLink } from "react-router-dom";
import { useRapòPaNivo } from "../alertFeed";
import { dejaLi } from "../unread";
import { useVèsyonMakè, useLangVèsyon } from "../hooks";
import { t } from "../i18n";

export default function NavBar() {
  useVèsyonMakè(); // fòse re-rann lè yon rapò make "li" pou badj yo mete ajou
  useLangVèsyon(); // fòse re-rann lè lang lan chanje

  const { lis: alèt } = useRapòPaNivo("ijans");
  const { lis: nouvèl } = useRapòPaNivo("enfòmasyon");
  const konteAlèt = alèt.filter((r) => !dejaLi(r.rapò.id)).length;
  const konteNouvèl = nouvèl.filter((r) => !dejaLi(r.rapò.id)).length;

  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="icon">🏠</span>
        {t("nav.akèy")}
      </NavLink>
      <NavLink to="/alèt" className={({ isActive }) => (isActive ? "active" : "")} style={{ position: "relative" }}>
        <span className="icon">🔔</span>
        {t("nav.alèt")}
        {konteAlèt > 0 && <span className="navbar-badj">{konteAlèt > 9 ? "9+" : konteAlèt}</span>}
      </NavLink>
      <NavLink to="/sèvis" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="icon">📍</span>
        {t("nav.sèvis")}
      </NavLink>
      <NavLink to="/nouvèl" className={({ isActive }) => (isActive ? "active" : "")} style={{ position: "relative" }}>
        <span className="icon">ℹ️</span>
        {t("nav.nouvèl")}
        {konteNouvèl > 0 && <span className="navbar-badj">{konteNouvèl > 9 ? "9+" : konteNouvèl}</span>}
      </NavLink>
      <NavLink to="/meni" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="icon">☰</span>
        {t("nav.meni")}
      </NavLink>
    </nav>
  );
}
