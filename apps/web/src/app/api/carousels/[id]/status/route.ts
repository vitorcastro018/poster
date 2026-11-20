import { prisma } from "@posterai/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = await prisma.carousel.findUnique({ where: { id }, select: { status: true, zipPath: true } });
  if (!c) return new Response("Não encontrado", { status: 404 });
  const job = await prisma.job.findFirst({ where: { refId: id, type: "CAROUSEL_RENDER" }, orderBy: { createdAt: "desc" } });
  return Response.json({ status: c.status, zipPath: c.zipPath, error: job?.status === "FAILED" ? job.error : null });
}
