"use client";
import { useEffect, useRef, useState } from "react";
import { SlideView, fontsHref, SLIDE_H, SLIDE_W, type SlideProps } from "@posterai/templates";

/** Mostra um slide 1080x1350 reduzido para caber na largura do contêiner. */
export function ScaledSlide(props: SlideProps & { template: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = ref.current!;
    const update = () => setScale(el.clientWidth / SLIDE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width: "100%", aspectRatio: `${SLIDE_W}/${SLIDE_H}`, position: "relative", overflow: "hidden", borderRadius: 8 }}>
      <link rel="stylesheet" href={fontsHref(props.brand)} />
      <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0 }}>
        <SlideView {...props} />
      </div>
    </div>
  );
}
