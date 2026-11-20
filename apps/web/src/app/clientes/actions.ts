"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@posterai/db";
import { HEX } from "@posterai/templates";
import { saveImage } from "@/lib/storage";

export async function saveClient(_: string | null, form: FormData): Promise<string | null> {
  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!name) return "Informe o nome do cliente.";
  const colors = (JSON.parse(String(form.get("colors") || "[]")) as string[]).filter((c) => HEX.test(c)).slice(0, 5);
  const data = {
    name,
    colors,
    fonts: { title: String(form.get("titleFont") || "Inter").trim(), body: String(form.get("bodyFont") || "Inter").trim() },
    voiceTone: String(form.get("voiceTone") ?? "").trim() || null,
    captionStyle: {
      font: String(form.get("capFont") || "Inter").trim(),
      color: String(form.get("capColor") || "#FFFFFF"),
      highlightColor: String(form.get("capHighlight") || "#FACC15"),
      position: String(form.get("capPosition") || "bottom"),
    },
  };
  const client = id
    ? await prisma.client.update({ where: { id }, data })
    : await prisma.client.create({ data });
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) {
    try {
      const rel = await saveImage(logo, `clients/${client.id}`, `logo-${Date.now()}`);
      await prisma.client.update({ where: { id: client.id }, data: { logoPath: rel } });
    } catch (e) {
      return e instanceof Error ? e.message : "Falha ao salvar o logo.";
    }
  }
  revalidatePath("/clientes");
  redirect(`/clientes/${client.id}`);
}

export async function deleteClient(form: FormData) {
  await prisma.client.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/clientes");
  redirect("/clientes");
}
