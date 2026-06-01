import { getCatGradient } from "../constants";
import type { CarouselProduct, CarouselSlide } from "../types";
import { wrapText } from "./canvasHelpers";

/**
 * Funciones de render por estilo visual. Cada una dibuja el contenido del
 * slide sobre un canvas ya configurado con el tamaño correcto.
 * No dibujan la marca de agua — eso lo hace `renderSlide` al final.
 */

type StyleRenderer = (
  ctx: CanvasRenderingContext2D,
  slide: CarouselSlide,
  producto: CarouselProduct,
  img: HTMLImageElement,
  W: number,
  H: number,
) => void;

const styleA: StyleRenderer = (ctx, slide, _producto, img, W, H) => {
  // Foto fondo + gradiente + texto abajo (paleta navy)
  const pad = Math.round(W * 0.065);
  ctx.fillStyle = "#101827";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.42;
  const r = img.width / img.height;
  const cr = W / H;
  let dw: number, dh: number, dx: number, dy: number;
  if (r > cr) {
    dh = H;
    dw = H * r;
    dx = (W - dw) / 2;
    dy = 0;
  } else {
    dw = W;
    dh = W / r;
    dx = 0;
    dy = (H - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(16,24,39,0)");
  g.addColorStop(0.45, "rgba(16,24,39,0.45)");
  g.addColorStop(1, "rgba(16,24,39,0.92)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  let cy = H - Math.round(H * 0.3);
  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${Math.round(W * 0.027)}px system-ui`;
  ctx.textAlign = "left";
  ctx.fillText(slide.etiqueta, pad, cy);
  cy += Math.round(H * 0.055);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(W * 0.072)}px system-ui`;
  cy = wrapText(ctx, slide.titulo, pad, cy, W - pad * 2, Math.round(H * 0.082));
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = `${Math.round(W * 0.035)}px system-ui`;
  wrapText(
    ctx,
    slide.subtitulo,
    pad,
    cy + Math.round(H * 0.01),
    W - pad * 2,
    Math.round(H * 0.042),
  );
};

const styleB: StyleRenderer = (ctx, slide, _producto, img, W, H) => {
  // Split: foto izquierda (cream), texto derecha (navy)
  const pad = Math.round(W * 0.065);
  const lg = ctx.createLinearGradient(0, 0, W / 2, H);
  lg.addColorStop(0, "#F8F0E3");
  lg.addColorStop(1, "#E8DDBF");
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W / 2, H);

  const fp = Math.round(W * 0.055);
  const aw = W / 2 - fp * 2;
  const ah = H - fp * 2;
  const ir = img.width / img.height;
  const ar = aw / ah;
  let dw: number, dh: number;
  if (ir > ar) {
    dw = aw;
    dh = aw / ir;
  } else {
    dh = ah;
    dw = ah * ir;
  }
  ctx.drawImage(img, (W / 2 - dw) / 2, (H - dh) / 2, dw, dh);

  ctx.fillStyle = "#101827";
  ctx.fillRect(W / 2, 0, W / 2, H);

  const tx = W / 2 + pad;
  const tmw = W / 2 - pad * 2;
  let cy = H / 2 - Math.round(H * 0.18);
  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${Math.round(W * 0.024)}px system-ui`;
  ctx.textAlign = "left";
  ctx.fillText(slide.etiqueta, tx, cy);
  cy += Math.round(H * 0.052);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(W * 0.052)}px system-ui`;
  cy = wrapText(ctx, slide.titulo, tx, cy, tmw, Math.round(H * 0.062));
  cy += Math.round(H * 0.015);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = `${Math.round(W * 0.028)}px system-ui`;
  wrapText(ctx, slide.subtitulo, tx, cy, tmw, Math.round(H * 0.036));
};

const styleC: StyleRenderer = (ctx, slide, _producto, img, W, H) => {
  // Minimalista: foto arriba 58%, texto centrado abajo sobre navy
  const pad = Math.round(W * 0.065);
  ctx.fillStyle = "#101827";
  ctx.fillRect(0, 0, W, H);
  const fh = Math.round(H * 0.58);
  const ir = img.width / img.height;
  const ar = W / fh;
  let dw: number, dh: number, dx: number, dy: number;
  if (ir > ar) {
    dh = fh;
    dw = fh * ir;
    dx = (W - dw) / 2;
    dy = 0;
  } else {
    dw = W;
    dh = W / ir;
    dx = 0;
    dy = (fh - dh) / 2;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, fh);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  const fg = ctx.createLinearGradient(0, fh * 0.65, 0, fh);
  fg.addColorStop(0, "rgba(16,24,39,0)");
  fg.addColorStop(1, "rgba(16,24,39,1)");
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, W, fh);

  ctx.strokeStyle = "rgba(212,175,55,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, fh + 2);
  ctx.lineTo(W - pad, fh + 2);
  ctx.stroke();

  let cy = fh + Math.round(H * 0.04);
  ctx.fillStyle = "rgba(212,175,55,0.85)";
  ctx.font = `${Math.round(W * 0.022)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(slide.etiqueta, W / 2, cy);
  cy += Math.round(H * 0.055);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(W * 0.062)}px system-ui`;
  cy = wrapText(ctx, slide.titulo, W / 2, cy, W - pad * 2.5, Math.round(H * 0.075));
  cy += Math.round(H * 0.012);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `${Math.round(W * 0.03)}px system-ui`;
  wrapText(ctx, slide.subtitulo, W / 2, cy, W - pad * 3, Math.round(H * 0.038));

  ctx.fillStyle = "rgba(212,175,55,0.6)";
  ctx.font = `${Math.round(W * 0.022)}px system-ui`;
  ctx.fillText("DT FRAGANCIAS", W / 2, H - Math.round(H * 0.025));
};

const styleD: StyleRenderer = (ctx, slide, _producto, img, W, H) => {
  // Foto fondo + marcos decorativos dorados + texto (premium boutique)
  const pad = Math.round(W * 0.065);
  ctx.fillStyle = "#0a0e1a";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.35;
  const r = img.width / img.height;
  const cr = W / H;
  let dw: number, dh: number, dx: number, dy: number;
  if (r > cr) {
    dh = H;
    dw = H * r;
    dx = (W - dw) / 2;
    dy = 0;
  } else {
    dw = W;
    dh = W / r;
    dx = 0;
    dy = (H - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
  const og = ctx.createLinearGradient(0, 0, 0, H);
  og.addColorStop(0, "rgba(10,14,26,0.55)");
  og.addColorStop(0.4, "rgba(10,14,26,0.2)");
  og.addColorStop(1, "rgba(10,14,26,0.88)");
  ctx.fillStyle = og;
  ctx.fillRect(0, 0, W, H);

  const m = Math.round(W * 0.055);
  const cs = Math.round(W * 0.09);
  ctx.strokeStyle = "rgba(212,175,55,0.75)";
  ctx.lineWidth = Math.round(W * 0.004);
  // Esquinas
  ctx.beginPath();
  ctx.moveTo(m, m + cs);
  ctx.lineTo(m, m);
  ctx.lineTo(m + cs, m);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - m - cs, m);
  ctx.lineTo(W - m, m);
  ctx.lineTo(W - m, m + cs);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(m, H - m - cs);
  ctx.lineTo(m, H - m);
  ctx.lineTo(m + cs, H - m);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - m - cs, H - m);
  ctx.lineTo(W - m, H - m);
  ctx.lineTo(W - m, H - m - cs);
  ctx.stroke();

  const lpy = Math.round(H * 0.62);
  ctx.strokeStyle = "rgba(212,175,55,0.5)";
  ctx.lineWidth = Math.round(W * 0.0018);
  ctx.beginPath();
  ctx.moveTo(pad * 1.5, lpy);
  ctx.lineTo(W - pad * 1.5, lpy);
  ctx.stroke();

  let cy = lpy + Math.round(H * 0.038);
  ctx.fillStyle = "rgba(212,175,55,0.95)";
  ctx.font = `bold ${Math.round(W * 0.026)}px system-ui`;
  ctx.textAlign = "left";
  ctx.fillText(slide.etiqueta, pad * 1.5, cy);
  cy += Math.round(H * 0.055);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(W * 0.068)}px system-ui`;
  cy = wrapText(ctx, slide.titulo, pad * 1.5, cy, W - pad * 3, Math.round(H * 0.078));
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `${Math.round(W * 0.033)}px system-ui`;
  wrapText(
    ctx,
    slide.subtitulo,
    pad * 1.5,
    cy + Math.round(H * 0.012),
    W - pad * 3,
    Math.round(H * 0.04),
  );
};

const styleE: StyleRenderer = (ctx, slide, producto, img, W, H) => {
  // Gradiente por categoría con foto flotante y sombra suave
  const pad = Math.round(W * 0.065);
  const gcat = getCatGradient(producto.categoria);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, gcat.from);
  bg.addColorStop(1, gcat.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const fsize = Math.round(Math.min(W, H) * 0.42);
  const ir = img.width / img.height;
  let dw: number, dh: number;
  if (ir > 1) {
    dw = fsize;
    dh = fsize / ir;
  } else {
    dh = fsize;
    dw = fsize * ir;
  }
  const dx = (W - dw) / 2;
  const dy = Math.round(H * 0.07);

  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = Math.round(W * 0.04);
  ctx.shadowOffsetY = Math.round(H * 0.015);
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const lpy = dy + dh + Math.round(H * 0.045);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = Math.round(W * 0.002);
  ctx.beginPath();
  ctx.moveTo(pad * 2, lpy);
  ctx.lineTo(W - pad * 2, lpy);
  ctx.stroke();

  let cy = lpy + Math.round(H * 0.04);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `bold ${Math.round(W * 0.026)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(slide.etiqueta, W / 2, cy);
  cy += Math.round(H * 0.058);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(W * 0.065)}px system-ui`;
  cy = wrapText(ctx, slide.titulo, W / 2, cy, W - pad * 2.5, Math.round(H * 0.075));
  cy += Math.round(H * 0.012);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `${Math.round(W * 0.032)}px system-ui`;
  wrapText(ctx, slide.subtitulo, W / 2, cy, W - pad * 3, Math.round(H * 0.04));
};

export const STYLE_RENDERERS = {
  A: styleA,
  B: styleB,
  C: styleC,
  D: styleD,
  E: styleE,
} as const;
