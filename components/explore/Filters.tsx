"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const GENDER_OPTS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unisex", label: "Unisex" },
];

const FOL_OPTS = [
  { value: "micro", label: "0–500K" },
  { value: "macro", label: "500K–2M" },
  { value: "mega", label: "2M+" },
];

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [genders, setGenders] = useState<string[]>(sp.getAll("gender"));
  const [fol, setFol] = useState<string[]>(sp.getAll("fol"));
  const q = sp.get("q") ?? "";

  useEffect(() => {
    setGenders(sp.getAll("gender"));
    setFol(sp.getAll("fol"));
  }, [sp]);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function apply() {
    const params = new URLSearchParams(sp.toString());
    params.delete("gender"); genders.forEach((g) => params.append("gender", g));
    params.delete("fol");    fol.forEach((f) => params.append("fol", f));
    // reset pagination if any later
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams(sp.toString());
    params.delete("gender");
    params.delete("fol");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="w-full max-w-xs pr-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-wide text-neutral-900">Filters</h3>
        {(genders.length > 0 || fol.length > 0) && (
          <button onClick={clearAll} className="text-xs text-neutral-500 hover:text-neutral-800">Clear</button>
        )}
      </div>

      <section className="mb-8">
        <h4 className="mb-3 text-sm font-medium text-neutral-700">Gender</h4>
        <div className="space-y-2">
          {GENDER_OPTS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={genders.includes(opt.value)}
                onChange={() => toggle(genders, opt.value, setGenders)}
                className="size-4 rounded border-neutral-300 text-black focus:ring-black"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-neutral-700">Followers</h4>
        <div className="space-y-2">
          {FOL_OPTS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={fol.includes(opt.value)}
                onChange={() => toggle(fol, opt.value, setFol)}
                className="size-4 rounded border-neutral-300 text-black focus:ring-black"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <button
        onClick={apply}
        className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:border-neutral-900"
      >
        Apply filters
      </button>
    </aside>
  );
}
