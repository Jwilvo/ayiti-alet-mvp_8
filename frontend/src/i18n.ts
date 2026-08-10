export type Lang = "ht" | "fr" | "en";

const LANG_KEY = "ayiti_alet_lang";

// N ap kòmanse ak tradiksyon pou ekran/eleman ki pi itilize yo (navigasyon,
// Akèy, Alèt/Nouvèl). Rès aplikasyon an (kòmantè, admin, paj Meni segondè yo)
// rete an Kreyòl pou kounye a — n ap ogmante kouvèti a nan pwochen vèsyon yo.
const DIKSYONÈ: Record<Lang, Record<string, string>> = {
  ht: {
    "nav.akèy": "Akèy",
    "nav.alèt": "Alèt",
    "nav.sèvis": "Sèvis",
    "nav.nouvèl": "Nouvèl",
    "nav.meni": "Meni",
    "home.sos.caption.default": "Peze si ou nan yon danje imedya. L ap voye pozisyon ou.",
    "home.sos.caption.armed": "Peze ankò pou voye alèt ijans ak pozisyon ou.",
    "home.sos.caption.active": "SOS ou a aktif — kontak ou yo ka swiv pozisyon w.",
    "home.rapòte": "Fè yon rapò",
    "home.pozisyon.aktive": "Aktive lokalizasyon pou wè otomatikman ki alèt ki toupre w.",
    "alèt.tit": "🔔 Alèt (toupre w)",
    "alèt.vid": "Pa gen okenn alèt nan zòn ou kounye a. Sa bon sinyal!",
    "alèt.triyaj.nouvo": "↓ Pi nouvo an premye",
    "alèt.triyaj.ansyen": "↑ Pi ansyen an premye",
    "alèt.li_deja": "li deja",
    "nouvèl.tit": "ℹ️ Nouvèl (rejyon w)",
    "nouvèl.vid": "Pa gen nouvèl nan rejyon w kounye a.",
    "topbar.konekte": "Konekte",
    "meni.tit": "Meni",
    "meni.pa_konekte": "Ou pa konekte",
  },
  fr: {
    "nav.akèy": "Accueil",
    "nav.alèt": "Alertes",
    "nav.sèvis": "Services",
    "nav.nouvèl": "Actualités",
    "nav.meni": "Menu",
    "home.sos.caption.default": "Appuyez si vous êtes en danger immédiat. Votre position sera envoyée.",
    "home.sos.caption.armed": "Appuyez à nouveau pour envoyer l'alerte avec votre position.",
    "home.sos.caption.active": "Votre SOS est actif — vos contacts peuvent suivre votre position.",
    "home.rapòte": "Faire un signalement",
    "home.pozisyon.aktive": "Activez la localisation pour voir automatiquement les alertes proches.",
    "alèt.tit": "🔔 Alertes (près de vous)",
    "alèt.vid": "Aucune alerte dans votre zone actuellement. Bon signe !",
    "alèt.triyaj.nouvo": "↓ Plus récent d'abord",
    "alèt.triyaj.ansyen": "↑ Plus ancien d'abord",
    "alèt.li_deja": "déjà lu",
    "nouvèl.tit": "ℹ️ Actualités (votre région)",
    "nouvèl.vid": "Aucune actualité dans votre région actuellement.",
    "topbar.konekte": "Se connecter",
    "meni.tit": "Menu",
    "meni.pa_konekte": "Non connecté",
  },
  en: {
    "nav.akèy": "Home",
    "nav.alèt": "Alerts",
    "nav.sèvis": "Services",
    "nav.nouvèl": "News",
    "nav.meni": "Menu",
    "home.sos.caption.default": "Press if you're in immediate danger. Your position will be sent.",
    "home.sos.caption.armed": "Press again to send the emergency alert with your position.",
    "home.sos.caption.active": "Your SOS is active — your contacts can follow your position.",
    "home.rapòte": "Make a report",
    "home.pozisyon.aktive": "Enable location to automatically see nearby alerts.",
    "alèt.tit": "🔔 Alerts (near you)",
    "alèt.vid": "No alerts in your area right now. Good sign!",
    "alèt.triyaj.nouvo": "↓ Newest first",
    "alèt.triyaj.ansyen": "↑ Oldest first",
    "alèt.li_deja": "already read",
    "nouvèl.tit": "ℹ️ News (your region)",
    "nouvèl.vid": "No news in your region right now.",
    "topbar.konekte": "Log in",
    "meni.tit": "Menu",
    "meni.pa_konekte": "Not logged in",
  },
};

let koutePou: (() => void)[] = [];
function notifye() {
  koutePou.forEach((f) => f());
}
export function abòneLang(f: () => void): () => void {
  koutePou.push(f);
  return () => {
    koutePou = koutePou.filter((x) => x !== f);
  };
}

export function jwennLang(): Lang {
  const raw = localStorage.getItem(LANG_KEY);
  return raw === "fr" || raw === "en" ? raw : "ht";
}

export function chwaziLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
  notifye();
}

export function t(kle: string): string {
  const lang = jwennLang();
  return DIKSYONÈ[lang][kle] ?? DIKSYONÈ.ht[kle] ?? kle;
}
