export type SlideType = "hook" | "content" | "cta";
export interface Slide { type: SlideType; title: string; body?: string; imagePath?: string }
export interface Brand {
  name: string;
  logoSrc?: string | null;
  colors: string[];
  titleFont: string;
  bodyFont: string;
}
export interface SlideProps {
  slide: Slide;
  index: number;
  total: number;
  /** posição entre os slides de conteúdo (1, 2, 3...) */
  contentNumber: number;
  brand: Brand;
  imageSrc?: string | null;
}
export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
export const HEX = /^#[0-9a-f]{6}$/i;
