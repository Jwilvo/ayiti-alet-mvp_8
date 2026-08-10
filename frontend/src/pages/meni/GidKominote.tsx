import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import NavBar from "../../components/NavBar";

const REGÈ = [
  { tit: "Rapòte sa ou wè, pa sa ou tande", tèks: "Fè rapò sou ensidan ou wè ak pwòp je w, oswa enfòmasyon ou sèten ki egzat. Evite pataje rimè san konfimasyon." },
  { tit: "Bay detay klè", tèks: "Yon tit kout ak yon deskripsyon presi ede otorite ak vwazen konprann sitiyasyon an pi vit." },
  { tit: "Itilize kategori ki kòrèk", tèks: "Chwazi kategori ki dekri ensidan an pi byen — sa ede sistèm nan avize bon otorite a." },
  { tit: "Respekte vi prive lòt moun", tèks: "Evite pataje foto ki idantifye moun san rezon, sitou timoun." },
  { tit: "Konfime, pa doub-rapòte", tèks: "Si ou wè yon rapò ki deja egziste pou menm ensidan an, itilize bouton 'Konfime' oswa ajoute yon kòmantè, pito pase kreye yon dezyèm rapò." },
  { tit: "Siyale kontni ki ka fo", tèks: "Si ou wè yon rapò ki sanble pa egzat oswa ki ka fo, itilize bouton 'Siyale' pou n ka revize l." },
];

export default function GidKominotè() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar />
      <div className="screen">
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate("/meni")}>
          ← Retounen
        </button>
        <h1 style={{ fontSize: 20 }}>📖 Gid Kominotè</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 0 }}>
          Kèk règ senp pou nou kenbe Ayiti Alèt yon zouti serye e itil pou tout moun.
        </p>

        {REGÈ.map((r, i) => (
          <div key={i} className="card">
            <strong style={{ fontSize: 14 }}>{i + 1}. {r.tit}</strong>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>{r.tèks}</p>
          </div>
        ))}
      </div>
      <NavBar />
    </>
  );
}
