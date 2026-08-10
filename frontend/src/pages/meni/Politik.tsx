import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";

export default function Politik() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni/reglaj")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>Politik Konfidansyalite</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: -4 }}>Dènye mizajou: 2026</p>

        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          <h3 style={{ fontSize: 15 }}>Ki done nou kolekte</h3>
          <ul style={{ paddingLeft: 18 }}>
            <li>Non, nimewo telefòn, ak modpas (chifreman) si ou kreye yon kont</li>
            <li>Pozisyon GPS lè ou fè yon rapò, oswa lè ou aktive lokalizasyon otomatik la</li>
            <li>Foto ou telechaje pou yon rapò</li>
            <li>Kontak ijans ou chwazi bay pou fonksyon SOS</li>
          </ul>

          <h3 style={{ fontSize: 15 }}>Kijan nou itilize done yo</h3>
          <p>
            Pozisyon ou sèvi **sèlman** pou detèmine ki alèt konsène w (distans), e pou notifikasyon
            push. Nou pa vann ni pataje done ou ak twazyèm pati pou rezon piblisite.
          </p>

          <h3 style={{ fontSize: 15 }}>Rapò anonim</h3>
          <p>
            Lè ou chwazi rapòte anonim, non ak kont ou pa asosye ak rapò a nan baz done a.
            Sèl pozisyon GPS ak lè a rete.
          </p>

          <h3 style={{ fontSize: 15 }}>Konsèvasyon</h3>
          <p>
            Nou kenbe done yo pandan ou gen yon kont aktif. Ou ka mande efase kont ou nenpòt
            lè.
          </p>

          <h3 style={{ fontSize: 15 }}>Kontak</h3>
          <p>
            Pou kesyon sou done ou, kontakte ekip Ayiti Alèt la atravè kanal sipò ki disponib
            nan aplikasyon an.
          </p>
        </div>
      </div>
      <NavBar />
    </>
  );
}
