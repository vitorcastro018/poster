import { prisma } from "@posterai/db";
import { redis } from "@/lib/queue";

export const dynamic = "force-dynamic";

async function check(fn: () => Promise<unknown>) {
  try { await fn(); return true; } catch { return false; }
}

export async function GET() {
  const [db, redisOk, hb] = await Promise.all([
    check(() => prisma.$queryRaw`SELECT 1`),
    check(() => redis.ping()),
    redis.get("worker:heartbeat").catch(() => null),
  ]);
  const worker = hb !== null;
  return Response.json({ db, redis: redisOk, worker, ok: db && redisOk && worker }, { status: db && redisOk ? 200 : 503 });
}
