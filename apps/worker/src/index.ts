import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma, QUEUE_NAME } from "@posterai/db";
import { renderCarousel } from "./carousel-render.js";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Carrossel já renderiza (Fase 1). Transcrição e render de vídeo (ffmpeg) entram na Fase 2.
const handlers: Record<string, (refId: string) => Promise<void>> = {
  CAROUSEL_RENDER: renderCarousel,
  TRANSCRIBE: async () => { throw new Error("transcribe ainda não implementado (Fase 2)"); },
  VIDEO_RENDER: async () => { throw new Error("video_render ainda não implementado (Fase 2)"); },
  PING: async () => {},
};

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const handler = handlers[job.name];
    if (!handler) throw new Error(`Tipo de job desconhecido: ${job.name}`);
    const { jobId, refId } = job.data as { jobId?: string; refId: string };
    if (jobId) await prisma.job.update({ where: { id: jobId }, data: { status: "PROCESSING" } });
    try {
      await handler(refId);
      if (jobId) await prisma.job.update({ where: { id: jobId }, data: { status: "READY", progress: 100 } });
    } catch (e) {
      if (jobId) await prisma.job.update({ where: { id: jobId }, data: { status: "FAILED", error: String(e) } });
      throw e;
    }
  },
  { connection, concurrency: 1 },
);

// Heartbeat para a tela inicial saber que o worker está vivo.
setInterval(() => { void connection.set("worker:heartbeat", Date.now().toString(), "EX", 30); }, 10_000);
void connection.set("worker:heartbeat", Date.now().toString(), "EX", 30);

worker.on("ready", () => console.log("[worker] pronto, aguardando jobs"));
worker.on("failed", (job, err) => console.error(`[worker] job ${job?.name} falhou:`, err.message));
process.on("SIGTERM", async () => { await worker.close(); process.exit(0); });
