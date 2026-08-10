import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { useRapòPaNivo } from "../alertFeed";
import { dejaLi, markeLi } from "../unread";
import { categoryMeta, timeAgo } from "../categories";

export default function Nouvèl() {
  const { lis, chaje } = useRapòPaNivo("enfòmasyon");
  const [endèks, setEndèks] = useState(0);
  const navigate = useNavigate();

  const pokoLi = lis.filter((r) => !dejaLi(r.rapò.id));
  const aktyèl = pokoLi[endèks];

  function swivan() {
    if (aktyèl) markeLi(aktyèl.rapò.id);
    setEndèks((i) => i + 1);
  }

  if (!chaje) {
    return (
      <>
        <TopBar />
        <div className="screen"><p className="empty">Ap chaje nouvèl yo…</p></div>
        <NavBar />
      </>
    );
  }

  if (lis.length === 0) {
    return (
      <>
        <TopBar />
        <div className="screen">
          <h1 style={{ fontSize: 20 }}>ℹ️ Nouvèl (rejyon w)</h1>
          <p className="empty">Pa gen nouvèl nan rejyon w kounye a.</p>
        </div>
        <NavBar />
      </>
    );
  }

  if (!aktyèl) {
    return (
      <>
        <TopBar />
        <div className="screen">
          <h1 style={{ fontSize: 20 }}>ℹ️ Nouvèl (rejyon w)</h1>
          <div className="banner banner-ok">
            <strong>Ou li tout nouvèl yo ✔</strong>
            <p style={{ margin: "6px 0 0", fontSize: 13 }}>{lis.length} nouvèl total nan rejyon w.</p>
          </div>
          <button className="btn btn-ghost btn-block" onClick={() => setEndèks(0)}>
            Rekòmanse gade yo
          </button>
        </div>
        <NavBar />
      </>
    );
  }

  const meta = categoryMeta(aktyèl.rapò.kategori);

  return (
    <>
      <TopBar />
      <div className="screen">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>ℹ️ Nouvèl (rejyon w)</h1>
          <span className="tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)" }}>
            {pokoLi.length} poko li
          </span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 0 }}>
          {endèks + 1} sou {pokoLi.length}
        </p>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="report-icon" style={{ fontSize: 26, width: 52, height: 52 }}>{meta.emoji}</div>
            <span className={`tag tag-${aktyèl.rapò.niveauIjans}`}>{aktyèl.rapò.niveauIjans}</span>
          </div>
          <h2 style={{ fontSize: 18, marginTop: 12 }}>{aktyèl.rapò.tit}</h2>
          <div className="report-meta" style={{ marginBottom: 10 }}>
            {meta.label} · {aktyèl.rapò.adrès || "Kote pa presize"} · {timeAgo(aktyèl.rapò.kreyeNan)}
            {aktyèl.distKm !== null && ` · ${aktyèl.distKm.toFixed(0)} km de ou`}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>{aktyèl.rapò.deskripsyon}</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(`/rapò/${aktyèl.rapò.id}`)}>
            Wè detay
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={swivan}>
            {endèks + 1 >= pokoLi.length ? "Fini ✔" : "Swivan →"}
          </button>
        </div>
      </div>
      <NavBar />
    </>
  );
}
