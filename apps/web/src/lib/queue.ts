import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAME } from "@posterai/db";

const g = globalThis as unknown as { redis?: IORedis; queue?: Queue };

export const redis = (g.redis ??= new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  lazyConnect: false,
}));
export const queue = (g.queue ??= new Queue(QUEUE_NAME, { connection: redis }));
