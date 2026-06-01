export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => {
      // Reintentar sin crossOrigin para imágenes locales del proyecto
      const img2 = new Image();
      img2.onload = () => res(img2);
      img2.onerror = rej;
      img2.src = src;
    };
    img.src = src;
  });
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
): number {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, cy);
      line = words[i] + " ";
      cy += lh;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
  return cy + lh;
}

export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(W * 0.025)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(
    "@dt_fragancias",
    W - Math.round(W * 0.025),
    H - Math.round(H * 0.018),
  );
  ctx.restore();
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob(
      (b) => {
        if (b) res(b);
        else rej(new Error("toBlob devolvió null"));
      },
      "image/png",
      1.0,
    );
  });
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
