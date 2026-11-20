import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { zipSync, strToU8 } from "fflate";
import { prisma } from "@posterai/db";
import { brandFromRecord, SLIDE_H, SLIDE_W, type Slide } from "@posterai/templates";
import { renderSlideHtml } from "@posterai/templates/render";
import { storagePath, toDataUri } from "./storage.js";

export async function renderCarousel(carouselId: string) {
  const c = await prisma.carousel.findUniqueOrThrow({ where: { id: carouselId }, include: { client: true } });
  try {
    const slides = c.slides as unknown as Slide[];
    if (!slides.length) throw new Error("Carrossel sem slides.");
    const brand = brandFromRecord(c.client, await toDataUri(c.client.logoPath));
    const template = c.template ?? "texto-forte";

    const browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
      args: ["--no-sandbox"],
    });
    const files: Record<string, Uint8Array> = {};
    try {
      const page = await browser.newPage({ viewport: { width: SLIDE_W, height: SLIDE_H }, deviceScaleFactor: 1 });
      for (let i = 0; i < slides.length; i++) {
        const imageSrc = await toDataUri(slides[i].imagePath);
        await page.setContent(renderSlideHtml({ template, slides, index: i, brand, imageSrc }), { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready).catch(() => {});
        const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: SLIDE_W, height: SLIDE_H } });
        files[`slide-${String(i + 1).padStart(2, "0")}.png`] = new Uint8Array(png);
        await prisma.job.updateMany({
          where: { refId: carouselId, type: "CAROUSEL_RENDER", status: "PROCESSING" },
          data: { progress: Math.round(((i + 1) / slides.length) * 100) },
        });
      }
    } finally {
      await browser.close();
    }
    if (c.caption) files["legenda.txt"] = strToU8(c.caption);

    const rel = `carousels/${carouselId}/export-${Date.now()}.zip`;
    await mkdir(storagePath(`carousels/${carouselId}`), { recursive: true });
    await writeFile(storagePath(rel), zipSync(files, { level: 0 }));
    await prisma.carousel.update({ where: { id: carouselId }, data: { status: "READY", zipPath: rel } });
  } catch (e) {
    await prisma.carousel.update({ where: { id: carouselId }, data: { status: "FAILED" } });
    throw e;
  }
}
