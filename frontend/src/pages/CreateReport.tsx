import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import ConnectivityBanner from "../components/ConnectivityBanner";
import { api, getSessionUser, KontakIjans } from "../api";
import { queueReport } from "../offline";
import { CATEGORIES } from "../categories";
import { t } from "../i18n";
import { useLangVèsyon } from "../hooks";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];
const MAKS_FOTO = 3;

interface FotoPyèsJwenn { url: string; ap_telechaje: boolean; erè?: string; previewLokal: string; }

export default function CreateReport() {
  useLangVèsyon();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [kategori, setKategori] = useState("");
  const [tit, setTit] = useState("");
  const [deskripsyon, setDeskripsyon] = useState("");
  const [adrès, setAdrès] = useState("");
  const [niveauIjans, setNiveauIjans] = useState<"ba" | "mwayen" | "grav">(
    params.get("ijans") ? "grav" : "mwayen"
  );
  const [anonim, setAnonim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erè, setErè] = useState("");
  const [siksè, setSiksè] = useState<{ otoriteAvize: string[]; avètisman?: string[]; reportId?: string } | null>(null);
  const [kontakPouAvize, setKontakPouAvize] = useState<KontakIjans[]>([]);
  const [chajeAnLokal, setChajeAnLokal] = useState(false);
  const [lokalizasyon, setLokalizasyon] = useState<{ lat: number; lng: number } | null>(null);
  const [chajePozisyon, setChajePozisyon] = useState(false);
  const [foto, setFoto] = useState<FotoPyèsJwenn[]>([]);

  async function chwaziFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichye = e.target.files?.[0];
    e.target.value = "";
    if (!fichye) return;
    if (foto.length >= MAKS_FOTO) {
      setErè(`Ou ka ajoute maksimòm ${MAKS_FOTO} foto.`);
      return;
    }
    if (!navigator.onLine) {
      setErè("Ou pa gen entènèt kounye a — ou ka voye rapò a san foto, l ap voye pita.");
      return;
    }

    const previewLokal = URL.createObjectURL(fichye);
    const nouvo: FotoPyèsJwenn = { url: "", ap_telechaje: true, previewLokal };
    setFoto((f) => [...f, nouvo]);

    try {
      const res = await api.uploadFile(fichye);
      setFoto((f) => f.map((p) => (p === nouvo ? { ...p, url: res.url, ap_telechaje: false } : p)));
    } catch (e: any) {
      setFoto((f) => f.map((p) => (p === nouvo ? { ...p, ap_telechaje: false, erè: e.message } : p)));
    }
  }

  function retireFoto(previewLokal: string) {
    setFoto((f) => f.filter((p) => p.previewLokal !== previewLokal));
  }

  function pranPozisyon() {
    if (!navigator.geolocation) {
      setLokalizasyon({ lat: 18.5392, lng: -72.3364 });
      return;
    }
    setChajePozisyon(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLokalizasyon({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setChajePozisyon(false);
      },
      () => {
        setLokalizasyon({ lat: 18.5392, lng: -72.3364 });
        setChajePozisyon(false);
      }
    );
  }

  async function soumèt(e: React.FormEvent) {
    e.preventDefault();
    setErè("");
    if (!kategori) return setErè("Chwazi yon kategori pou rapò a.");
    if (tit.trim().length < 3) return setErè("Mete yon tit pi long.");
    if (deskripsyon.trim().length < 5) return setErè("Bay yon ti deskripsyon sou sa k ap pase a.");
    if (foto.some((f) => f.ap_telechaje)) return setErè("Tann foto a fini telechaje anvan ou voye.");
    const pos = lokalizasyon ?? { lat: 18.5392, lng: -72.3364 };

    setLoading(true);
    const kòReport = {
      kategori,
      tit: tit.trim(),
      deskripsyon: deskripsyon.trim(),
      niveauIjans,
      latitude: pos.lat,
      longitude: pos.lng,
      adrès: adrès.trim() || undefined,
      anonim,
      media: foto.filter((f) => f.url).map((f) => ({ tip: "foto" as const, url: f.url })),
    };

    if (!navigator.onLine) {
      queueReport(kòReport);
      setChajeAnLokal(true);
      setSiksè({ otoriteAvize: [] });
      setLoading(false);
      return;
    }

    try {
      const res = await api.createReport(kòReport);
      setSiksè({ otoriteAvize: res.otoriteAvize, avètisman: res.avètisman, reportId: res.report.id });

      // Si rapò a grav e moun nan konekte, pwopoze l voye lyen an bay kontak
      // ijans li yo (menm lide ak "Private Groups" — men san bezwen kreye
      // yon gwoup, nou reyitilize kontak ijans SOS yo deja genyen).
      const user = getSessionUser();
      if (user && niveauIjans === "grav") {
        try {
          const kontak = await api.getKontakIjans();
          setKontakPouAvize(kontak);
        } catch {
          // pa gwo zafè si sa echwe — se yon fonksyon bonus, pa esansyèl
        }
      }
    } catch (e: any) {
      queueReport(kòReport);
      setChajeAnLokal(true);
      setSiksè({ otoriteAvize: [] });
    } finally {
      setLoading(false);
    }
  }

  if (siksè) {
    return (
      <>
        <TopBar />
        <div className="screen">
          {chajeAnLokal ? (
            <div className="banner" style={{ background: "var(--amber-dim)", borderColor: "rgba(245,166,35,0.3)", color: "#ffd48a" }}>
              <strong>{t("rapò.estoke_lokal")}</strong>
              <div style={{ marginTop: 6 }}>
                {t("rapò.pa_koneksyon")}
              </div>
            </div>
          ) : (
            <div className="banner banner-ok">
              <strong>{t("rapò.voye_reyisi")}</strong>
              <div style={{ marginTop: 6 }}>
                {t("rapò.avize_otomatik")} <strong>{siksè.otoriteAvize.join(", ")}</strong>. {t("rapò.mèsi")}
              </div>
            </div>
          )}

          {siksè.avètisman && siksè.avètisman.length > 0 && (
            <div className="banner" style={{ background: "var(--amber-dim)", borderColor: "rgba(245,166,35,0.3)", color: "#ffd48a" }}>
              <strong>{t("rapò.analiz_foto")}</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {siksè.avètisman.map((a, i) => (
                  <li key={i} style={{ marginBottom: 4, fontSize: 13 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {kontakPouAvize.length > 0 && siksè.reportId && (
            <div className="banner" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
              <strong>{t("rapò.avize_kontak")}</strong>
              <p style={{ fontSize: 13, margin: "6px 0 10px", color: "var(--text-muted)" }}>
                {t("rapò.avize_kontak_deskripsyon")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {kontakPouAvize.map((k) => (
                  <a
                    key={k.telefon}
                    href={`sms:${k.telefon}?body=${encodeURIComponent(
                      `Ayiti Alèt — Gen yon ijans nan zòn mwen: ${window.location.origin}/rapò/${siksè.reportId}`
                    )}`}
                    className="btn btn-ghost"
                    style={{ padding: "7px 12px", fontSize: 12.5 }}
                  >
                    {t("rapò.voye_bay")} {k.non}
                  </a>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={() => navigate("/")}>
            {t("rapò.retounen_akèy")}
          </button>
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10 }}
            onClick={() => {
              setSiksè(null);
              setKontakPouAvize([]);
              setChajeAnLokal(false);
              setKategori("");
              setTit("");
              setDeskripsyon("");
              setAdrès("");
            }}
          >
            {t("rapò.fè_lòt")}
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
        <ConnectivityBanner />
        <h1 style={{ fontSize: 20 }}>{t("rapò.tit")}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          {t("rapò.deskripsyon_paj")}
        </p>

        <form onSubmit={soumèt}>
          <label>{t("rapò.kategori")}</label>
          <div className="category-grid">
            {CATEGORIES.map((c) => (
              <div
                key={c.key}
                className={`category-chip ${kategori === c.key ? "selected" : ""}`}
                onClick={() => setKategori(c.key)}
              >
                <span className="emoji">{c.emoji}</span>
                {t(`kat.${c.key}`)}
              </div>
            ))}
          </div>

          <label>{t("rapò.tit_label")}</label>
          <input value={tit} onChange={(e) => setTit(e.target.value)} placeholder={t("rapò.tit_placeholder")} />

          <label>{t("rapò.deskripsyon_label")}</label>
          <textarea
            rows={4}
            value={deskripsyon}
            onChange={(e) => setDeskripsyon(e.target.value)}
            placeholder={t("rapò.deskripsyon_placeholder")}
          />

          <label>{t("rapò.foto")} ({MAKS_FOTO})</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {foto.map((f) => (
              <div key={f.previewLokal} style={{ position: "relative", width: 76, height: 76 }}>
                <img
                  src={f.previewLokal}
                  style={{
                    width: 76, height: 76, objectFit: "cover", borderRadius: 10,
                    border: "1px solid var(--border)", opacity: f.ap_telechaje ? 0.5 : f.erè ? 0.4 : 1,
                  }}
                />
                {f.ap_telechaje && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="spinner" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => retireFoto(f.previewLokal)}
                  style={{
                    position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%",
                    background: "var(--urgent)", color: "white", border: "2px solid var(--bg)", fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {foto.length < MAKS_FOTO && (
              <label
                htmlFor="foto-input"
                style={{
                  width: 76, height: 76, borderRadius: 10, border: "1px dashed var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  color: "var(--text-muted)", cursor: "pointer",
                }}
              >
                +
                <input id="foto-input" type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={chwaziFoto} />
              </label>
            )}
          </div>

          <label>{t("rapò.adrès")}</label>
          <input value={adrès} onChange={(e) => setAdrès(e.target.value)} placeholder="Delmas 33..." />

          <label>{t("rapò.kote")}</label>
          <button type="button" className="btn btn-ghost btn-block" onClick={pranPozisyon} disabled={chajePozisyon}>
            {chajePozisyon ? <span className="spinner" /> : "📍"}
            {lokalizasyon
              ? `Pozisyon jwenn (${lokalizasyon.lat.toFixed(3)}, ${lokalizasyon.lng.toFixed(3)})`
              : t("rapò.pozisyon_aktyèl")}
          </button>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0" }}>
            Oswa peze dirèkteman sou kat la pou presize kote a:
          </p>
          <IncidentMap
            center={lokalizasyon ? [lokalizasyon.lat, lokalizasyon.lng] : PÒTOPRENS_CENTER}
            zoom={13}
            height={190}
            pickedLocation={lokalizasyon ? { lat: lokalizasyon.lat, lng: lokalizasyon.lng } : null}
            onPickLocation={(lat, lng) => setLokalizasyon({ lat, lng })}
          />

          <label>{t("rapò.nivo_ijans")}</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {(["ba", "mwayen", "grav"] as const).map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setNiveauIjans(n)}
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  borderColor: niveauIjans === n ? "var(--official)" : "var(--border)",
                  color: niveauIjans === n ? "var(--text)" : "var(--text-muted)",
                }}
              >
                {n === "ba" ? t("rapò.ba") : n === "mwayen" ? t("rapò.mwayen") : t("rapò.grav")}
              </button>
            ))}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              style={{ width: "auto", margin: 0 }}
              checked={anonim}
              onChange={(e) => setAnonim(e.target.checked)}
            />
            {t("rapò.anonim")}
          </label>

          {erè && <div className="banner banner-error">{erè}</div>}

          <button className="btn btn-urgent btn-block" type="submit" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? <span className="spinner" /> : t("rapò.voye")}
          </button>
        </form>
      </div>
      <NavBar />
    </>
  );
}
