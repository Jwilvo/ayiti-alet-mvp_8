import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";
import IncidentMap from "../components/IncidentMap";
import { api, Report } from "../api";
import { useActiveSos, useUserPosition, useLangVèsyon } from "../hooks";
import { deklancheSos, fèmenSos, lyenSwiv, mesajSmsTouKontak, mesajWhatsAppSos } from "../sos";
import { categoryMeta, severityColor, distansKm, nivoPètinans } from "../categories";
import { t } from "../i18n";

const PÒTOPRENS_CENTER: [number, number] = [18.5392, -72.3364];

export default function Home() {
  useLangVèsyon();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [sosArmed, setSosArmed] = useState(false);
  const [sosChaje, setSosChaje] = useState(false);
  const navigate = useNavigate();
  const activeSos = useActiveSos();
  const pozisyon = useUserPosition(); // otomatik, san bouton — gade hooks.ts

  useEffect(() => {
    api.listReports({ limit: 50 }).then(setReports).catch(() => {});
  }, []);

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
