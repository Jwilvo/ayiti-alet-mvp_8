import { useEffect, useState, ReactNode } from "react";
import { api, AdminStats, DuplicateGroup, Report, getSessionUser, saveSession, clearSession } from "../api";
import { categoryMeta, timeAgo } from "../categories";

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
