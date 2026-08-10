/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Mòd offline (Workbox) — kachte fichye aplikasyon an pou l ka louvri san
// entènèt. `self.__WB_MANIFEST` ranpli otomatikman pa vite-plugin-pwa
// (strategi "injectManifest") pandan bild la.
precacheAndRoute(self.__WB_MANIFEST);

// Notifikasyon Firebase Cloud Messaging pandan aplikasyon an FÈMEN (background)
// — se sa ki fè telefòn lan "sonnen"/montre yon notifikasyon menm si moun nan
// pa gen aplikasyon an louvri.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    onBackgroundMessage(messaging, (payload) => {
      const tit = payload.notification?.title ?? "Ayiti Alèt";
      const kò = payload.notification?.body ?? "";
      self.registration.showNotification(tit, {
        body: kò,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: payload.data,
        ...( { vibrate: [200, 100, 200] } as any),
      });
    });
  } catch (e) {
    console.warn("Firebase Messaging pa konfigire nan service worker la:", e);
  }
}

self.skipWaiting();
