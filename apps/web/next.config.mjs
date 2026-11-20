/** @type {import('next').NextConfig} */
export default {
  output: "standalone",
  transpilePackages: ["@posterai/db"],
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  serverExternalPackages: ["@prisma/client", "bullmq", "ioredis"],
};
