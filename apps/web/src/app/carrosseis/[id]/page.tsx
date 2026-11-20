import { notFound } from "next/navigation";
import { prisma } from "@posterai/db";
import { brandFromRecord, type Slide } from "@posterai/templates";
import { CarouselEditor } from "@/components/CarouselEditor";
import { fileUrl } from "@/lib/storage";
import { deleteCarousel } from "../actions";

export const dynamic = "force-dynamic";

export default async function CarrosselPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.carousel.findUnique({ where: { id }, include: { client: true } });
  if (!c) notFound();
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-xl font-semibold">{c.topic}</h1><p className="text-sm text-neutral-500">{c.client.name}</p></div>
        <form action={deleteCarousel}><input type="hidden" name="id" value={c.id} /><button className="btn btn-danger">Excluir</button></form>
      </div>
      <CarouselEditor id={c.id} brand={brandFromRecord(c.client, fileUrl(c.client.logoPath))}
        initial={{ template: c.template ?? "texto-forte", slides: c.slides as unknown as Slide[], caption: c.caption ?? "", status: c.status, zipPath: c.zipPath }} />
    </main>
  );
}
