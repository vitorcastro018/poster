import { prisma } from "@posterai/db";
import { redis } from "@/lib/queue";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

export default async function Home() {
  const db = (await safe(() => prisma.$queryRaw`SELECT 1`)) !== null;
  const redisOk = (await safe(() => redis.ping())) !== null;
  const worker = (await safe(() => redis.get("worker:heartbeat"))) !== null;
  const items = [["Banco (Postgres)", db], ["Fila (Redis)", redisOk], ["Worker", worker]] as const;
  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">PosterAi</h1>
        <form action={logout}><button className="text-sm text-neutral-500 underline">Sair</button></form>
      </div>
      <p className="mt-2 text-neutral-600">Fase 0 concluída: a infraestrutura está de pé. Clientes, carrosséis e vídeos vêm nas próximas fases.</p>
      <ul className="mt-6 space-y-2">
        {items.map(([name, ok]) => (
          <li key={name} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />{name}
          </li>
        ))}
      </ul>
    </main>
  );
}
