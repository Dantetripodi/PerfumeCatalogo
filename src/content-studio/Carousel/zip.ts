/**
 * Implementación mínima del formato ZIP (sin compresión, método "stored").
 * Genera un .zip sin depender de librerías externas. Usado para empaquetar
 * los 5 slides PNG + foto + caption.txt en un único archivo descargable.
 *
 * Referencia del formato: PKZIP APPNOTE.TXT (Local File Header + Central
 * Directory + End Of Central Directory).
 */

export interface ZipFile {
  name: string;
  data: Uint8Array;
}

function crc32(d: Uint8Array): number {
  const t: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[i] = c >>> 0;
  }
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) {
    c = (c >>> 8) ^ t[(c ^ d[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function createZip(files: ZipFile[]): Blob {
  const enc = new TextEncoder();
  const lhs: Uint8Array[] = [];
  const cds: Uint8Array[] = [];
  let off = 0;

  files.forEach(({ name, data }) => {
    const nb = enc.encode(name);
    const crc = crc32(data);
    const sz = data.length;

    const lh = new Uint8Array(30 + nb.length);
    const v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); // local file header signature
    v.setUint16(4, 20, true); // version
    v.setUint16(8, 0, true); // method = stored
    v.setUint32(14, crc, true);
    v.setUint32(18, sz, true); // compressed size
    v.setUint32(22, sz, true); // uncompressed size
    v.setUint16(26, nb.length, true);
    lh.set(nb, 30);

    const e = new Uint8Array(lh.length + data.length);
    e.set(lh, 0);
    e.set(data, lh.length);
    lhs.push(e);

    const cd = new Uint8Array(46 + nb.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); // central directory signature
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, sz, true);
    cv.setUint32(24, sz, true);
    cv.setUint16(28, nb.length, true);
    cv.setUint32(42, off, true);
    cd.set(nb, 46);
    cds.push(cd);
    off += e.length;
  });

  const cdsz = cds.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdsz, true);
  ev.setUint32(16, off, true);

  const tot = off + cdsz + eocd.length;
  const res = new Uint8Array(tot);
  let pos = 0;
  lhs.forEach((l) => {
    res.set(l, pos);
    pos += l.length;
  });
  cds.forEach((c) => {
    res.set(c, pos);
    pos += c.length;
  });
  res.set(eocd, pos);

  return new Blob([res], { type: "application/zip" });
}

export function blobToU8(blob: Blob): Promise<Uint8Array> {
  return new Promise((r) => {
    const fr = new FileReader();
    fr.onload = () => r(new Uint8Array(fr.result as ArrayBuffer));
    fr.readAsArrayBuffer(blob);
  });
}

/**
 * Descarga la foto del producto desde su URL y devuelve un Uint8Array para
 * incluirla en el ZIP. Soporta tanto rutas relativas (/imagenes/...) como
 * data URIs (data:image/...).
 */
export async function imageUrlToU8(url: string): Promise<Uint8Array> {
  if (url.startsWith("data:")) {
    const [meta, b64] = url.split(",");
    void meta;
    const bstr = atob(b64);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return u8;
  }
  const resp = await fetch(url);
  const blob = await resp.blob();
  return blobToU8(blob);
}
