import { useEffect, useState } from "react";
import { api, KominZòn } from "../api";

let kachKomin: KominZòn[] | null = null;

interface Props {
  value: string;
  onChange: (komin: string) => void;
  placeholder?: string;
}

export default function KominSelect({ value, onChange, placeholder = "Chwazi komin ou..." }: Props) {
  const [lis, setLis] = useState<KominZòn[] | null>(kachKomin);

  useEffect(() => {
    if (kachKomin) return;
    api
      .listKomin()
      .then((data) => {
        kachKomin = data;
        setLis(data);
      })
      .catch(() => {});
  }, []);

  const parDepatman = new Map<string, string[]>();
  for (const z of lis ?? []) {
    if (!parDepatman.has(z.depatman)) parDepatman.set(z.depatman, []);
    parDepatman.get(z.depatman)!.push(z.komin);
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{lis ? placeholder : "Ap chaje lis komin yo..."}</option>
      {[...parDepatman.entries()].map(([depatman, komins]) => (
        <optgroup key={depatman} label={depatman}>
          {komins.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
