import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { api, clearSession, getSessionUser, saveSession, KontakIjans } from "../api";

function KontakIjansEditor() {
  const [kontak, setKontak] = useState<KontakIjans[]>([]);
  const [chaje, setChaje] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    api.getKontakIjans().then(setKontak).catch(() => {});
  }, []);

  function ajoute() {
    if (kontak.length >= 5) return;
    setKontak([...kontak, { non: "", telefon: "" }]);
  }

  function chanje(i: number, chan: Partial<KontakIjans>) {
    setKontak(kontak.map((k, idx) => (idx === i ? { ...k, ...chan } : k)));
  }

  function retire(i: number) {
    setKontak(kontak.filter((_, idx) => idx !== i));
  }

  async function sove() {
    setChaje(true);
    setMesaj("");
    try {
      const valid = kontak.filter((k) => k.non.trim() && k.telefon.trim());
      const res = await api.setKontakIjans(valid);
      setKontak(res);
      setMesaj("Kontak yo sove ✔");
    } catch (e: any) {
      setMesaj(e.message);
    } finally {
      setChaje(false);
    }
  }

  return (
    <>
      <div className="section-title"><h2>Kontak ijans</h2></div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: -6 }}>
        Moun sa yo ap ka resevwa yon lyen pou swiv pozisyon w si ou deklanche yon SOS.
      </p>
      {kontak.map((k, i) => (
        <div key={i} className="card" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <input placeholder="Non" value={k.non} onChange={(e) => chanje(i, { non: e.target.value })} style={{ marginBottom: 6 }} />
            <input placeholder="Nimewo telefòn" value={k.telefon} onChange={(e) => chanje(i, { telefon: e.target.value })} style={{ marginBottom: 0 }} />
          </div>
          <button className="btn btn-ghost" style={{ padding: "8px 10px" }} onClick={() => retire(i)}>✕</button>
        </div>
      ))}
      {kontak.length < 5 && (
        <button className="btn btn-ghost btn-block" onClick={ajoute} style={{ marginBottom: 10 }}>+ Ajoute yon kontak</button>
      )}
      {mesaj && <div className="banner banner-ok">{mesaj}</div>}
      <button className="btn btn-primary btn-block" onClick={sove} disabled={chaje}>
        {chaje ? <span className="spinner" /> : "Sove kontak yo"}
      </button>
    </>
  );
}

export default function Profile() {
  const [user, setUser] = useState(getSessionUser());
  const [mòd, setMòd] = useState<"login" | "register">("login");
  const [nom, setNom] = useState("");
  const [telefon, setTelefon] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [komin, setKomin] = useState("");
  const [loading, setLoading] = useState(false);
  const [erè, setErè] = useState("");

  async function soumèt(e: React.FormEvent) {
    e.preventDefault();
    setErè("");
    setLoading(true);
    try {
      const res =
        mòd === "login"
          ? await api.login({ telefon, motDePasse })
          : await api.register({ nom, telefon, motDePasse, komin: komin || undefined });
      saveSession(res.token, res.user);
      setUser(res.user);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setLoading(false);
    }
  }

  function dekonekte() {
    clearSession();
    setUser(null);
  }

  if (user) {
    return (
      <>
        <TopBar />
        <div className="screen">
          <div className="card" style={{ textAlign: "center", padding: "26px 16px" }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
                background: "var(--surface-raised)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 26, border: "1px solid var(--border)",
              }}
            >
              {user.nom.slice(0, 1).toUpperCase()}
            </div>
            <h2 style={{ fontSize: 18 }}>{user.nom}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "4px 0 0" }}>
              {user.telefon}{user.komin ? ` · ${user.komin}` : ""}
            </p>
          </div>

          <KontakIjansEditor />

          <button className="btn btn-ghost btn-block" onClick={dekonekte} style={{ marginTop: 16 }}>
            Dekonekte
          </button>
        </div>
        <NavBar />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <h1 style={{ fontSize: 20 }}>{mòd === "login" ? "Konekte" : "Kreye yon kont"}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Ou pa oblije gen yon kont pou fè yon rapò anonim, men yon kont pèmèt ou konfime rapò, mete kontak
          ijans pou SOS, ak swiv istorik ou.
        </p>

        <form onSubmit={soumèt}>
          {mòd === "register" && (
            <>
              <label>Non konplè</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Non ou" />
              <label>Komin</label>
              <input value={komin} onChange={(e) => setKomin(e.target.value)} placeholder="Egzanp: Delmas" />
            </>
          )}
          <label>Nimewo telefòn</label>
          <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="50937000000" />
          <label>Modpas</label>
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="••••••••" />

          {erè && <div className="banner banner-error">{erè}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : mòd === "login" ? "Konekte" : "Kreye kont lan"}
          </button>
        </form>

        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 10 }}
          onClick={() => setMòd(mòd === "login" ? "register" : "login")}
        >
          {mòd === "login" ? "Mwen pa gen kont — Kreye youn" : "Mwen gen yon kont deja — Konekte"}
        </button>

        {mòd === "login" && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 14 }}>
            Kont demo: 50937000000 / demo1234
          </p>
        )}
      </div>
      <NavBar />
    </>
  );
}
