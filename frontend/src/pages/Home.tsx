import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import { api, Report, IjansDeklare } from "../api";
import { useActiveSos, useUserPosition, useLangVèsyon } from "../hooks";
import { deklancheSos, fèmenSos, lyenSwiv, mesajSmsTouKontak, mesajWhatsAppSos } from "../sos";
import { categoryMeta, severityColor, distansKm, nivoPètinans } from "../categories";
import { t } from "../i18n";
import { ijansDejaReponn, markeIjansReponn } from "../ijansLokal";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];

export default function Home() {
  useLangVèsyon();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [sosArmed, setSosArmed] = useState(false);
  const [sosChaje, setSosChaje] = useState(false);
  const [ijansAktif, setIjansAktif] = useState<IjansDeklare[]>([]);
  const [ijansRepondi, setIjansRepondi] = useState<Set<string>>(new Set());
  const [ijansAnKou, setIjansAnKou] = useState(false);
  // Chwa moun nan fè men li POKO konfime — mande "Ou asirè?" anvan anrejistre
  // final la, pou evite tap aksidantèl.
  const [ijansPandanKonfimasyon, setIjansPandanKonfimasyon] = useState<{ id: string; anSekirite: boolean } | null>(null);
  const navigate = useNavigate();
  const activeSos = useActiveSos();
  const pozisyon = useUserPosition(); // otomatik, san bouton — gade hooks.ts

  useEffect(() => {
    api.listReports({ limit: 50 }).then(setReports).catch(() => {});
  }, []);

  useEffect(() => {
    if (!pozisyon) return;
    api.ijansAktif(pozisyon.lat, pozisyon.lng).then((lis) => {
      setIjansAktif(lis);
      // Chaje eta "deja reponn" pèmanan an (localStorage) — konsa bandwo a
      // pa janm parèt ankò yon fwa moun nan fin reponn, menm apre yon rechaje.
      const dejaReponn = lis.filter((i) => ijansDejaReponn(i.id)).map((i) => i.id);
      if (dejaReponn.length > 0) {
        setIjansRepondi((s) => new Set([...s, ...dejaReponn]));
      }
    }).catch(() => {});
  }, [pozisyon]);

  const [ijansRepònKategori, setIjansRepònKategori] = useState<Record<string, boolean>>({});

  function mandeKonfimasyon(id: string, anSekirite: boolean) {
    setIjansPandanKonfimasyon({ id, anSekirite });
  }

  async function konfimeRepons() {
    if (!ijansPandanKonfimasyon) return;
    const { id, anSekirite } = ijansPandanKonfimasyon;
    setIjansAnKou(true);
    try {
      await api.ijansAnSekirite(id, anSekirite);
      markeIjansReponn(id); // sove pèmanan — pa janm mande ankò sou aparèy sa a
      setIjansRepondi((s) => new Set(s).add(id));
      setIjansRepònKategori((k) => ({ ...k, [id]: anSekirite }));
      setIjansPandanKonfimasyon(null);
    } catch {
      // silans — moun nan ka eseye ankò
    } finally {
      setIjansAnKou(false);
    }
  }

  function pranPozisyonKounyeA(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: PÒTOPRENS_CENTER[0], lng: PÒTOPRENS_CENTER[1] });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: PÒTOPRENS_CENTER[0], lng: PÒTOPRENS_CENTER[1] }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function handleSos() {
    if (activeSos) return;
    if (!sosArmed) {
      setSosArmed(true);
      setTimeout(() => setSosArmed(false), 4000);
      return;
    }
    setSosArmed(false);
    setSosChaje(true);
    try {
      const pos = await pranPozisyonKounyeA();
      await deklancheSos(pos.lat, pos.lng);
    } catch {
      // silans — moun nan ka eseye ankò
    } finally {
      setSosChaje(false);
    }
  }

  const rapòAfiche = (reports ?? []).filter((r) => {
    const dist = pozisyon ? distansKm(pozisyon.lat, pozisyon.lng, r.latitude, r.longitude) : null;
    return nivoPètinans(dist) !== "lwen";
  });

  const markers = rapòAfiche.map((r) => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    color: severityColor(r.niveauIjans),
    label: r.tit,
    sublabel: categoryMeta(r.kategori).label,
    onClick: () => navigate(`/rapò/${r.id}`),
  }));

  return (
    <>
      <TopBar />
      <div className="screen-map">
        <IncidentMap
          center={pozisyon ? [pozisyon.lat, pozisyon.lng] : PÒTOPRENS_CENTER}
          zoom={12}
          markers={markers}
          plenEkran
        />

        {!activeSos && ijansAktif.filter((i) => !ijansRepondi.has(i.id)).map((ijans) => (
          <div key={ijans.id} className="map-flotan-banner" style={{ borderColor: "var(--amber)" }}>
            {ijansPandanKonfimasyon?.id === ijans.id ? (
              <>
                <strong style={{ fontSize: 13, color: ijansPandanKonfimasyon.anSekirite ? "var(--calm)" : "var(--urgent)" }}>
                  {ijansPandanKonfimasyon.anSekirite ? "Ou asirè ou an sekirite?" : "Ou asirè ou bezwen èd?"}
                </strong>
                <p style={{ fontSize: 11.5, margin: "4px 0 8px", color: "var(--text-muted)" }}>
                  Repons sa a **final** — ou p ap ka chanje l apre.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: "9px 10px", fontSize: 12.5 }}
                    onClick={() => setIjansPandanKonfimasyon(null)}
                    disabled={ijansAnKou}
                  >
                    Anile
                  </button>
                  <button
                    className={ijansPandanKonfimasyon.anSekirite ? "btn btn-primary" : "btn btn-urgent"}
                    style={{ flex: 1, padding: "9px 10px", fontSize: 12.5 }}
                    onClick={konfimeRepons}
                    disabled={ijansAnKou}
                  >
                    {ijansAnKou ? <span className="spinner" /> : "Konfime"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <strong style={{ color: "var(--amber)", fontSize: 13 }}>🆘 Ijans deklare: {ijans.tit}</strong>
                {ijans.deskripsyon && (
                  <p style={{ fontSize: 12, margin: "4px 0 8px", color: "var(--text-muted)" }}>{ijans.deskripsyon}</p>
                )}
                <p style={{ fontSize: 11.5, margin: "0 0 8px", color: "var(--text-muted)" }}>Èske w an sekirite?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: "9px 10px", fontSize: 12.5 }}
                    onClick={() => mandeKonfimasyon(ijans.id, true)}
                  >
                    ✔ Wi, mwen bon
                  </button>
                  <button
                    className="btn btn-urgent"
                    style={{ flex: 1, padding: "9px 10px", fontSize: 12.5 }}
                    onClick={() => mandeKonfimasyon(ijans.id, false)}
                  >
                    ✖ Non, m bezwen èd
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {ijansAktif.some((i) => ijansRepondi.has(i.id)) && !activeSos && (
          <div className="map-flotan-banner" style={{ borderColor: ijansAktif.some((i) => ijansRepònKategori[i.id] === false) ? "var(--urgent)" : "var(--calm)" }}>
            {ijansAktif.some((i) => ijansRepònKategori[i.id] === false) ? (
              <strong style={{ color: "var(--urgent)", fontSize: 13 }}>
                Nou anrejistre repons ou — otorite yo ap wè ou bezwen èd.
              </strong>
            ) : (
              <strong style={{ color: "var(--calm)", fontSize: 13 }}>✔ Repons ou anrejistre — ou an sekirite.</strong>
            )}
          </div>
        )}

        {activeSos && (
          <div className="map-flotan-banner">
            <strong style={{ color: "var(--urgent)", fontSize: 13 }}>🚨 SOS aktif</strong>
            <p style={{ fontSize: 12, margin: "4px 0 8px", color: "var(--text-muted)" }}>
              Pozisyon w ap pataje an tan reyèl.
            </p>
            {activeSos.kontakIjans.length > 0 && (
              <a
                href={mesajSmsTouKontak(activeSos.kontakIjans, activeSos.id)}
                className="btn btn-urgent btn-block"
                style={{ padding: "9px 10px", fontSize: 12.5, marginBottom: 8 }}
              >
                📩 Voye alèt bay tout kontak yo ({activeSos.kontakIjans.length})
              </a>
            )}
            <a
              href={mesajWhatsAppSos(activeSos.id)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-block"
              style={{ padding: "8px 10px", fontSize: 12, marginBottom: 8 }}
            >
              💬 Voye sou WhatsApp
            </a>
            <div style={{ display: "flex", gap: 6 }}>
              <a href={lyenSwiv(activeSos.id)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ flex: 1, padding: "7px 8px", fontSize: 11.5 }}>
                🔗 Lyen swiv
              </a>
              <button className="btn btn-urgent" style={{ flex: 1, padding: "7px 8px", fontSize: 11.5 }} onClick={() => fèmenSos()}>
                Kanpe SOS
              </button>
            </div>
          </div>
        )}

        <div className="map-flotan-sos-wrap">
          <button
            className="map-flotan-sos"
            onClick={handleSos}
            disabled={sosChaje || !!activeSos}
            title="Bouton SOS"
          >
            {sosChaje ? <span className="spinner" /> : activeSos ? "AKTIF" : sosArmed ? "SÈ?" : "SOS"}
          </button>
        </div>

        <button
          className="map-flotan-rapòte"
          onClick={() => navigate("/rapòte")}
          title={t("home.rapòte")}
        >
          <span style={{ fontSize: 18 }}>📢</span>
          {t("home.rapòte")}
        </button>
      </div>
      <NavBar />
    </>
  );
}
