/** @jsxRuntime automatic */
/** @jsxImportSource react */
import type { ReactNode } from "react";
import { HEX, SLIDE_H, SLIDE_W, type Brand } from "./types";

export function readableOn(hex: string) {
  if (!HEX.test(hex)) return "#111111";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? "#111111" : "#FFFFFF";
}

export function palette(brand: Brand) {
  const c = brand.colors.filter((x) => HEX.test(x));
  return { primary: c[0] ?? "#111827", secondary: c[1] ?? "#F9FAFB", accent: c[2] ?? c[0] ?? "#F59E0B" };
}

/** Reduz o tamanho da fonte conforme o texto cresce. */
export function fit(text: string, base: number) {
  const n = text.length;
  return Math.round(base * (n > 90 ? 0.62 : n > 60 ? 0.74 : n > 35 ? 0.88 : 1));
}

export function fontsHref(brand: Brand) {
  const fam = [...new Set([brand.titleFont, brand.bodyFont].filter(Boolean))]
    .map((f) => `${encodeURIComponent(f).replace(/%20/g, "+")}:400,700,900`)
    .join("|");
  return `https://fonts.googleapis.com/css?family=${fam}&display=swap`;
}

export function Frame(props: {
  brand: Brand; index: number; total: number; bg: string; fg: string; children: ReactNode; hideChrome?: boolean;
}) {
  const { brand, index, total, bg, fg, children, hideChrome } = props;
  return (
    <div style={{
      width: SLIDE_W, height: SLIDE_H, position: "relative", overflow: "hidden", background: bg, color: fg,
      fontFamily: `'${brand.bodyFont}', system-ui, sans-serif`, boxSizing: "border-box",
    }}>
      {children}
      {!hideChrome && (
        <>
          <div style={{ position: "absolute", left: 90, right: 90, top: 80, display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 5, textTransform: "uppercase", opacity: 0.6, fontWeight: 700 }}>
            <span>{brand.name}</span>
            <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>
          <div style={{ position: "absolute", left: 90, right: 90, bottom: 64, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 72 }}>
            {brand.logoSrc ? <img src={brand.logoSrc} alt="" style={{ maxHeight: 72, maxWidth: 260, objectFit: "contain" }} /> : <span />}
            {index < total - 1 && <span style={{ fontSize: 54, lineHeight: 1, opacity: 0.7 }}>→</span>}
          </div>
          <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: `${((index + 1) / total) * 100}%`, background: palette(brand).accent }} />
        </>
      )}
    </div>
  );
}

export const titleStyle = (brand: Brand, size: number, color: string) => ({
  fontFamily: `'${brand.titleFont}', sans-serif`, fontWeight: 900, fontSize: size, lineHeight: 1.08, color,
  margin: 0, wordBreak: "break-word" as const, whiteSpace: "pre-wrap" as const,
});
export const bodyStyle = (size: number, color: string) => ({
  fontSize: size, lineHeight: 1.4, color, margin: 0, opacity: 0.92, whiteSpace: "pre-wrap" as const,
});

export function CtaSlide({ brand, slide, index, total }: SlidePropsLite) {
  const { accent } = palette(brand);
  const fg = readableOn(accent);
  return (
    <Frame brand={brand} index={index} total={total} bg={accent} fg={fg}>
      <div style={{ position: "absolute", inset: "130px 90px 180px 90px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
        <h1 style={titleStyle(brand, fit(slide.title, 110), fg)}>{slide.title}</h1>
        {slide.body && <p style={bodyStyle(50, fg)}>{slide.body}</p>}
      </div>
    </Frame>
  );
}
type SlidePropsLite = Pick<import("./types").SlideProps, "brand" | "slide" | "index" | "total">;
