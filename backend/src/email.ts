import nodemailer from "nodemailer";

// Voye imèl pa nenpòt founisè SMTP (Gmail ak "app password", SendGrid,
// Mailgun, elatriye) — konfigire ak SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.
// Si yo pa konfigire, nou ekri mesaj la nan jounal sèvè a sèlman (bon pou
// devlopman/tès) — nou pa janm retounen kòd sekrè yo nan repons API a.
let transporteur: nodemailer.Transporter | null = null;
let eseyeDeja = false;

function jwennTransporteur(): nodemailer.Transporter | null {
  if (transporteur) return transporteur;
  if (eseyeDeja) return null;
  eseyeDeja = true;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;

  try {
    transporteur = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
      // Anpil anviwònman ebèjman (tankou Render) gen pwoblèm koneksyon
      // IPv6 sòti — Gmail SMTP retounen tou de adrès IPv4 AK IPv6, e Node
      // ka eseye IPv6 an premye e echwe (ENETUNREACH). Fòse IPv4 rezoud sa.
      family: 4,
    } as any);
    return transporteur;
  } catch {
    return null;
  }
}

export function imèlAktif(): boolean {
  return !!jwennTransporteur();
}

export async function voyeImèl(destinatè: string, sijè: string, kò: string): Promise<boolean> {
  const t = jwennTransporteur();
  const soti = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!t || !soti) {
    console.log(`[IMÈL-SIMILE, SMTP pa konfigire] Bay ${destinatè} — ${sijè}: ${kò}`);
    return false;
  }

  try {
    await t.sendMail({ from: soti, to: destinatè, subject: sijè, text: kò });
    return true;
  } catch (e) {
    console.error("Erè pandan voye imèl:", e);
    return false;
  }
}
