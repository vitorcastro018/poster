import Link from "next/link";
import { prisma } from "@posterai/db";
import { fileUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function Clientes() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { carousels: true, videos: true } } } });
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Link href="/clientes/novo" className="btn btn-primary">Novo cliente</Link>
      </div>
      {clients.length === 0 && <p className="text-neutral-500">Nenhum cliente ainda. Cadastre o primeiro com o kit de marca.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <Link key={c.id} href={`/clientes/${c.id}`} className="card flex items-center gap-3 hover:border-violet-600">
            <div className="flex h-14 w-14 items-center justify-center rounded-md" style={{ background: (c.colors as string[])[0] ?? "#222" }}>
              {c.logoPath && <img src={fileUrl(c.logoPath)!} alt="" className="max-h-10 max-w-10 object-contain" />}
            </div>
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-neutral-500">{c._count.carousels} carrosséis · {c._count.videos} vídeos</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
