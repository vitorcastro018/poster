import { BrandForm } from "@/components/BrandForm";

export default function NovoCliente() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">Novo cliente</h1>
      <BrandForm initial={{ name: "", colors: [], titleFont: "Montserrat", bodyFont: "Inter", voiceTone: "", capFont: "Montserrat", capColor: "#FFFFFF", capHighlight: "#FACC15", capPosition: "bottom", logoUrl: null }} />
    </main>
  );
}
