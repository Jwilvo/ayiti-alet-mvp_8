import { Link } from "react-router-dom";
import { getSessionUser } from "../api";
import { t } from "../i18n";
import { useLangVèsyon } from "../hooks";

export default function TopBar() {
  useLangVèsyon();
  const user = getSessionUser();
  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot" />
        Ayiti Alèt
      </div>
      <Link to="/meni/reglaj/kont" style={{ fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none" }}>
        {user ? user.nom.split(" ")[0] : t("topbar.konekte")}
      </Link>
    </div>
  );
}
