import { createElement, type ReactElement } from "react";
import { FotoTexto } from "./templates/foto-texto";
import { ListaNumerada } from "./templates/lista-numerada";
import { TextoForte } from "./templates/texto-forte";
import type { Brand, Slide, SlideProps } from "./types";

export * from "./types";
export { fontsHref } from "./common";

export const TEMPLATES = [
  { id: "texto-forte", name: "Texto forte", component: TextoForte },
  { id: "lista-numerada", name: "Lista numerada", component: ListaNumerada },
  { id: "foto-texto", name: "Foto + texto", component: FotoTexto },
] as const;
export type TemplateId = (typeof TEMPLATES)[number]["id"];
export const DEFAULT_TEMPLATE: TemplateId = "texto-forte";

export function SlideView(props: SlideProps & { template: string }): ReactElement {
  const t = TEMPLATES.find((x) => x.id === props.template) ?? TEMPLATES[0];
  return createElement(t.component, props);
}

/** Monta as props de cada slide a partir da lista (numeração dos slides de conteúdo etc.). */
export function slideProps(slides: Slide[], i: number, brand: Brand, imageSrc?: string | null): SlideProps {
  const contentNumber = slides.slice(0, i + 1).filter((s) => s.type === "content").length;
  return { slide: slides[i], index: i, total: slides.length, contentNumber, brand, imageSrc };
}

/** Converte os campos JSON do cliente (banco) em Brand. */
export function brandFromRecord(c: { name: string; colors: unknown; fonts: unknown }, logoSrc?: string | null): Brand {
  const fonts = (c.fonts ?? {}) as { title?: string; body?: string };
  return {
    name: c.name,
    logoSrc: logoSrc ?? null,
    colors: Array.isArray(c.colors) ? (c.colors as string[]) : [],
    titleFont: fonts.title || "Inter",
    bodyFont: fonts.body || "Inter",
  };
}
