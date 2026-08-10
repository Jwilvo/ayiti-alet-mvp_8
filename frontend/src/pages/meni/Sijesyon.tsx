import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { api } from "../../api";

export default function Sijesyon() {
  const navigate = useNavigate();
  const [kò, setKò] = useState("");
  const [voyeAnKou, setVoyeAnKou] = useState(false);
  const [voye, setVoye] = useState(false);
  const [erè, setErè] = useState("");

  async function soumèt(e: React.FormEvent) {
    e.preventDefault();
    if (kò.trim().length < 3) return setErè("Ekri omwen kèk mo pou n konprann sijesyon w lan.");
    setErè("");
    setVoyeAnKou(true);
    try {
      await api.voyeSijesyon(kò.trim());
      setVoye(true);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setVoyeAnKou(false);
    }
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>💡 Sijesyon</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Gen yon lide pou amelyore Ayiti Alèt? Ekri l anba a — ekip la li chak sijesyon.
        </p>

        {voye ? (
          <div className="banner banner-ok">
            <strong>Mèsi pou sijesyon ou a ✔</strong>
            <p style={{ margin: "6px 0 0", fontSize: 13 }}>Nou resevwa l e n ap li l.</p>
          </div>
        ) : (
          <form onSubmit={soumèt}>
            <textarea
              rows={5}
              placeholder="Ekri sijesyon w lan isit la…"
              value={kò}
              onChange={(e) => setKò(e.target.value)}
              maxLength={1000}
            />
            {erè && <div className="banner banner-error">{erè}</div>}
            <button className="btn btn-primary btn-block" type="submit" disabled={voyeAnKou}>
              {voyeAnKou ? <span className="spinner" /> : "Voye sijesyon an"}
            </button>
          </form>
        )}
      </div>
      <NavBar />
    </>
  );
}
