import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";
import { jwennLang, chwaziLang, Lang as LangKòd } from "../../i18n";
import { useLangVèsyon } from "../../hooks";

const OPSYON: { kòd: LangKòd; label: string; drapo: string }[] = [
  { kòd: "ht", label: "Kreyòl Ayisyen", drapo: "🇭🇹" },
  { kòd: "fr", label: "Français", drapo: "🇫🇷" },
  { kòd: "en", label: "English", drapo: "🇺🇸" },
];

export default function LangPage() {
  const navigate = useNavigate();
  useLangVèsyon();
  const aktyèl = jwennLang();

  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni/reglaj")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>🌐 Lang</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Chwazi lang aplikasyon an. Kèk seksyon (kòmantè, panèl admin) rete an Kreyòl pou
          kounye a.
        </p>

        {OPSYON.map((o) => (
          <button
            key={o.kòd}
            className="card"
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              border: aktyèl === o.kòd ? "2px solid var(--official)" : "1px solid var(--border)",
              background: "var(--surface)", cursor: "pointer",
            }}
            onClick={() => chwaziLang(o.kòd)}
          >
            <span style={{ fontSize: 22 }}>{o.drapo}</span>
            <strong style={{ fontSize: 14, flex: 1 }}>{o.label}</strong>
            {aktyèl === o.kòd && <span style={{ color: "var(--official)" }}>✔</span>}
          </button>
        ))}
      </div>
      <NavBar />
    </>
  );
}
