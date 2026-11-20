import Link from "next/link";
import { prisma } from "@posterai/db";
import { ScaledSlide } from "@/components/ScaledSlide";
import { brandFromRecord, slideProps, type Slide } from "@posterai/templates";
import { fileUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";
const STATUS: Record<string, string> = { DRAFT: "Rascunho", QUEUED: "Na fila", PROCESSING: "Renderizando", READY: "Pronto", FAILED: "Falhou" };

export default async function Carrosseis({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  const [clients, items] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.carousel.findMany({ where: client ? { clientId: client } : {}, orderBy: { createdAt: "desc" }, include: { client: true } }),
  ]);
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Carrosséis</h1>
        <div className="flex gap-2">
          <form><select name="client" defaultValue={client ?? ""} className="input w-auto" >
            <option value="">Todos os clientes</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select><button className="btn ml-2">Filtrar</button></form>
          <Link href="/carrosseis/novo" className="btn btn-primary">Novo carrossel</Link>
        </div>
      </div>
      {items.length === 0 && <p className="text-neutral-500">Nada por aqui ainda.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => {
          const slides = c.slides as unknown as Slide[];
          const brand = brandFromRecord(c.client, fileUrl(c.client.logoPath));
          return (
            <Link key={c.id} href={`/carrosseis/${c.id}`} className="card space-y-2 hover:border-violet-600">
              {slides[0] && <ScaledSlide template={c.template ?? "texto-forte"} {...slideProps(slides, 0, brand, fileUrl(slides[0].imagePath))} />}
              <div className="line-clamp-2 text-sm font-medium">{c.topic}</div>
              <div className="flex justify-between text-xs text-neutral-500"><span>{c.client.name}</span><span>{STATUS[c.status]}</span></div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
