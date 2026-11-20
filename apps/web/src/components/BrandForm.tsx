"use client";
import { useActionState, useMemo, useState } from "react";
import { saveClient } from "@/app/clientes/actions";
import { ScaledSlide } from "./ScaledSlide";
import { HEX, type Brand, type Slide } from "@posterai/templates";

export interface ClientFormData {
  id?: string; name: string; colors: string[]; titleFont: string; bodyFont: string; voiceTone: string;
  capFont: string; capColor: string; capHighlight: string; capPosition: string; logoUrl: string | null;
}

const SAMPLE: Slide[] = [
  { type: "hook", title: "5 erros ao comprar o primeiro imóvel" },
  { type: "content", title: "Não ver o custo total", body: "Entrada, taxas e documentação pesam mais do que parece." },
  { type: "cta", title: "Fale com a gente", body: "Chame no direct." },
];

export function BrandForm({ initial }: { initial: ClientFormData }) {
  const [error, action, pending] = useActionState(saveClient, null);
  const [name, setName] = useState(initial.name);
  const [colors, setColors] = useState(initial.colors.length ? initial.colors : ["#0F172A", "#F8FAFC", "#F59E0B"]);
  const [titleFont, setTitleFont] = useState(initial.titleFont);
  const [bodyFont, setBodyFont] = useState(initial.bodyFont);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logoUrl);

  const brand: Brand = useMemo(
    () => ({ name: name || "Cliente", logoSrc: logoPreview, colors: colors.filter((c) => HEX.test(c)), titleFont: titleFont || "Inter", bodyFont: bodyFont || "Inter" }),
    [name, logoPreview, colors, titleFont, bodyFont],
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />
      <div className="space-y-5">
        <section className="card space-y-3">
          <div><label className="label">Nome</label><input name="name" required value={name} onChange={(e) => setName(e.target.value)} className="input" /></div>
          <div>
            <label className="label">Logo (PNG transparente)</label>
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="input"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
          </div>
        </section>

        <section className="card space-y-3">
          <label className="label">Cores (até 5) — 1ª fundo principal, 2ª fundo claro, 3ª destaque</label>
          <div className="flex flex-wrap gap-3">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1 rounded-md border border-neutral-700 p-1">
                <input type="color" value={HEX.test(c) ? c : "#000000"} onChange={(e) => setColors(colors.map((x, j) => (j === i ? e.target.value : x)))} className="h-9 w-9 cursor-pointer bg-transparent" />
                <span className="w-20 font-mono text-xs text-neutral-400">{c}</span>
                <button type="button" className="px-1 text-neutral-500 hover:text-red-400" onClick={() => setColors(colors.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            {colors.length < 5 && <button type="button" className="btn" onClick={() => setColors([...colors, "#888888"])}>+ cor</button>}
          </div>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <div><label className="label">Fonte do título (Google Fonts)</label><input name="titleFont" value={titleFont} onChange={(e) => setTitleFont(e.target.value)} className="input" placeholder="Montserrat" /></div>
          <div><label className="label">Fonte do texto (Google Fonts)</label><input name="bodyFont" value={bodyFont} onChange={(e) => setBodyFont(e.target.value)} className="input" placeholder="Inter" /></div>
        </section>

        <section className="card">
          <label className="label">Tom de voz (2 ou 3 frases)</label>
          <textarea name="voiceTone" rows={3} defaultValue={initial.voiceTone} className="input" placeholder="Próximo, direto, sem gírias." />
        </section>

        <section className="card space-y-3">
          <h3 className="text-sm text-neutral-300">Estilo de legenda dos vídeos</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Fonte</label><input name="capFont" defaultValue={initial.capFont} className="input" /></div>
            <div><label className="label">Posição</label>
              <select name="capPosition" defaultValue={initial.capPosition} className="input">
                <option value="bottom">Embaixo</option><option value="center">Centro</option><option value="top">Em cima</option>
              </select></div>
            <div><label className="label">Cor</label><input name="capColor" type="color" defaultValue={initial.capColor} className="input h-10 p-1" /></div>
            <div><label className="label">Cor de destaque</label><input name="capHighlight" type="color" defaultValue={initial.capHighlight} className="input h-10 p-1" /></div>
          </div>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={pending} className="btn btn-primary">{pending ? "Salvando…" : "Salvar cliente"}</button>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
        <h3 className="text-sm text-neutral-400">Prévia da marca</h3>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE.map((s, i) => (
            <div key={i} className={i === 0 ? "col-span-2" : ""}>
              <ScaledSlide template="texto-forte" brand={brand} slide={s} index={i} total={SAMPLE.length} contentNumber={1} />
            </div>
          ))}
        </div>
      </aside>
    </form>
  );
}
