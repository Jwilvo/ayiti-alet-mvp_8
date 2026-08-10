import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";

export default function Tèm() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni/reglaj")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>Tèm ak Kondisyon Legal</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: -4 }}>Dènye mizajou: 2026</p>

        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          <h3 style={{ fontSize: 15 }}>1. Objè aplikasyon an</h3>
          <p>
            Ayiti Alèt se yon platfòm ki pèmèt sitwayen rapòte ensidan, jwenn sèvis esansyèl,
            e rete konekte ak kominote yo pandan ijans. Se yon zouti kominotè — li pa ranplase
            liy ijans ofisyèl yo (PNH, Pwoteksyon Sivil, Ponpye).
          </p>

          <h3 style={{ fontSize: 15 }}>2. Responsablite itilizatè a</h3>
          <p>
            Ou responsab egzatitid enfòmasyon ou pataje yo. Kreye yon rapò fo oswa ki gen entansyon
            twonpe lòt moun se yon vyolasyon Tèm sa yo, e ka lakòz sispansyon kont ou.
          </p>

          <h3 style={{ fontSize: 15 }}>3. Rapò anonim</h3>
          <p>
            Ou ka chwazi rapòte san bay non ou. Menm konsa, aplikasyon an ka toujou kolekte
            pozisyon GPS ak lè rapò a te fèt pou rezon operasyonèl (koòdinasyon ak otorite,
            deteksyon fo rapò).
          </p>

          <h3 style={{ fontSize: 15 }}>4. Limit responsablite</h3>
          <p>
            Ayiti Alèt se yon zouti k ap ede kominikasyon — li pa garanti okenn tan repons
            espesifik de pati otorite yo, ni li pa ka verifye chak rapò an tan reyèl anvan l
            afiche.
          </p>

          <h3 style={{ fontSize: 15 }}>5. Modifikasyon</h3>
          <p>
            Nou ka mete ajou Tèm sa yo detanzantan. Kontinye itilize aplikasyon an apre yon
            chanjman vle di ou aksepte nouvo vèsyon an.
          </p>
        </div>
      </div>
      <NavBar />
    </>
  );
}
