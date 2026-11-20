import Link from "next/link";
import { prisma } from "@posterai/db";
import { redis } from "@/lib/queue";

export const dynamic = "force-dynamic";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

export default async function Home() {
  const db = (await safe(() => prisma.$queryRaw`SELECT 1`)) !== null;
  const redisOk = (await safe(() => redis.ping())) !== null;
  const worker = (await safe(() => redis.get("worker:heartbeat"))) !== null;
  const [clients, carousels] = await Promise.all([
    safe(() => prisma.client.count()), safe(() => prisma.carousel.count()),
  ]);
  const items = [["Banco (Postgres)", db], ["Fila (Redis)", redisOk], ["Worker", worker]] as const;
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/clientes" className="card hover:border-violet-600"><div className="text-3xl font-semibold">{clients ?? "–"}</div><div className="text-neutral-400">Clientes</div></Link>
        <Link href="/carrosseis" className="card hover:border-violet-600"><div className="text-3xl font-semibold">{carousels ?? "–"}</div><div className="text-neutral-400">Carrosséis</div></Link>
      </div>
      <div className="card">
        <h2 className="mb-2 text-sm text-neutral-400">Sistema</h2>
        <ul className="space-y-2">
          {items.map(([name, ok]) => (
            <li key={name} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />{name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
