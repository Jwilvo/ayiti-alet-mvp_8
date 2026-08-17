import { useEffect, useState, ReactNode } from "react";
import { api, AdminStats, AdminTandans, DuplicateGroup, Report, IjansAdmin, IjansRapò, getSessionUser, saveSession, clearSession } from "../api";
import { categoryMeta, timeAgo, severityColor } from "../categories";
import IncidentMap from "../components/IncidentMap";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, overflowY: "auto", background: "var(--bg)", zIndex: 50 }}>
      {children}
    </div>
  );
}

function AdminLogin({ onIn }: { onIn: () => void }) {
  const [telefon, setTelefon] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [erè, setErè] = useState("");

  async function soumèt(e: React.FormEvent) {
    e.preventDefault();
    setErè("");
    setLoading(true);
    try {
      const res = await api.login({ telefon, motDePasse });
      if (res.user.wòl !== "admin") {
        setErè("Kont sa a pa gen aksè administrasyon.");
        return;
      }
      saveSession(res.token, res.user);
      onIn();
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 20px" }}>
        <h1 style={{ fontSize: 22 }}>Panèl Administrasyon</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>
          Rezève pou kont otorite/administratè (PNH, Pwoteksyon Sivil, Mairi, elatriye).
        </p>
        <form onSubmit={soumèt}>
          <label>Nimewo telefòn</label>
          <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="50900000000" />
          <label>Modpas</label>
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          {erè && <div className="banner banner-error">{erè}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" /> : "Konekte"}
          </button>
        </form>
        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 14 }}>
          Kont demo: 50900000000 / admin1234
        </p>
      </div>
    </Shell>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "14px 8px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function OtoritePanel() {
  const [lis, setLis] = useState<{ id: string; nom: string; telefon: string; wòl: string; zònResponsabilite: string | null; reyonMaksKm: number | null }[] | null>(null);
  const [wòlEnfo, setWòlEnfo] = useState<Record<string, { label: string; reyonMaksKm: number | null; mandeZòn: boolean }> | null>(null);
  const [erè, setErè] = useState("");
  const [mesaj, setMesaj] = useState("");

  const [telefonChèche, setTelefonChèche] = useState("");
  const [itilizatèChèche, setItilizatèChèche] = useState<{ id: string; nom: string; telefon: string } | null>(null);
  const [chaje, setChaje] = useState(false);
  const [nouvoWòl, setNouvoWòl] = useState("kazèk");
  const [nouvoZòn, setNouvoZòn] = useState("");
  const [asiyeAnKou, setAsiyeAnKou] = useState(false);

  function chajeLis() {
    api.adminListOtorite().then(setLis).catch((e) => setErè(e.message));
  }
  useEffect(() => {
    chajeLis();
    api.adminOtoriteWòlEnfo().then(setWòlEnfo).catch(() => {});
  }, []);

  async function chèche() {
    if (!telefonChèche.trim()) return;
    setChaje(true);
    setErè("");
    setMesaj("");
    setItilizatèChèche(null);
    try {
      const res = await api.adminChècheItilizatè(telefonChèche.trim());
      setItilizatèChèche(res);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setChaje(false);
    }
  }

  async function asiye() {
    if (!itilizatèChèche) return;
    setAsiyeAnKou(true);
    setErè("");
    try {
      await api.adminAsiyeWòl(itilizatèChèche.id, nouvoWòl, nouvoZòn || undefined);
      setMesaj(`${itilizatèChèche.nom} kounye a "${wòlEnfo?.[nouvoWòl]?.label ?? nouvoWòl}".`);
      setItilizatèChèche(null);
      setTelefonChèche("");
      setNouvoZòn("");
      chajeLis();
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setAsiyeAnKou(false);
    }
  }

  return (
    <>
      <div className="section-title"><h2>🏛️ Jesyon Otorite</h2></div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -6 }}>
        Wè ki moun genyen ki wòl enstitisyonèl, ki zòn yo responsab, ak limit reyon otomatik
        pou chak wòl. Sèlman kont "admin" jeneral ka asiye wòl.
      </p>

      {wòlEnfo && (
        <div className="card">
          <strong style={{ fontSize: 13 }}>Limit reyon pa wòl</strong>
          {Object.entries(wòlEnfo).filter(([k]) => k !== "sitwayen").map(([k, v]) => (
            <div key={k} className="report-meta" style={{ marginTop: 4 }}>
              {v.label}: {v.reyonMaksKm === null ? "nasyonal (san limit)" : `${v.reyonMaksKm}km maksimòm`}
              {v.mandeZòn && " · mande yon zòn"}
            </div>
          ))}
        </div>
      )}

      {erè && <div className="banner banner-error">{erè}</div>}
      {mesaj && <div className="banner banner-ok">{mesaj}</div>}

      <div className="section-title"><h2 style={{ fontSize: 14 }}>Asiye yon wòl</h2></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Nimewo telefòn"
          value={telefonChèche}
          onChange={(e) => setTelefonChèche(e.target.value)}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button className="btn btn-primary" onClick={chèche} disabled={chaje} style={{ padding: "0 16px" }}>
          {chaje ? <span className="spinner" /> : "Chèche"}
        </button>
      </div>

      {itilizatèChèche && (
        <div className="card">
          <strong style={{ fontSize: 14 }}>{itilizatèChèche.nom}</strong>
          <div className="report-meta">{itilizatèChèche.telefon}</div>

          <label>Nouvo wòl</label>
          <select value={nouvoWòl} onChange={(e) => setNouvoWòl(e.target.value)}>
            {wòlEnfo && Object.entries(wòlEnfo).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {wòlEnfo?.[nouvoWòl]?.mandeZòn && (
            <>
              <label>Zòn responsabilite (egzanp non komin/seksyon kominal)</label>
              <input value={nouvoZòn} onChange={(e) => setNouvoZòn(e.target.value)} placeholder="Egzanp: Ench, 3yèm Seksyon Kominal" />
            </>
          )}

          <button className="btn btn-primary btn-block" onClick={asiye} disabled={asiyeAnKou} style={{ marginTop: 10 }}>
            {asiyeAnKou ? <span className="spinner" /> : "Konfime asiyasyon"}
          </button>
        </div>
      )}

      <div className="section-title"><h2 style={{ fontSize: 14 }}>Tout otorite yo ({lis?.length ?? 0})</h2></div>
      {lis?.map((u) => (
        <div key={u.id} className="card">
          <strong style={{ fontSize: 14 }}>{u.nom}</strong>
          <div className="report-meta">
            {u.telefon} · {wòlEnfo?.[u.wòl]?.label ?? u.wòl}
            {u.reyonMaksKm !== null ? ` · ${u.reyonMaksKm}km` : " · nasyonal"}
          </div>
          {u.zònResponsabilite && <div className="report-meta">📍 {u.zònResponsabilite}</div>}
        </div>
      ))}
    </>
  );
}

function JesyonKontPanel() {
  const [telefon, setTelefon] = useState("");
  const [chaje, setChaje] = useState(false);
  const [erè, setErè] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [itilizatè, setItilizatè] = useState<{ id: string; nom: string; telefon: string; email: string | null; kreyeNan: string; genDokiman: boolean } | null>(null);
  const [libereAnKou, setLibereAnKou] = useState(false);
  const [konfimasyon, setKonfimasyon] = useState(false);

  async function chèche() {
    if (!telefon.trim()) return;
    setChaje(true);
    setErè("");
    setMesaj("");
    setItilizatè(null);
    setKonfimasyon(false);
    try {
      const res = await api.adminChècheItilizatè(telefon.trim());
      setItilizatè(res);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setChaje(false);
    }
  }

  async function libere() {
    if (!itilizatè) return;
    setLibereAnKou(true);
    try {
      const res = await api.adminLibereItilizatè(itilizatè.id);
      setMesaj(res.mesaj);
      setItilizatè(null);
      setKonfimasyon(false);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setLibereAnKou(false);
    }
  }

  return (
    <>
      <div className="section-title"><h2>🔓 Jesyon Kont (Sipò)</h2></div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -6 }}>
        Pou moun ki pèdi aksè a imèl yo e ki bloke — chèche kont yo pa telefòn, "libere"
        nimewo telefòn/dokiman idantite a pou yo ka kreye yon nouvo kont ak yon lòt imèl.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Nimewo telefòn"
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button className="btn btn-primary" onClick={chèche} disabled={chaje} style={{ padding: "0 16px" }}>
          {chaje ? <span className="spinner" /> : "Chèche"}
        </button>
      </div>

      {erè && <div className="banner banner-error">{erè}</div>}
      {mesaj && <div className="banner banner-ok">{mesaj}</div>}

      {itilizatè && (
        <div className="card">
          <strong style={{ fontSize: 14 }}>{itilizatè.nom}</strong>
          <div className="report-meta">{itilizatè.telefon} · {itilizatè.email || "pa gen imèl"}</div>
          <div className="report-meta">Kreye: {new Date(itilizatè.kreyeNan).toLocaleDateString()} · {itilizatè.genDokiman ? "gen dokiman idantite" : "pa gen dokiman"}</div>

          {!konfimasyon ? (
            <button className="btn btn-urgent btn-block" style={{ marginTop: 10 }} onClick={() => setKonfimasyon(true)}>
              🔓 Libere kont sa a
            </button>
          ) : (
            <>
              <p style={{ fontSize: 12.5, color: "var(--urgent)", margin: "10px 0 8px" }}>
                Ou asirè? Sa efase modpas, imèl, ak dokiman idantite kont sa a nèt. Aksyon sa a PA ka defèt.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setKonfimasyon(false)}>Anile</button>
                <button className="btn btn-urgent" style={{ flex: 1 }} onClick={libere} disabled={libereAnKou}>
                  {libereAnKou ? <span className="spinner" /> : "Konfime Libere"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function IjansPanel() {
  const [lis, setLis] = useState<IjansAdmin[] | null>(null);
  const [mòd, setMòd] = useState(false);
  const [tit, setTit] = useState("");
  const [deskripsyon, setDeskripsyon] = useState("");
  const [pwen, setPwen] = useState<{ lat: number; lng: number } | null>(null);
  const [reyonKm, setReyonKm] = useState(10);
  const [chaje, setChaje] = useState(false);
  const [erè, setErè] = useState("");
  const [rapòOuvri, setRapòOuvri] = useState<string | null>(null);
  const [rapòDone, setRapòDone] = useState<IjansRapò | null>(null);
  const [rapòChaje, setRapòChaje] = useState(false);
  const [wòlInfo, setWòlInfo] = useState<{ wòl: string | null; reyonMaks: number | null } | null>(null);

  function chajeLis() {
    api.adminListIjans().then(setLis).catch((e) => setErè(e.message));
  }
  useEffect(chajeLis, []);
  useEffect(() => {
    api.ijansMwenWòl().then((info) => {
      setWòlInfo(info);
      if (info.reyonMaks !== null) setReyonKm(Math.min(reyonKm, info.reyonMaks));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deklare() {
    if (!tit.trim() || !pwen) {
      setErè("Bay yon tit e chwazi yon sant sou kat la.");
      return;
    }
    setChaje(true);
    setErè("");
    try {
      await api.adminDeklareIjans({ tit: tit.trim(), deskripsyon: deskripsyon || undefined, latitude: pwen.lat, longitude: pwen.lng, reyonKm });
      setTit("");
      setDeskripsyon("");
      setPwen(null);
      setMòd(false);
      chajeLis();
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setChaje(false);
    }
  }

  async function dezaktive(id: string) {
    await api.adminDezaktiveIjans(id).catch(() => {});
    chajeLis();
  }

  async function wèRapò(id: string) {
    if (rapòOuvri === id) {
      setRapòOuvri(null);
      return;
    }
    setRapòOuvri(id);
    setRapòDone(null);
    setRapòChaje(true);
    try {
      const d = await api.ijansRapò(id);
      setRapòDone(d);
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setRapòChaje(false);
    }
  }

  return (
    <>
      <div className="section-title"><h2>🆘 Ijans deklare</h2></div>

      {erè && <div className="banner banner-error">{erè}</div>}

      {lis?.filter((i) => i.aktif).map((i) => (
        <div key={i.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 14 }}>{i.tit}</strong>
              <div className="report-meta">
                {i.reyonKm}km · {i.konteAnSekirite}/{i.konteNotifye} an sekirite
                {i.konteBezwenÈd > 0 && (
                  <span style={{ color: "var(--urgent)", fontWeight: 700 }}> · {i.konteBezwenÈd} bezwen èd 🆘</span>
                )}
              </div>
            </div>
            <button className="btn btn-ghost" style={{ padding: "7px 10px", fontSize: 12 }} onClick={() => dezaktive(i.id)}>
              Dezaktive
            </button>
          </div>
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10, padding: "7px 10px", fontSize: 12.5 }}
            onClick={() => wèRapò(i.id)}
          >
            {rapòOuvri === i.id ? "▲ Kache rapò a" : "▼ Wè rapò detaye"}
          </button>

          {rapòOuvri === i.id && (
            <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              {rapòChaje && <p className="empty" style={{ padding: 0 }}>Ap chaje rapò a…</p>}
              {rapòDone && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 12.5, color: "var(--calm)" }}>
                      ✔ An sekirite ({rapòDone.anSekirite.length})
                    </strong>
                    {rapòDone.anSekirite.length === 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Pèsonn poko reponn.</p>
                    )}
                    {rapòDone.anSekirite.map((m) => (
                      <div key={m.userId} style={{ fontSize: 12.5, padding: "4px 0" }}>
                        {m.nom} — {m.telefon}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 12.5, color: "var(--urgent)" }}>
                      🆘 Bezwen èd ({rapòDone.bezwenÈd.length})
                    </strong>
                    {rapòDone.bezwenÈd.length === 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Pèsonn pa siyale yo bezwen èd.</p>
                    )}
                    {rapòDone.bezwenÈd.map((m) => (
                      <div key={m.userId} style={{ fontSize: 12.5, padding: "4px 0", color: "var(--urgent)", fontWeight: 600 }}>
                        {m.nom} — {m.telefon}
                      </div>
                    ))}
                  </div>
                  <div>
                    <strong style={{ fontSize: 12.5, color: "var(--amber)" }}>
                      ⚠ Poko reponn ({rapòDone.pokoReponn.length})
                    </strong>
                    {rapòDone.pokoReponn.length === 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Tout moun reponn ✔</p>
                    )}
                    {rapòDone.pokoReponn.map((m) => (
                      <div key={m.userId} style={{ fontSize: 12.5, padding: "4px 0" }}>
                        {m.nom} — {m.telefon}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {wòlInfo?.wòl && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -8, marginBottom: 12 }}>
          Wòl ou: <strong>{wòlInfo.wòl}</strong> —{" "}
          {wòlInfo.reyonMaks === null
            ? "ou ka voye alèt nasyonal, san limit reyon."
            : `limite a yon reyon maksimòm ${wòlInfo.reyonMaks}km.`}
        </p>
      )}

      {mòd ? (
        <div className="card">
          <label>Tit ijans lan</label>
          <input value={tit} onChange={(e) => setTit(e.target.value)} placeholder="Egzanp: Siklòn Fyona" />
          <label>Deskripsyon (opsyonèl)</label>
          <input value={deskripsyon} onChange={(e) => setDeskripsyon(e.target.value)} placeholder="Detay siplemantè" />
          <label>Peze sou kat la pou chwazi sant zòn ijans lan</label>
          <IncidentMap
            center={pwen ? [pwen.lat, pwen.lng] : [18.9712, -72.2852]}
            zoom={7}
            height={200}
            pickedLocation={pwen}
            onPickLocation={(lat, lng) => setPwen({ lat, lng })}
          />
          <label>Reyon (km){wòlInfo?.reyonMaks !== null && wòlInfo?.reyonMaks !== undefined && ` — maksimòm ${wòlInfo.reyonMaks}km pou wòl ou`}</label>
          <input
            type="number"
            value={reyonKm}
            onChange={(e) => setReyonKm(Number(e.target.value))}
            min={1}
            max={wòlInfo?.reyonMaks ?? 500}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMòd(false)}>Anile</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={deklare} disabled={chaje}>
              {chaje ? <span className="spinner" /> : "Deklare ijans lan"}
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-urgent btn-block" onClick={() => setMòd(true)} style={{ marginBottom: 24 }}>
          + Deklare yon nouvo ijans
        </button>
      )}
    </>
  );
}

function TandansPanel() {
  const [tandans, setTandans] = useState<AdminTandans | null>(null);

  useEffect(() => {
    api.adminTandans().then(setTandans).catch(() => {});
  }, []);

  if (!tandans) return null;

  const maksPaJou = Math.max(1, ...tandans.paJou.map((j) => j.n));
  const maksPaLè = Math.max(1, ...tandans.paLè.map((l) => l.n));
  const lèMap = Object.fromEntries(tandans.paLè.map((l) => [l.lè, l.n]));

  return (
    <>
      <div className="section-title"><h2>📈 Rapò sou 7 dènye jou</h2></div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
          {tandans.paJou.map((j) => (
            <div key={j.jou} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: `${Math.max(4, (j.n / maksPaJou) * 70)}px`,
                  background: "var(--official)",
                  borderRadius: "4px 4px 0 0",
                  marginBottom: 4,
                }}
                title={`${j.n} rapò`}
              />
              <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{j.jou.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title"><h2>🕐 Rapò pa lè jounen an</h2></div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 70 }}>
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              style={{
                flex: 1,
                height: `${Math.max(3, ((lèMap[h] ?? 0) / maksPaLè) * 60)}px`,
                background: "var(--amber)",
                borderRadius: "2px 2px 0 0",
              }}
              title={`${h}h — ${lèMap[h] ?? 0} rapò`}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>0h</span>
          <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>12h</span>
          <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>23h</span>
        </div>
      </div>

      <div className="section-title"><h2>🗺️ Kat chalè ensidan yo</h2></div>
      <IncidentMap
        center={[18.9712, -72.2852]}
        zoom={8}
        height={260}
        markers={tandans.kèdKat.map((k, i) => ({
          id: String(i),
          lat: k.latitude,
          lng: k.longitude,
          color: severityColor(k.niveauIjans),
          label: k.niveauIjans,
        }))}
      />
    </>
  );
}

function Dashboard({ onOut }: { onOut: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[] | null>(null);
  const [tab, setTab] = useState<"nouvo" | "verifye" | "rejte" | "tout">("nouvo");
  const [erè, setErè] = useState("");

  function chaje() {
    api.adminStats().then(setStats).catch((e) => setErè(e.message));
    api
      .adminListReports(tab === "tout" ? {} : { statut: tab })
      .then(setReports)
      .catch((e) => setErè(e.message));
    api.adminDuplicates().then(setDuplicates).catch(() => {});
  }

  useEffect(chaje, [tab]);

  async function ajiSouRapò(id: string, statut: string) {
    await api.adminSetStatut(id, statut);
    chaje();
  }

  return (
    <Shell>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, marginBottom: 2 }}>Panèl Administrasyon</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>{getSessionUser()?.nom}</p>
          </div>
          <button className="btn btn-ghost" onClick={onOut}>Dekonekte</button>
        </div>

        {erè && <div className="banner banner-error">{erè}</div>}

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
            <StatCard label="Total rapò" value={stats.totalRapò} />
            <StatCard label="Nouvo" value={stats.parStatut.nouvo ?? 0} />
            <StatCard label="Verifye" value={stats.parStatut.verifye ?? 0} />
            <StatCard label="Itilizatè" value={stats.totalItilizatè} />
          </div>
        )}

        {duplicates && duplicates.length > 0 && (
          <div className="card" style={{ borderColor: "rgba(245,166,35,0.4)", background: "var(--amber-dim)", marginBottom: 24 }}>
            <strong style={{ color: "var(--amber)" }}>⚠ {duplicates.length} gwoup rapò posib doub</strong>
            <p style={{ fontSize: 13, margin: "6px 0 0", color: "#e8c98a" }}>
              AI a jwenn rapò ki gen menm kategori, tou pre youn ak lòt, e ki kreye nan menm ti tan an —
              revize yo pou evite doub konte yon menm ensidan.
            </p>
            {duplicates.map((g, i) => (
              <div key={i} style={{ marginTop: 10, fontSize: 13 }}>
                <strong>{g.rapò.length} rapò</strong> · {g.distansMèt}m apa · {g.ekarMinit} min apa
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {g.rapò.map((r) => <li key={r.id}>{r.tit}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        <OtoritePanel />

        <JesyonKontPanel />

        <IjansPanel />

        <TandansPanel />

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {(["nouvo", "verifye", "rejte", "tout"] as const).map((t) => (
            <button
              key={t}
              className="btn btn-ghost"
              style={{
                padding: "8px 14px",
                fontSize: 13,
                borderColor: tab === t ? "var(--official)" : "var(--border)",
                color: tab === t ? "var(--text)" : "var(--text-muted)",
              }}
              onClick={() => setTab(t)}
            >
              {t === "nouvo" ? "Nouvo" : t === "verifye" ? "Verifye" : t === "rejte" ? "Rejte" : "Tout"}
            </button>
          ))}
        </div>

        {!reports && <p className="empty">Ap chaje…</p>}
        {reports && reports.length === 0 && <p className="empty">Pa gen rapò nan kategori sa a.</p>}

        {reports?.map((r) => {
          const meta = categoryMeta(r.kategori);
          return (
            <div key={r.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div className="report-icon">{meta.emoji}</div>
                  <div>
                    <strong style={{ fontSize: 14 }}>{r.tit}</strong>
                    <div className="report-meta">
                      {meta.label} · {r.adrès || "Kote pa presize"} · {timeAgo(r.kreyeNan)}
                      {r.komin && ` · ${r.komin}`}
                    </div>
                  </div>
                </div>
                <span className={`tag tag-${r.niveauIjans}`}>{r.niveauIjans}</span>
              </div>
              <p style={{ fontSize: 13.5, margin: "10px 0" }}>{r.deskripsyon}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} onClick={() => ajiSouRapò(r.id, "verifye")}>
                  ✔ Verifye
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} onClick={() => ajiSouRapò(r.id, "rejte")}>
                  ✕ Rejte
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} onClick={() => ajiSouRapò(r.id, "rezolu")}>
                  ⚑ Rezolu
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

export default function Admin() {
  const [user, setUser] = useState(getSessionUser());

  const isAdmin = user?.wòl === "admin";

  if (!isAdmin) {
    return <AdminLogin onIn={() => setUser(getSessionUser())} />;
  }

  return (
    <Dashboard
      onOut={() => {
        clearSession();
        setUser(null);
      }}
    />
  );
}
