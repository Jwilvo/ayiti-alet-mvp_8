import crypto from "crypto";

// Chifreman AES-256-GCM pou nimewo dokiman idantite yo (NIF/CIN/Paspò).
// Kle a soti nan ENCRYPTION_KEY (32 byte, base64) — si li pa la, nou jenere
// yon kle tanporè SÈLMAN pou devlopman lokal (redemare sèvè a pèdi kapasite
// dechifre ansyen valè yo — pou sa, mete yon vrè ENCRYPTION_KEY an pwodiksyon).
function jwennKle(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (raw) {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
    console.warn("ENCRYPTION_KEY pa gen bon longè (dwe 32 byte an base64) — jenere yon kle tanporè.");
  }
  if (!(global as any).__tanporèKle) {
    (global as any).__tanporèKle = crypto.randomBytes(32);
    console.warn("⚠ ENCRYPTION_KEY pa konfigire — itilize yon kle tanporè (pa pou pwodiksyon).");
  }
  return (global as any).__tanporèKle;
}

export function chifre(tèks: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", jwennKle(), iv);
  const chifreData = Buffer.concat([cipher.update(tèks, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, chifreData]).toString("base64");
}

export function dechifre(valèChifre: string): string {
  const done_ = Buffer.from(valèChifre, "base64");
  const iv = done_.subarray(0, 12);
  const tag = done_.subarray(12, 28);
  const chifreData = done_.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", jwennKle(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(chifreData), decipher.final()]).toString("utf8");
}

// Ash SHA-256 fiks (pa gen sèl/IV) — sèvi SÈLMAN pou verifye inisite (yon sèl
// moun pa ka gen 2 kont ak menm dokiman an), pa pou estokaj sekrè li menm.
export function ashDokiman(nimewo: string): string {
  const nòmalize = nimewo.trim().toUpperCase().replace(/[\s-]/g, "");
  return crypto.createHash("sha256").update(nòmalize).digest("hex");
}
