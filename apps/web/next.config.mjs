import nextEnv from "@next/env";
nextEnv.loadEnvConfig(new URL("../../", import.meta.url).pathname, process.env.NODE_ENV !== "production", console, true);

/** @type {import('next').NextConfig} */
export default {
  output: "standalone",
  transpilePackages: ["@posterai/db", "@posterai/templates", "@posterai/ai"],
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  serverExternalPackages: ["@prisma/client", "bullmq", "ioredis"],
};
