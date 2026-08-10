import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { api } from "./api";

// Konfigirasyon Firebase la se valè "piblik" (pa sekrè, kontrèman ak
// FIREBASE_SERVICE_ACCOUNT backend lan) — men si yo pa la, aplikasyon an dwe
// kontinye fonksyone nòmalman san notifikasyon push, san kraze.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function konfigireByen(): boolean {
  return !!(config.apiKey && config.projectId && config.messagingSenderId && config.appId && VAPID_KEY);
}

function jwenn(): Messaging | null {
  if (!konfigireByen()) return null;
  if (messaging) return messaging;
  try {
    app = initializeApp(config);
    messaging = getMessaging(app);
    return messaging;
  } catch {
    return null;
  }
}

let dejaEseye = false;

// Mande pèmisyon notifikasyon an silans (navigatè a montre pwòp bwat dyalòg
// li — pa gen okenn bouton "aktive notifikasyon" apa nan aplikasyon an),
// jwenn tokèn FCM aparèy la, epi anrejistre l bay backend la. Rele sa a yon
// sèl fwa pou sesyon an, sèlman si moun nan konekte (nou bezwen konekte
// tokèn ak yon kont pou n ka voye push bay bon moun).
export async function initNotifikasyonPush(): Promise<void> {
  if (dejaEseye) return;
  dejaEseye = true;

  const msg = jwenn();
  if (!msg || !("Notification" in window)) return;
  if (!localStorage.getItem("ayiti_alet_token")) return; // sèlman pou itilizatè konekte

  try {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const tokèn = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
    if (tokèn) {
      await api.anrejistreTokènPush(tokèn);
    }
  } catch (e) {
    console.warn("Pa t ka konfigire notifikasyon push:", e);
  }
}

// Lè yon notifikasyon rive PANDAN aplikasyon an louvri (premye plan), FCM pa
// otomatikman montre yon notifikasyon sistèm — se pou nou fè sa nou menm, ak
// yon son, pou moun nan konnen yon bagay rive menm si l ap gade telefòn lan.
export function koutePushPlanDevan(onMesaj: (tit: string, kò: string) => void) {
  const msg = jwenn();
  if (!msg) return;
  onMessage(msg, (payload) => {
    const tit = payload.notification?.title ?? "Ayiti Alèt";
    const kò = payload.notification?.body ?? "";
    onMesaj(tit, kò);
    jweSon();
    if (Notification.permission === "granted") {
      new Notification(tit, { body: kò, icon: "/icon-192.png" });
    }
  });
}

function jweSon() {
  try {
    const son = new Audio("/notification.mp3");
    son.play().catch(() => {});
  } catch {
    // ignore — son pa esansyèl, notifikasyon vizyèl la rete la
  }
}
