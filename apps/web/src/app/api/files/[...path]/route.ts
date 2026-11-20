import { readFile } from "node:fs/promises";
import path from "node:path";
import { storagePath } from "@/lib/storage";

const TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", zip: "application/zip", mp4: "video/mp4",
};

export async function GET(_: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  try {
    const file = storagePath(parts.map(decodeURIComponent).join("/"));
    const data = await readFile(file);
    const ext = path.extname(file).slice(1).toLowerCase();
    return new Response(data, {
      headers: { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "private, max-age=60" },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
