import { initializeApp, cert, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// Firebase Admin mande yon "sèvis kont" (service account) JSON — jenere l nan
// Firebase Console → Project Settings → Service Accounts → Generate new
// private key. Mete tout kontni JSON fichye a nan yon sèl varyab anviwònman
// (FIREBASE_SERVICE_ACCOUNT), oswa notifikasyon yo ap dezaktive an silans
// (aplikasyon an kontinye fonksyone nòmalman san push).
let app: App | null = null;
let eseyeDeja = false;

function initFirebase(): App | null {
  if (app) return app;
  if (eseyeDeja) return null;
  eseyeDeja = true;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const serviceAccount = JSON.parse(raw);
    app = initializeApp({ credential: cert(serviceAccount) });
    return app;
  } catch (e) {
    console.error("Konfigirasyon FIREBASE_SERVICE_ACCOUNT envalid:", e);
    return null;
  }
}

export interface NotifikasyonPush {
  tit: string;
  kò: string;
  done_?: Record<string, string>;
}

// Voye yon notifikasyon bay yon lis tokèn. Retounen lis tokèn ki "mouri"
// (aparèy ki dezenstale app la, elatriye) pou nou ka efase yo nan baz done a.
export async function voyeNotifikasyon(tokèns: string[], notif: NotifikasyonPush): Promise<string[]> {
  const firebaseApp = initFirebase();
  if (!firebaseApp || tokèns.length === 0) return [];

  const tokènMouri: string[] = [];
  const gwoup: string[][] = [];
  for (let i = 0; i < tokèns.length; i += 500) gwoup.push(tokèns.slice(i, i + 500));

  for (const g of gwoup) {
    try {
      const rezilta = await getMessaging(firebaseApp).sendEachForMulticast({
        tokens: g,
        notification: { title: notif.tit, body: notif.kò },
        data: notif.done_ ?? {},
        webpush: {
          notification: { icon: "/icon-192.png", badge: "/icon-192.png" },
          fcmOptions: { link: "/" },
        },
      });
      rezilta.responses.forEach((r, i) => {
        if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
          tokènMouri.push(g[i]);
        }
      });
    } catch (e) {
      console.error("Erè pandan voye notifikasyon push:", e);
    }
  }
  return tokènMouri;
}

export function firebaseAktif(): boolean {
  return !!initFirebase();
}
