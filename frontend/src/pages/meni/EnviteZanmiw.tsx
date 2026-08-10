import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";

const MESAJ = "Ayiti Alèt — yon aplikasyon pou rapòte ijans e rete konekte ak kominote w. Enstale l:";

export default function EnviteZanmiw() {
  const navigate = useNavigate();
  const [kopye, setKopye] = useState(false);
  const lyen = window.location.origin;

  async function pataje() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ayiti Alèt", text: MESAJ, url: lyen });
      } catch {
        // moun nan anile pataj la — pa gwo zafè
      }
    } else {
      kopyeLyen();
    }
  }

  async function kopyeLyen() {
    try {
      await navigator.clipboard.writeText(`${MESAJ} ${lyen}`);
      setKopye(true);
      setTimeout(() => setKopye(false), 2500);
    } catch {
      // ignore — navigatè a ka refize aksè clipboard san HTTPS
    }
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni")}>
          ← Retounen
        </button>
        <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✉️</div>
          <h2 style={{ fontSize: 18 }}>Envite zanmi ak fanmi w</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "8px 0 20px" }}>
            Plis moun itilize Ayiti Alèt, plis kominote a an sekirite — chak moun ki ajoute a
            veye pou tout moun.
          </p>
          <button className="btn btn-primary btn-block" onClick={pataje}>
            📤 Pataje lyen an
          </button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={kopyeLyen}>
            {kopye ? "Kopye ✔" : "🔗 Kopye lyen an"}
          </button>
        </div>
      </div>
      <NavBar />
    </>
  );
}
