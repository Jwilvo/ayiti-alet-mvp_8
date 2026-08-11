import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { api, getSessionUser, saveSession, KontakIjans } from "../../api";

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

function BliyeModPas({ onFini }: { onFini: () => void }) {
  const [etap, setEtap] = useState<"mande" | "konfime">("mande");
  const [telefon, setTelefon] = useState("");
  const [kòd, setKòd] = useState("");
  const [nouvoModDePasse, setNouvoModDePasse] = useState("");
  const [chaje, setChaje] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [erè, setErè] = useState("");

  async function mande(e: React.FormEvent) {
    e.preventDefault();
    setChaje(true);
    setErè("");
    try {
      const res = await api.mandeReyajisman(telefon);
      setMesaj(res.mesaj);
      setEtap("konfime");
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setChaje(false);
    }
  }

  async function konfime(e: React.FormEvent) {
    e.preventDefault();
    setChaje(true);
    setErè("");
    try {
      await api.konfimeReyajisman(telefon, kòd, nouvoModDePasse);
      onFini();
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setChaje(false);
    }
  }

  if (etap === "mande") {
    return (
      <form onSubmit={mande}>
        <label>Nimewo telefòn kont ou a</label>
        <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="50937000000" />
        {erè && <div className="banner banner-error">{erè}</div>}
        <button className="btn btn-primary btn-block" type="submit" disabled={chaje}>
          {chaje ? <span className="spinner" /> : "Voye kòd reyajisman"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={konfime}>
      <div className="banner banner-ok">{mesaj}</div>
      <label>Kòd 6 chif ou resevwa a</label>
      <input value={kòd} onChange={(e) => setKòd(e.target.value)} placeholder="123456" maxLength={6} />
      <label>Nouvo modpas</label>
      <input type="password" value={nouvoModDePasse} onChange={(e) => setNouvoModDePasse(e.target.value)} placeholder="Omwen 6 karaktè" />
      {erè && <div className="banner banner-error">{erè}</div>}
      <button className="btn btn-primary btn-block" type="submit" disabled={chaje}>
        {chaje ? <span className="spinner" /> : "Chanje modpas la"}
      </button>
    </form>
  );
}

export default function Kont() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSessionUser());
  const [mòd, setMòd] = useState<"login" | "register" | "bliye">("login");
  const [nom, setNom] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nonKonplè, setNonKonplè] = useState("");
  const [dokimanTip, setDokimanTip] = useState<"" | "NIF" | "CIN" | "Paspò">("");
  const [dokimanNimewo, setDokimanNimewo] = useState("");
  const [adrèsKay, setAdrèsKay] = useState("");
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
          : await api.register({
              nom,
              telefon,
              motDePasse,
              email: email || undefined,
              nonKonplè: nonKonplè || undefined,
              dokimanTip: dokimanTip || undefined,
              dokimanNimewo: dokimanNimewo || undefined,
              adrèsKay: adrèsKay || undefined,
            });
      saveSession(res.token, res.user);
      setUser(res.user);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni/reglaj")}>
          ← Retounen
        </button>

        {user ? (
          <>
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
              <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "4px 0 0" }}>{user.telefon}</p>
            </div>
            <KontakIjansEditor />
          </>
        ) : mòd === "bliye" ? (
          <>
            <h1 style={{ fontSize: 20 }}>Reyajiste modpas</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
              Nou pral voye yon kòd 6 chif nan nimewo telefòn ou a pa SMS.
            </p>
            <BliyeModPas onFini={() => setMòd("login")} />
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => setMòd("login")}>
              ← Retounen nan koneksyon
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 20 }}>{mòd === "login" ? "Konekte" : "Kreye yon kont"}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
              Ou pa oblije gen yon kont pou fè yon rapò anonim, men yon kont pèmèt ou konfime
              rapò ak mete kontak ijans pou SOS.
            </p>

            <form onSubmit={soumèt}>
              {mòd === "register" && (
                <>
                  <label>Non ki afiche (surnom oswa ti non)</label>
                  <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Egzanp: Jan" />

                  <label>Non konplè (jan li ekri sou dokiman ofisyèl)</label>
                  <input value={nonKonplè} onChange={(e) => setNonKonplè(e.target.value)} placeholder="Jan Batis Pyè" />

                  <label>Tip dokiman idantite</label>
                  <select value={dokimanTip} onChange={(e) => setDokimanTip(e.target.value as any)}>
                    <option value="">— Chwazi —</option>
                    <option value="NIF">NIF</option>
                    <option value="CIN">CIN</option>
                    <option value="Paspò">Paspò</option>
                  </select>

                  {dokimanTip && (
                    <>
                      <label>Nimewo {dokimanTip} la</label>
                      <input value={dokimanNimewo} onChange={(e) => setDokimanNimewo(e.target.value)} placeholder="Nimewo dokiman an" />
                    </>
                  )}

                  <label>Adrès kay (opsyonèl)</label>
                  <input value={adrèsKay} onChange={(e) => setAdrèsKay(e.target.value)} placeholder="Egzanp: Ri Kapwa, Delmas 33" />

                  <label>Adrès imèl (opsyonèl)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="egzanp@imèl.com" />
                </>
              )}
              <label>Nimewo telefòn</label>
              <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="50937000000" />
              <label>Modpas</label>
              <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="••••••••" />
              {mòd === "register" && (
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: -8 }}>
                  Omwen 8 karaktè, ak yon majiskil, yon chif, ak yon karaktè espesyal (egzanp: Sekrè123!)
                </p>
              )}

              {erè && <div className="banner banner-error">{erè}</div>}

              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : mòd === "login" ? "Konekte" : "Kreye kont lan"}
              </button>
            </form>

            {mòd === "login" && (
              <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => setMòd("bliye")}>
                Bliye modpas ou?
              </button>
            )}

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
          </>
        )}
      </div>
      <NavBar />
    </>
  );
}
