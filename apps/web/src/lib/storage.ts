import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "../../storage");

/** Resolve um caminho relativo dentro do storage, recusando qualquer fuga da pasta. */
export function storagePath(rel: string) {
  const full = path.resolve(STORAGE_DIR, rel);
  if (full !== STORAGE_DIR && !full.startsWith(STORAGE_DIR + path.sep)) throw new Error("Caminho inválido");
  return full;
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Salva uma imagem enviada (PNG/JPG/WEBP). Devolve o caminho relativo ao storage. */
export async function saveImage(file: File, dir: string, name: string) {
  const ext = EXT[file.type];
  if (!ext) throw new Error("Envie uma imagem PNG, JPG ou WEBP.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Imagem maior que 8 MB.");
  const rel = `${dir}/${name}.${ext}`;
  await mkdir(storagePath(dir), { recursive: true });
  await writeFile(storagePath(rel), Buffer.from(await file.arrayBuffer()));
  return rel;
}

export const fileUrl = (rel?: string | null) => (rel ? `/api/files/${rel.split("/").map(encodeURIComponent).join("/")}` : null);
