import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import NavBar from "./NavBar";

interface Props {
  tit: string;
  emoji: string;
  deskripsyon?: string;
}

export default function PajAnKonstriksyon({ tit, emoji, deskripsyon }: Props) {
  const navigate = useNavigate();
  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
          ← Retounen
        </button>
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{emoji}</div>
          <h2 style={{ fontSize: 18 }}>{tit}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 8 }}>
            {deskripsyon || "N ap travay sou fonksyon sa a — li ap vini nan yon pwochen vèsyon."}
          </p>
        </div>
      </div>
      <NavBar />
    </>
  );
}
