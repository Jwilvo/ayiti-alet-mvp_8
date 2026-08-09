import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import ConnectivityBanner from "../components/ConnectivityBanner";
import { api } from "../api";
import { queueReport } from "../offline";
import { CATEGORIES } from "../categories";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];
const MAKS_FOTO = 3;

interface FotoPyèsJwenn { url: string; ap_telechaje: boolean; erè?: string; previewLokal: string; }

export default function CreateReport() {
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
  const [siksè, setSiksè] = useState<{ otoriteAvize: string[]; avètisman?: string[] } | null>(null);
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
      setSiksè({ otoriteAvize: res.otoriteAvize, avètisman: res.avètisman });
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
              <strong>Rapò a estoke sou telefòn ou 📴</strong>
              <div style={{ marginTop: 6 }}>
                Nou pa jwenn koneksyon kounye a. Rapò a ap voye otomatikman bay otorite yo depi
                entènèt retounen — ou pa bezwen fè anyen ankò.
              </div>
            </div>
          ) : (
            <div className="banner banner-ok">
              <strong>Rapò a voye ✔</strong>
              <div style={{ marginTop: 6 }}>
                Nou avize otomatikman: <strong>{siksè.otoriteAvize.join(", ")}</strong>. Mèsi paske ou ede kominote a rete an sekirite.
              </div>
            </div>
          )}

          {siksè.avètisman && siksè.avètisman.length > 0 && (
            <div className="banner" style={{ background: "var(--amber-dim)", borderColor: "rgba(245,166,35,0.3)", color: "#ffd48a" }}>
              <strong>🔎 Analiz otomatik foto a</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {siksè.avètisman.map((a, i) => (
                  <li key={i} style={{ marginBottom: 4, fontSize: 13 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={() => navigate("/")}>
            Retounen nan Akèy
          </button>
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10 }}
            onClick={() => {
              setSiksè(null);
              setChajeAnLokal(false);
              setKategori("");
              setTit("");
              setDeskripsyon("");
              setAdrès("");
            }}
          >
            Fè yon lòt rapò
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
        <h1 style={{ fontSize: 20 }}>Fè yon rapò</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Chwazi kategori a, dekri sa k ap pase, epi voye. Ou ka rete anonim si ou vle.
        </p>

        <form onSubmit={soumèt}>
          <label>Kategori</label>
          <div className="category-grid">
            {CATEGORIES.map((c) => (
              <div
                key={c.key}
                className={`category-chip ${kategori === c.key ? "selected" : ""}`}
                onClick={() => setKategori(c.key)}
              >
                <span className="emoji">{c.emoji}</span>
                {c.label}
              </div>
            ))}
          </div>

          <label>Tit rapò a</label>
          <input value={tit} onChange={(e) => setTit(e.target.value)} placeholder="Egzanp: Dife nan yon depo" />

          <label>Deskripsyon</label>
          <textarea
            rows={4}
            value={deskripsyon}
            onChange={(e) => setDeskripsyon(e.target.value)}
            placeholder="Bay plis detay sou sa k ap pase a…"
          />

          <label>Foto (opsyonèl, maksimòm {MAKS_FOTO})</label>
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

          <label>Adrès oswa pwen repè (opsyonèl)</label>
          <input value={adrès} onChange={(e) => setAdrès(e.target.value)} placeholder="Egzanp: Delmas 33, toupre famasi a" />

          <label>Kote ensidan an ye</label>
          <button type="button" className="btn btn-ghost btn-block" onClick={pranPozisyon} disabled={chajePozisyon}>
            {chajePozisyon ? <span className="spinner" /> : "📍"}
            {lokalizasyon
              ? `Pozisyon jwenn (${lokalizasyon.lat.toFixed(3)}, ${lokalizasyon.lng.toFixed(3)})`
              : "Itilize pozisyon aktyèl mwen"}
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

          <label>Nivo ijans</label>
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
                {n === "ba" ? "Ba" : n === "mwayen" ? "Mwayen" : "Grav"}
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
            Voye rapò a san non mwen (anonim)
          </label>

          {erè && <div className="banner banner-error">{erè}</div>}

          <button className="btn btn-urgent btn-block" type="submit" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? <span className="spinner" /> : "Voye rapò a"}
          </button>
        </form>
      </div>
      <NavBar />
    </>
  );
}
