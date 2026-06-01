import { FORMATOS } from "../constants";
import type {
  CarouselFormat,
  CarouselProduct,
  CarouselSlide,
  CarouselStyle,
} from "../types";
import { drawWatermark, loadImage } from "./canvasHelpers";
import { STYLE_RENDERERS } from "./styles";

export { canvasToBlob, downloadBlob, loadImage } from "./canvasHelpers";

export async function renderSlide(
  slide: CarouselSlide,
  producto: CarouselProduct,
  estilo: CarouselStyle,
  formato: CarouselFormat,
): Promise<HTMLCanvasElement> {
  const spec = FORMATOS[formato] || FORMATOS.feed;
  const { w: W, h: H } = spec;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener contexto 2D del canvas");

  const img = await loadImage(producto.foto);
  const renderer = STYLE_RENDERERS[estilo];
  renderer(ctx, slide, producto, img, W, H);

  drawWatermark(ctx, W, H);
  return canvas;
}
