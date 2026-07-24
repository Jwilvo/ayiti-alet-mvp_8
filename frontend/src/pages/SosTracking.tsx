import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IncidentMap from "../components/IncidentMap";
import { api, SosStatus } from "../api";

export default function SosTracking() {
  const { id } = useParams();
  const [sos, setSos] = useState<SosStatus | null>(null);
  const [erè, setErè] = useState("");

  useEffect(() => {
    if (!id) return;
    let vivan = true;
    function chaje() {
      api
        .sosGet(id!)
        .then((s) => {
          if (vivan) setSos(s);
        })
        .catch((e) => setErè(e.message));
    }
    chaje();
    const interval = setInterval(chaje, 5000);
    return () => {
      vivan = false;
      clearInterval(interval);
    };
  }, [id]);

  return (
    <div style={{ position: "fixed", inset: 0, overflowY: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 18px 60px" }}>
        <div className="brand" style={{ marginBottom: 18 }}>
          <span className="dot" />
          Ayiti Alèt — Swiv SOS
        </div>

        {erè && <div className="banner banner-error">{erè}</div>}
        {!sos && !erè && <p className="empty">Ap chaje pozisyon an…</p>}

        {sos && (
          <>
            <div
              className="banner"
              style={{
                background: sos.statut === "aktif" ? "var(--urgent-dim)" : "var(--calm-dim)",
                borderColor: sos.statut === "aktif" ? "rgba(255,90,78,0.4)" : "rgba(47,191,143,0.4)",
              }}
            >
              <strong style={{ color: sos.statut === "aktif" ? "var(--urgent)" : "var(--calm)" }}>
                {sos.statut === "aktif" ? "🚨 SOS toujou aktif" : "✔ SOS sa a fèmen"}
              </strong>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                {sos.statut === "aktif"
                  ? "Paj sa a mete pozisyon an ajou otomatikman chak 5 segond."
                  : "Moun sa a make li an sekirite, oswa SOS la sispann."}
              </p>
            </div>

            <IncidentMap
              center={[sos.latitude, sos.longitude]}
              zoom={15}
              height={280}
              markers={[{
                id: sos.id,
                lat: sos.latitude,
                lng: sos.longitude,
                color: "var(--urgent)",
                label: "Dènye pozisyon",
                sublabel: new Date(sos.dènyeMizajou).toLocaleTimeString("fr-HT"),
              }]}
            />

            <p style={{ fontSize: 12.5, color: "var(--text-muted)", textAlign: "center" }}>
              Dènye mizajou: {new Date(sos.dènyeMizajou).toLocaleTimeString("fr-HT")} ·{" "}
              {sos.istorik.length} pwen nan istorik la
            </p>
          </>
        )}
      </div>
    </div>
  );
}
