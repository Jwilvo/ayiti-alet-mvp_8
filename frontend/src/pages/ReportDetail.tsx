import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import { api, Report, mediaUrl } from "../api";
import { categoryMeta, severityColor, timeAgo } from "../categories";

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [erè, setErè] = useState("");
  const [aksyonMsg, setAksyonMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    api.getReport(id).then(setReport).catch((e) => setErè(e.message));
  }, [id]);

  async function aji(tip: "konfime" | "siyale") {
    if (!id) return;
    try {
      await api.confirmReport(id, tip);
      setAksyonMsg(tip === "konfime" ? "Mèsi — ou konfime rapò sa a." : "Mèsi — nou siyale enfòmasyon an pou revizyon.");
    } catch (e: any) {
      setErè(e.message.includes("konekte") ? "Ou dwe konekte anvan pou konfime yon rapò." : e.message);
    }
  }

  if (erè && !report) {
    return (
      <>
        <TopBar />
        <div className="screen">
          <div className="banner banner-error">{erè}</div>
          <Link to="/" className="btn btn-ghost btn-block">Retounen</Link>
        </div>
        <NavBar />
      </>
    );
  }

  if (!report) {
    return (
      <>
        <TopBar />
        <div className="screen"><p className="empty">Ap chaje rapò a…</p></div>
        <NavBar />
      </>
    );
  }

  const meta = categoryMeta(report.kategori);

  return (
    <>
      <TopBar />
      <div className="screen">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="report-icon" style={{ fontSize: 24, width: 48, height: 48 }}>{meta.emoji}</div>
            <span className={`tag tag-${report.niveauIjans}`}>{report.niveauIjans}</span>
          </div>
          <h1 style={{ fontSize: 19, marginTop: 12 }}>{report.tit}</h1>
          <div className="report-meta" style={{ marginBottom: 12 }}>
            {meta.label} · {report.adrès || "Kote pa presize"} · {timeAgo(report.kreyeNan)}
            {report.anonim && " · Rapò anonim"}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>{report.deskripsyon}</p>

          {report.media && report.media.filter((m) => m.tip === "foto").length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {report.media.filter((m) => m.tip === "foto").map((m) => (
                <div key={m.id} style={{ position: "relative" }}>
                  <a href={mediaUrl(m.url)} target="_blank" rel="noreferrer">
                    <img
                      src={mediaUrl(m.url)}
                      style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                  </a>
                  {m.koulèDominant && (
                    <span
                      title="Koulè dominant (analiz otomatik)"
                      style={{
                        position: "absolute", bottom: 5, left: 5, width: 12, height: 12, borderRadius: "50%",
                        background: m.koulèDominant, border: "1px solid rgba(255,255,255,0.6)",
                      }}
                    />
                  )}
                  {m.flou && (
                    <span
                      className="tag"
                      style={{
                        position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#ffd48a",
                        fontSize: 9, padding: "2px 5px",
                      }}
                    >
                      flou
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <IncidentMap
          center={[report.latitude, report.longitude]}
          zoom={15}
          height={150}
          markers={[{
            id: report.id,
            lat: report.latitude,
            lng: report.longitude,
            color: severityColor(report.niveauIjans),
            label: report.tit,
            sublabel: meta.label,
          }]}
        />

        {aksyonMsg && <div className="banner banner-ok">{aksyonMsg}</div>}
        {erè && <div className="banner banner-error">{erè}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => aji("konfime")}>
            ✔ Konfime
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => aji("siyale")}>
            ⚑ Siyale
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14, textAlign: "center" }}>
          Statut: {report.statut} · Konfimasyon: {report.konfimasyon ?? report.confirmations?.length ?? 0}
        </p>
      </div>
      <NavBar />
    </>
  );
}
