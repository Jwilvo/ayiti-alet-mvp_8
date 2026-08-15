const KEY = "ayiti_alet_ijans_repondi";

function jwennAnsanm(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function ijansDejaReponn(id: string): boolean {
  return jwennAnsanm().has(id);
}

export function markeIjansReponn(id: string) {
  const ansanm = jwennAnsanm();
  ansanm.add(id);
  localStorage.setItem(KEY, JSON.stringify([...ansanm]));
}
