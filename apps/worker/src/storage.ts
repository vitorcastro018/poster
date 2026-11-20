import path from "node:path";
import { readFile } from "node:fs/promises";

export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "../../storage");

export function storagePath(rel: string) {
  const full = path.resolve(STORAGE_DIR, rel);
  if (!full.startsWith(STORAGE_DIR + path.sep)) throw new Error("Caminho inválido");
  return full;
}

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

/** Lê uma imagem do storage como data URI (o HTML renderizado fica autocontido). */
export async function toDataUri(rel?: string | null) {
  if (!rel) return null;
  try {
    const buf = await readFile(storagePath(rel));
    return `data:${MIME[path.extname(rel).slice(1).toLowerCase()] ?? "image/png"};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
