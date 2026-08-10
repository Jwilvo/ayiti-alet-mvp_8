import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import IncidentMap from "../../components/IncidentMap";
import { api, LyeItilizatè, getSessionUser } from "../../api";
import { distansKm, nivoPètinans } from "../../categories";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];

export default function LyeMwYo() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [lye, setLye] = useState<LyeItilizatè[] | null>(null);
  const [ajouteMòd, setAjouteMòd] = useState(false);
  const [non, setNon] = useState("");
  const [pwen, setPwen] = useState<{ lat: number; lng: number } | null>(null);
  const [chaje, setChaje] = useState(false);
  const [erè, setErè] = useState("");
  const [konteAlèt, setKonteAlèt] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    api.listLye().then(setLye).catch((e) => setErè(e.message));
  }, [user]);

  // Pou chak lye, konte konbyen rapò aktyèlman "ijans" (< 15km) pou l — sa
  // pèmèt moun nan wè si gen aktivite kote fanmi li ye a, san l pa bezwen
  // fizikman ye la.
  useEffect(() => {
    if (!lye || lye.length === 0) return;
    api.listReports({ limit: 50 }).then((reports) => {
      const kont: Record<string, number> = {};
      for (const l of lye) {
        kont[l.id] = reports.filter((r) => {
          const d = distansKm(l.latitude, l.longitude, r.latitude, r.longitude);
          return nivoPètinans(d) === "ijans";
        }).length;
      }
      setKonteAlèt(kont);
    }).catch(() => {});
  }, [lye]);

  async function ajoute() {
    if (!non.trim() || !pwen) {
      setErè("Bay yon non e chwazi yon pozisyon sou kat la.");
      return;
    }
    setChaje(true);
    setErè("");
    try {
      const nouvo = await api.ajouteLye(non.trim(), pwen.lat, pwen.lng);
      setLye((l) => [...(l ?? []), nouvo]);
      setNon("");
      setPwen(null);
      setAjouteMòd(false);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setChaje(false);
    }
  }

  async function efase(id: string) {
    setLye((l) => l?.filter((x) => x.id !== id) ?? null);
    try {
      await api.efaseLye(id);
    } catch {
      // pa gwo zafè si sa echwe — lis la deja mete ajou lokalman
    }
  }

  if (!user) {
    return (
      <>
        <TopBar />
        <div className="screen">
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni")}>
            ← Retounen
          </button>
          <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📌</div>
            <h2 style={{ fontSize: 18 }}>Lye mw yo</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "8px 0 16px" }}>
              Konekte pou anrejistre plizyè adrès (kay, travay, fanmi) e swiv alèt pou yo.
            </p>
            <button className="btn btn-primary btn-block" onClick={() => navigate("/meni/reglaj/kont")}>
              Konekte
            </button>
          </div>
        </div>
        <NavBar />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>📌 Lye mw yo</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Anrejistre jiska 5 adrès pou wè si gen aktivite kote fanmi/travay ou ye, san w pa
          bezwen fizikman ye la.
        </p>

        {erè && <div className="banner banner-error">{erè}</div>}

        {!lye && <p className="empty">Ap chaje…</p>}
        {lye && lye.length === 0 && !ajouteMòd && <p className="empty">Ou poko gen okenn lye anrejistre.</p>}

        {lye?.map((l) => (
          <div key={l.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 14 }}>{l.non}</strong>
              <div className="report-meta">
                {konteAlèt[l.id] > 0 ? (
                  <span style={{ color: "var(--urgent)" }}>🔔 {konteAlèt[l.id]} alèt toupre</span>
                ) : (
                  "Pa gen alèt kounye a"
                )}
              </div>
            </div>
            <button className="btn btn-ghost" style={{ padding: "8px 10px" }} onClick={() => efase(l.id)}>✕</button>
          </div>
        ))}

        {ajouteMòd ? (
          <div className="card">
            <label>Non lye a</label>
            <input value={non} onChange={(e) => setNon(e.target.value)} placeholder="Egzanp: Kay Manman" />
            <label>Peze sou kat la pou chwazi pozisyon an</label>
            <IncidentMap
              center={pwen ? [pwen.lat, pwen.lng] : PÒTOPRENS_CENTER}
              zoom={12}
              height={200}
              pickedLocation={pwen}
              onPickLocation={(lat, lng) => setPwen({ lat, lng })}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAjouteMòd(false)}>
                Anile
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={ajoute} disabled={chaje}>
                {chaje ? <span className="spinner" /> : "Sove"}
              </button>
            </div>
          </div>
        ) : (
          (lye?.length ?? 0) < 5 && (
            <button className="btn btn-ghost btn-block" onClick={() => setAjouteMòd(true)}>
              + Ajoute yon lye
            </button>
          )
        )}
      </div>
      <NavBar />
    </>
  );
}
