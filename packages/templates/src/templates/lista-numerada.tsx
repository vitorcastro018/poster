/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Frame, CtaSlide, bodyStyle, fit, palette, readableOn, titleStyle } from "../common";
import type { SlideProps } from "../types";

export function ListaNumerada(p: SlideProps) {
  const { brand, slide, index, total, contentNumber } = p;
  if (slide.type === "cta") return <CtaSlide {...p} />;
  const { primary, secondary, accent } = palette(brand);
  if (slide.type === "hook") {
    const fg = readableOn(primary);
    return (
      <Frame brand={brand} index={index} total={total} bg={primary} fg={fg}>
        <div style={{ position: "absolute", inset: "130px 90px 180px 90px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
          <span style={{ color: accent, fontWeight: 700, fontSize: 38, letterSpacing: 4, textTransform: "uppercase" }}>{brand.name}</span>
          <h1 style={titleStyle(brand, fit(slide.title, 118), fg)}>{slide.title}</h1>
        </div>
      </Frame>
    );
  }
  const fg = readableOn(secondary);
  return (
    <Frame brand={brand} index={index} total={total} bg={secondary} fg={fg}>
      <div style={{ position: "absolute", inset: "130px 90px 180px 90px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div style={{ fontFamily: `'${brand.titleFont}', sans-serif`, fontWeight: 900, fontSize: 280, lineHeight: 0.9, color: accent }}>
          {String(contentNumber).padStart(2, "0")}
        </div>
        <h1 style={titleStyle(brand, fit(slide.title, 72), fg)}>{slide.title}</h1>
        {slide.body && <p style={bodyStyle(44, fg)}>{slide.body}</p>}
      </div>
    </Frame>
  );
}
