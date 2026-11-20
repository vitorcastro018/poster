"use client";
import { useActionState } from "react";
import { TEMPLATES } from "@posterai/templates";
import { createCarousel } from "@/app/carrosseis/actions";

export function NewCarouselForm({ clients, selected }: { clients: { id: string; name: string }[]; selected?: string }) {
  const [error, action, pending] = useActionState(createCarousel, null);
  return (
    <form action={action} className="card max-w-xl space-y-4">
      <div>
        <label className="label">Cliente</label>
        <select name="clientId" defaultValue={selected} required className="input">
          <option value="">Escolha…</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Tema</label>
        <textarea name="topic" rows={3} required className="input" placeholder="5 erros ao comprar o primeiro imóvel" />
      </div>
      <div>
        <label className="label">Template</label>
        <select name="template" className="input">{TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={pending} className="btn btn-primary">{pending ? "Gerando slides…" : "Gerar carrossel"}</button>
    </form>
  );
}
