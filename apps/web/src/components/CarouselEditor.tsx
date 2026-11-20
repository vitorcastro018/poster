"use client";
import { useEffect, useState } from "react";
import { TEMPLATES, slideProps, type Brand, type Slide } from "@posterai/templates";
import { exportCarousel, saveCarousel } from "@/app/carrosseis/actions";
import { ScaledSlide } from "./ScaledSlide";

const url = (rel?: string) => (rel ? `/api/files/${rel.split("/").map(encodeURIComponent).join("/")}` : null);
const LABEL = { hook: "Gancho", content: "Conteúdo", cta: "CTA" } as const;

export function CarouselEditor(props: { id: string; brand: Brand; initial: { template: string; slides: Slide[]; caption: string; status: string; zipPath: string | null } }) {
  const { id, brand } = props;
  const [template, setTemplate] = useState(props.initial.template);
  const [slides, setSlides] = useState<Slide[]>(props.initial.slides);
  const [caption, setCaption] = useState(props.initial.caption);
  const [sel, setSel] = useState(0);
  const [saved, setSaved] = useState(true);
  const [status, setStatus] = useState(props.initial.status);
  const [zip, setZip] = useState<string | null>(props.initial.zipPath);
  const [error, setError] = useState<string | null>(null);
  const busy = status === "QUEUED" || status === "PROCESSING";

  const update = (i: number, patch: Partial<Slide>) => { setSlides(slides.map((s, j) => (j === i ? { ...s, ...patch } : s))); setSaved(false); };
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= slides.length) return;
    const n = [...slides]; [n[i], n[j]] = [n[j], n[i]]; setSlides(n); setSel(j); setSaved(false);
  };
  const remove = (i: number) => { if (slides.length <= 1) return; setSlides(slides.filter((_, j) => j !== i)); setSel(Math.max(0, i - 1)); setSaved(false); };
  function insertContent() {
    const at = slides.at(-1)?.type === "cta" ? slides.length - 1 : slides.length;
    const n = [...slides]; n.splice(at, 0, { type: "content", title: "Novo slide", body: "" });
    setSlides(n); setSel(at); setSaved(false); return n;
  }
  async function upload(i: number, file: File) {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch(`/api/carousels/${id}/image`, { method: "POST", body: fd });
    const j = await r.json();
    if (!r.ok) { setError(j.error); return; }
    update(i, { imagePath: j.path });
  }
  async function save() { await saveCarousel(id, { template, slides, caption }); setSaved(true); }
  async function doExport() {
    setError(null); await save(); setStatus("QUEUED"); await exportCarousel(id);
  }

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/carousels/${id}/status`); if (!r.ok) return;
      const j = await r.json();
      setStatus(j.status); setZip(j.zipPath); if (j.error) setError(j.error);
    }, 2000);
    return () => clearInterval(t);
  }, [busy, id]);

  const cur = slides[Math.min(sel, slides.length - 1)];
  const i = Math.min(sel, slides.length - 1);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div className="card flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-400">Template</label>
          <select value={template} onChange={(e) => { setTemplate(e.target.value); setSaved(false); }} className="input w-auto">
            {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-neutral-500">{saved ? "Salvo" : "Alterações não salvas"}</span>
            <button className="btn" onClick={save} disabled={saved}>Salvar</button>
            <button className="btn btn-primary" onClick={doExport} disabled={busy}>{busy ? "Renderizando…" : "Exportar PNG (ZIP)"}</button>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {status === "READY" && zip && <a href={url(zip)!} download className="btn btn-primary w-fit">Baixar ZIP</a>}

        {slides.map((s, k) => (
          <div key={k} onClick={() => setSel(k)} className={`card space-y-2 ${k === i ? "border-violet-600" : ""}`}>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{k + 1}. {LABEL[s.type]}</span>
              <span className="flex gap-1">
                <button className="btn px-2 py-0.5" onClick={() => move(k, -1)}>↑</button>
                <button className="btn px-2 py-0.5" onClick={() => move(k, 1)}>↓</button>
                <button className="btn btn-danger px-2 py-0.5" onClick={() => remove(k)}>×</button>
              </span>
            </div>
            <input className="input" value={s.title} onChange={(e) => update(k, { title: e.target.value })} />
            <textarea className="input" rows={2} value={s.body ?? ""} onChange={(e) => update(k, { body: e.target.value })} placeholder="Texto de apoio" />
            {template === "foto-texto" && s.type !== "cta" && (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                Foto: <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files?.[0] && upload(k, e.target.files[0])} />
                {s.imagePath && <button className="underline" onClick={() => update(k, { imagePath: undefined })}>remover</button>}
              </div>
            )}
          </div>
        ))}
        <button className="btn" onClick={insertContent}>+ Slide de conteúdo</button>

        <div className="card">
          <label className="label">Legenda do post</label>
          <textarea className="input" rows={8} value={caption} onChange={(e) => { setCaption(e.target.value); setSaved(false); }} />
        </div>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
        {cur && <ScaledSlide template={template} {...slideProps(slides, i, brand, url(cur.imagePath))} />}
        <div className="grid grid-cols-5 gap-1">
          {slides.map((_, k) => (
            <button key={k} onClick={() => setSel(k)} className={`overflow-hidden rounded ${k === i ? "ring-2 ring-violet-500" : "opacity-70"}`}>
              <ScaledSlide template={template} {...slideProps(slides, k, brand, url(slides[k].imagePath))} />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
