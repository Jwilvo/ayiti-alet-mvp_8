import { Link } from "react-router-dom";
import { getSessionUser } from "../api";

export default function TopBar() {
  const user = getSessionUser();
  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot" />
        Ayiti Alèt
      </div>
      <Link to="/meni/reglaj/kont" style={{ fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none" }}>
        {user ? user.nom.split(" ")[0] : "Konekte"}
      </Link>
    </div>
  );
}
