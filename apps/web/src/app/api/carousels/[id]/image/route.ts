import { saveImage } from "@/lib/storage";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "Arquivo ausente" }, { status: 400 });
  try {
    const path = await saveImage(file, `carousels/${id.replace(/[^\w-]/g, "")}`, `img-${Date.now()}`);
    return Response.json({ path });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Falha no upload" }, { status: 400 });
  }
}
