import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@posterai/db";
import { BrandForm } from "@/components/BrandForm";
import { fileUrl } from "@/lib/storage";
import { deleteClient } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.client.findUnique({ where: { id } });
  if (!c) notFound();
  const fonts = c.fonts as { title?: string; body?: string };
  const cap = c.captionStyle as { font?: string; color?: string; highlightColor?: string; position?: string };
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{c.name}</h1>
        <div className="flex gap-2">
          <Link href={`/carrosseis/novo?client=${c.id}`} className="btn btn-primary">Novo carrossel</Link>
          <form action={deleteClient}><input type="hidden" name="id" value={c.id} /><button className="btn btn-danger">Excluir</button></form>
        </div>
      </div>
      <BrandForm initial={{
        id: c.id, name: c.name, colors: c.colors as string[], titleFont: fonts.title ?? "Inter", bodyFont: fonts.body ?? "Inter",
        voiceTone: c.voiceTone ?? "", capFont: cap.font ?? "Inter", capColor: cap.color ?? "#FFFFFF",
        capHighlight: cap.highlightColor ?? "#FACC15", capPosition: cap.position ?? "bottom", logoUrl: fileUrl(c.logoPath),
      }} />
    </main>
  );
}
