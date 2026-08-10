const VI_KEY = "ayiti_alet_rapò_li_deja";

function jwennAnsanmLi(): Set<string> {
  try {
    const raw = localStorage.getItem(VI_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function sove(ansanm: Set<string>) {
  localStorage.setItem(VI_KEY, JSON.stringify([...ansanm]));
  notifye();
}

let koutePou: (() => void)[] = [];
function notifye() {
  koutePou.forEach((f) => f());
}

export function abòneChanjman(f: () => void): () => void {
  koutePou.push(f);
  return () => {
    koutePou = koutePou.filter((x) => x !== f);
  };
}

export function dejaLi(id: string): boolean {
  return jwennAnsanmLi().has(id);
}

export function markeLi(id: string) {
  const ansanm = jwennAnsanmLi();
  if (ansanm.has(id)) return;
  ansanm.add(id);
  sove(ansanm);
}

export function konteRapòPokoLi(ids: string[]): number {
  const ansanm = jwennAnsanmLi();
  return ids.filter((id) => !ansanm.has(id)).length;
}
