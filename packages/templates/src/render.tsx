/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { renderToStaticMarkup } from "react-dom/server";
import { SlideView, fontsHref, slideProps, SLIDE_H, SLIDE_W, type Brand, type Slide } from "./index";

/** Documento HTML completo de um slide (1080x1350), para o Playwright tirar o print. */
export function renderSlideHtml(opts: { template: string; slides: Slide[]; index: number; brand: Brand; imageSrc?: string | null }) {
  const { template, slides, index, brand, imageSrc } = opts;
  const body = renderToStaticMarkup(<SlideView template={template} {...slideProps(slides, index, brand, imageSrc)} />);
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${fontsHref(brand)}">
<style>html,body{margin:0;padding:0;width:${SLIDE_W}px;height:${SLIDE_H}px;overflow:hidden}</style></head><body>${body}</body></html>`;
}
