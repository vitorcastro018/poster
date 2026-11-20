"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@posterai/db";
import { generateCarousel } from "@posterai/ai";
import { DEFAULT_TEMPLATE, type Slide } from "@posterai/templates";
import { queue } from "@/lib/queue";

export async function createCarousel(_: string | null, form: FormData): Promise<string | null> {
  const clientId = String(form.get("clientId") ?? "");
  const topic = String(form.get("topic") ?? "").trim();
  if (!clientId || !topic) return "Escolha o cliente e escreva o tema.";
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return "Cliente não encontrado.";
  let result;
  try {
    result = await generateCarousel({ topic, clientName: client.name, voiceTone: client.voiceTone });
  } catch (e) {
    return `Não foi possível gerar o texto: ${e instanceof Error ? e.message : e}`;
  }
  const c = await prisma.carousel.create({
    data: { clientId, topic, template: String(form.get("template") || DEFAULT_TEMPLATE), slides: result.slides as object[], caption: result.caption },
  });
  revalidatePath("/carrosseis");
  redirect(`/carrosseis/${c.id}`);
}

export async function saveCarousel(id: string, data: { template: string; slides: Slide[]; caption: string }) {
  await prisma.carousel.update({ where: { id }, data: { template: data.template, slides: data.slides as object[], caption: data.caption } });
  revalidatePath("/carrosseis");
}

export async function exportCarousel(id: string) {
  const job = await prisma.job.create({ data: { type: "CAROUSEL_RENDER", refId: id, status: "QUEUED" } });
  await prisma.carousel.update({ where: { id }, data: { status: "QUEUED" } });
  await queue.add("CAROUSEL_RENDER", { jobId: job.id, refId: id }, { attempts: 1, removeOnComplete: 100, removeOnFail: 100 });
}

export async function deleteCarousel(form: FormData) {
  await prisma.carousel.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/carrosseis");
  redirect("/carrosseis");
}
