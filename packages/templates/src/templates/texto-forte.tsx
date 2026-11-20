/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Frame, CtaSlide, bodyStyle, fit, palette, readableOn, titleStyle } from "../common";
import type { SlideProps } from "../types";

export function TextoForte(p: SlideProps) {
  const { brand, slide, index, total } = p;
  if (slide.type === "cta") return <CtaSlide {...p} />;
  const { primary, accent } = palette(brand);
  const fg = readableOn(primary);
  const hook = slide.type === "hook";
  return (
    <Frame brand={brand} index={index} total={total} bg={primary} fg={fg}>
      <div style={{ position: "absolute", right: -220, top: hook ? -180 : 760, width: 640, height: 640, borderRadius: "50%", border: `3px solid ${accent}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: "130px 90px 180px 90px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
        <div style={{ width: 150, height: 16, background: accent, borderRadius: 8 }} />
        <h1 style={titleStyle(brand, fit(slide.title, hook ? 124 : 88), fg)}>{slide.title}</h1>
        {slide.body && <p style={bodyStyle(46, fg)}>{slide.body}</p>}
      </div>
    </Frame>
  );
}
