/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Frame, CtaSlide, bodyStyle, fit, palette, readableOn, titleStyle } from "../common";
import type { SlideProps } from "../types";

export function FotoTexto(p: SlideProps) {
  const { brand, slide, index, total, imageSrc } = p;
  if (slide.type === "cta") return <CtaSlide {...p} />;
  const { primary, secondary, accent } = palette(brand);
  const img = imageSrc ? { backgroundImage: `url("${imageSrc}")`, backgroundSize: "cover", backgroundPosition: "center" } : { background: primary };
  if (slide.type === "hook") {
    return (
      <Frame brand={brand} index={index} total={total} bg={primary} fg="#fff">
        <div style={{ position: "absolute", inset: 0, ...img }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 10%, rgba(0,0,0,.1) 70%)" }} />
        <div style={{ position: "absolute", left: 90, right: 90, bottom: 190, display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ width: 150, height: 16, background: accent, borderRadius: 8 }} />
          <h1 style={titleStyle(brand, fit(slide.title, 112), "#fff")}>{slide.title}</h1>
        </div>
      </Frame>
    );
  }
  const fg = readableOn(secondary);
  return (
    <Frame brand={brand} index={index} total={total} bg={secondary} fg={fg}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 720, ...img }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 770, bottom: 160, display: "flex", flexDirection: "column", gap: 24 }}>
        <h1 style={titleStyle(brand, fit(slide.title, 64), fg)}>{slide.title}</h1>
        {slide.body && <p style={bodyStyle(40, fg)}>{slide.body}</p>}
      </div>
    </Frame>
  );
}
