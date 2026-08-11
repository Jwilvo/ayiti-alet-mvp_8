import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import { api, Report, mediaUrl } from "../api";
import { categoryMeta, severityColor, timeAgo, nivoLabel } from "../categories";
import { t } from "../i18n";
import { useLangVèsyon } from "../hooks";

function estatiInfo(statut: string): { label: string; koulè: string; fon: string } {
  switch (statut) {
    case "verifye":
      return { label: t("detay.estati_verifye"), koulè: "var(--calm)", fon: "var(--calm-dim)" };
    case "rezolu":
      return { label: t("detay.estati_rezolu"), koulè: "var(--calm)", fon: "var(--calm-dim)" };
    case "rejte":
      return { label: t("detay.estati_rejte"), koulè: "var(--text-muted)", fon: "var(--surface-raised)" };
    default:
      return { label: t("detay.estati_nouvo"), koulè: "var(--amber)", fon: "var(--amber-dim)" };
  }
}

export default function ReportDetail() {
  useLangVèsyon();
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [erè, setErè] = useState("");
  const [aksyonMsg, setAksyonMsg] = useState("");
  const [nouvoKòmantè, setNouvoKòmantè] = useState("");
  const [voyeAnKou, setVoyeAnKou] = useState(false);

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

  async function voyeKòmantè(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !nouvoKòmantè.trim()) return;
    setVoyeAnKou(true);
    try {
      const kòm = await api.ajouteKòmantè(id, nouvoKòmantè.trim());
      setReport((r) => (r ? { ...r, kòmantè: [...(r.kòmantè ?? []), kòm] } : r));
      setNouvoKòmantè("");
    } catch (e: any) {
      setErè(e.message);
    } finally {
      setVoyeAnKou(false);
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
  const estati = estatiInfo(report.statut);

  return (
    <>
      <TopBar />
      <div className="screen">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="report-icon" style={{ fontSize: 24, width: 48, height: 48 }}>{meta.emoji}</div>
            <span className={`tag tag-${report.niveauIjans}`}>{nivoLabel(report.niveauIjans)}</span>
          </div>
          <h1 style={{ fontSize: 19, marginTop: 12 }}>{report.tit}</h1>
          <div className="report-meta" style={{ marginBottom: 10 }}>
            {meta.label} · {report.adrès || t("rapò.kote_pa_presize")} · {timeAgo(report.kreyeNan)}
            {report.komin && ` · ${report.komin}`}
            {report.anonim && ` · ${t("rapò.rapò_anonim")}`}
          </div>

          <span
            className="tag"
            style={{ background: estati.fon, color: estati.koulè, fontSize: 11.5, padding: "5px 10px", marginBottom: 10, display: "inline-block" }}
          >
            {estati.label}
          </span>

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
            {t("detay.konfime")}
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => aji("siyale")}>
            {t("detay.siyale")}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14, textAlign: "center" }}>
          {t("detay.konfimasyon")}: {report.konfimasyon ?? report.confirmations?.length ?? 0}
        </p>

        <div className="section-title"><h2>{t("detay.kòmantè")} ({report.kòmantè?.length ?? 0})</h2></div>

        <form onSubmit={voyeKòmantè} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            placeholder={t("detay.kòmantè_placeholder")}
            value={nouvoKòmantè}
            onChange={(e) => setNouvoKòmantè(e.target.value)}
            style={{ flex: 1, marginBottom: 0 }}
            maxLength={500}
          />
          <button className="btn btn-primary" type="submit" disabled={voyeAnKou || !nouvoKòmantè.trim()} style={{ padding: "0 16px" }}>
            {voyeAnKou ? <span className="spinner" /> : t("detay.voye")}
          </button>
        </form>

        {(!report.kòmantè || report.kòmantè.length === 0) && (
          <p className="empty">{t("detay.pa_kòmantè")}</p>
        )}

        {report.kòmantè?.map((k) => (
          <div key={k.id} className="card" style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <strong style={{ fontSize: 13 }}>{k.nonAfiche}</strong>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{timeAgo(k.kreyeNan)}</span>
            </div>
            <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.4 }}>{k.kò}</p>
          </div>
        ))}
      </div>
      <NavBar />
    </>
  );
}
