import Link from "next/link";
import { prisma } from "@posterai/db";
import { NewCarouselForm } from "@/components/NewCarouselForm";

export const dynamic = "force-dynamic";

export default async function NovoCarrossel({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">Novo carrossel</h1>
      {clients.length === 0
        ? <p className="text-neutral-400">Cadastre um cliente antes: <Link href="/clientes/novo" className="text-violet-400 underline">novo cliente</Link>.</p>
        : <NewCarouselForm clients={clients} selected={client} />}
    </main>
  );
}
