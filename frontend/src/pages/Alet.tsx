import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import { useRapòPaNivo } from "../alertFeed";
import { dejaLi, markeLi } from "../unread";
import { useVèsyonMakè, useLangVèsyon } from "../hooks";
import { categoryMeta, timeAgo } from "../categories";
import { t } from "../i18n";

export default function Alet() {
  const { lis, chaje } = useRapòPaNivo("ijans");
  const [lòd, setLòd] = useState<"nouvo" | "ansyen">("nouvo");
  const navigate = useNavigate();
  useVèsyonMakè();
  useLangVèsyon();

  const lisKlase = [...lis].sort((a, b) => {
    const tA = new Date(a.rapò.kreyeNan).getTime();
    const tB = new Date(b.rapò.kreyeNan).getTime();
    return lòd === "nouvo" ? tB - tA : tA - tB;
  });

  const konteAPokoLi = lis.filter((r) => !dejaLi(r.rapò.id)).length;

  function louvri(id: string) {
    markeLi(id);
    navigate(`/rapò/${id}`);
  }

  if (!chaje) {
    return (
      <>
        <TopBar />
        <div className="screen"><p className="empty">Ap chaje alèt yo…</p></div>
        <NavBar />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="screen">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>{t("alèt.tit")}</h1>
          {konteAPokoLi > 0 && <span className="tag tag-grav">{konteAPokoLi} nouvo</span>}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 0 }}>
          {lis.length} alèt nan yon reyon 15km de ou.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button
            className="btn btn-ghost"
            style={{
              flex: 1, padding: "8px 10px", fontSize: 12.5,
              borderColor: lòd === "nouvo" ? "var(--official)" : "var(--border)",
              color: lòd === "nouvo" ? "var(--text)" : "var(--text-muted)",
            }}
            onClick={() => setLòd("nouvo")}
          >
            {t("alèt.triyaj.nouvo")}
          </button>
          <button
            className="btn btn-ghost"
            style={{
              flex: 1, padding: "8px 10px", fontSize: 12.5,
              borderColor: lòd === "ansyen" ? "var(--official)" : "var(--border)",
              color: lòd === "ansyen" ? "var(--text)" : "var(--text-muted)",
            }}
            onClick={() => setLòd("ansyen")}
          >
            {t("alèt.triyaj.ansyen")}
          </button>
        </div>

        {lis.length === 0 && <p className="empty">{t("alèt.vid")}</p>}

        {lisKlase.map(({ rapò, distKm }) => {
          const meta = categoryMeta(rapò.kategori);
          const li = dejaLi(rapò.id);
          return (
            <div
              key={rapò.id}
              className="card report-row"
              style={{ cursor: "pointer", opacity: li ? 0.72 : 1, borderColor: li ? "var(--border)" : "var(--urgent)" }}
              onClick={() => louvri(rapò.id)}
            >
              {!li && (
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%", background: "var(--urgent)",
                    flexShrink: 0, marginTop: 6,
                  }}
                />
              )}
              <div className="report-icon">{meta.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: 14 }}>{rapò.tit}</strong>
                  <span className={`tag tag-${rapò.niveauIjans}`}>{rapò.niveauIjans}</span>
                </div>
                <div className="report-meta">
                  {meta.label} · {timeAgo(rapò.kreyeNan)}
                  {distKm !== null && ` · ${distKm.toFixed(1)} km`}
                  {li && ` · ${t("alèt.li_deja")}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <NavBar />
    </>
  );
}
