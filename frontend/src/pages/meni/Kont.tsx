import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { api, getSessionUser, saveSession, updateSessionUser, mediaUrl, KontakIjans, CurrentUser } from "../../api";
import { nivoKonfyans } from "../../categories";

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

function FotoPwofilEditor({ user, onChanje }: { user: CurrentUser; onChanje: (u: CurrentUser) => void }) {
  const [enChaje, setEnChaje] = useState(false);
  const [erè, setErè] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function chwaziFichye(e: React.ChangeEvent<HTMLInputElement>) {
    const fichye = e.target.files?.[0];
    if (!fichye) return;
    if (!fichye.type.startsWith("image/")) {
      setErè("Chwazi yon imaj (JPEG, PNG, WEBP, GIF).");
      return;
    }
    setErè("");
    setEnChaje(true);
    try {
      const { url } = await api.uploadFile(fichye);
      const nouvoUser = await api.updateMe({ fotoPwofil: url });
      updateSessionUser(nouvoUser);
      onChanje(nouvoUser);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setEnChaje(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ position: "relative", width: 76, height: 76, margin: "0 auto 12px" }}>
      <div
        style={{
          width: 76, height: 76, borderRadius: "50%", overflow: "hidden",
          background: "var(--surface-raised)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 30, border: "1px solid var(--border)",
        }}
      >
        {user.fotoPwofil ? (
          <img src={mediaUrl(user.fotoPwofil)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          user.nom.slice(0, 1).toUpperCase()
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={enChaje}
        style={{
          position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%",
          background: "var(--official)", border: "2px solid var(--surface)", color: "white",
          fontSize: 13, cursor: "pointer",
        }}
        title="Chanje foto pwofil"
      >
        {enChaje ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "📷"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={chwaziFichye} style={{ display: "none" }} />
      {erè && <p style={{ fontSize: 11, color: "var(--urgent)", position: "absolute", top: 82, width: 200, left: "50%", transform: "translateX(-50%)" }}>{erè}</p>}
    </div>
  );
}

export default function Kont() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getSessionUser());
  const [mòd, setMòd] = useState<"login" | "register" | "bliye">("login");
  const [nonKonplè, setNonKonplè] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [dokimanTip, setDokimanTip] = useState<"" | "NIF" | "CIN" | "Paspò">("");
  const [dokimanNimewo, setDokimanNimewo] = useState("");
  const [adrèsKay, setAdrèsKay] = useState("");
  const [loading, setLoading] = useState(false);
  const [erè, setErè] = useState("");

  async function soumèt(e: React.FormEvent) {
    e.preventDefault();
    setErè("");
    if (mòd === "register" && !email.trim()) {
      setErè("Imèl obligatwa pou ka reyajiste modpas ou si w bliye l.");
      return;
    }
    setLoading(true);
    try {
      const res =
        mòd === "login"
          ? await api.login({ telefon, motDePasse })
          : await api.register({
              nom: nonKonplè,
              telefon,
              motDePasse,
              email,
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
              <FotoPwofilEditor user={user} onChanje={setUser} />
              <h2 style={{ fontSize: 18 }}>{user.nom}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: "4px 0 0" }}>{user.telefon}</p>
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--surface-raised)", padding: "6px 12px", borderRadius: 20, fontSize: 12.5 }}>
                <span>{nivoKonfyans(user.niveauKonfyans ?? 0).emoji}</span>
                <span>{nivoKonfyans(user.niveauKonfyans ?? 0).label} ({user.niveauKonfyans ?? 0} pwen)</span>
              </div>
            </div>
            <KontakIjansEditor />
          </>
        ) : mòd === "bliye" ? (
          <>
            <h1 style={{ fontSize: 20 }}>Reyajiste modpas</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
              Nou pral voye yon kòd 6 chif nan adrès imèl ou a.
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

                  <label>Adrès imèl *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="egzanp@imel.com" />
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: -8 }}>
                    Obligatwa — se sa nou itilize pou voye kòd reyajisman si w bliye modpas ou.
                  </p>

                  <label>Adrès kay (opsyonèl)</label>
                  <input value={adrèsKay} onChange={(e) => setAdrèsKay(e.target.value)} placeholder="Egzanp: Ri Kapwa, Delmas 33" />
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
