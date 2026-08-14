import { Link } from "react-router-dom";
import { getSessionUser, mediaUrl } from "../api";
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
      <Link
        to="/meni/reglaj/kont"
        style={{ fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
      >
        {user?.fotoPwofil && (
          <img
            src={mediaUrl(user.fotoPwofil)}
            alt=""
            style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }}
          />
        )}
        {user ? user.nom.split(" ")[0] : t("topbar.konekte")}
      </Link>
    </div>
  );
}
