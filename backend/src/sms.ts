// Voye SMS pa Twilio si TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM
// konfigire. Si yo pa konfigire, nou ekri mesaj la nan jounal sèvè a sèlman
// (itil pou devlopman/tès) — nou pa janm retounen kòd sekrè yo nan repons
// API a, menm si SMS pa reyèlman voye.
let kliyanTwilio: any = null;
let eseyeDeja = false;

function jwennKliyan() {
  if (kliyanTwilio) return kliyanTwilio;
  if (eseyeDeja) return null;
  eseyeDeja = true;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tokèn = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !tokèn) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilio = require("twilio");
    kliyanTwilio = twilio(sid, tokèn);
    return kliyanTwilio;
  } catch {
    return null;
  }
}

export function smsAktif(): boolean {
  return !!jwennKliyan() && !!process.env.TWILIO_FROM;
}

export async function voyeSms(telefon: string, mesaj: string): Promise<boolean> {
  const kliyan = jwennKliyan();
  const soti = process.env.TWILIO_FROM;

  if (!kliyan || !soti) {
    // Mòd devlopman: ekri sèlman nan jounal, PA janm retounen sa bay kliyan an.
    console.log(`[SMS-SIMULE, Twilio pa konfigire] Bay ${telefon}: ${mesaj}`);
    return false;
  }

  try {
    await kliyan.messages.create({ to: telefon, from: soti, body: mesaj });
    return true;
  } catch (e) {
    console.error("Erè pandan voye SMS:", e);
    return false;
  }
}
