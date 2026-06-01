import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Edit3,
  Heart,
  Info,
  Package,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import type { Perfume } from "../../types";
import { FORMATOS } from "./constants";
import { toCarouselProduct } from "./adapter";
import { buildCaption, buildHashtags, generarSlides } from "./slides";
import { canvasToBlob, downloadBlob, renderSlide } from "./render";
import { blobToU8, createZip, imageUrlToU8 } from "./zip";
import type {
  CarouselFormat,
  CarouselPostType,
  CarouselProduct,
  CarouselSlide,
  CarouselStyle,
  SavedTemplate,
} from "./types";

interface CarouselGeneratorProps {
  perfumes: Perfume[];
  onBack: () => void;
}

const ESTILOS: { id: CarouselStyle; label: string }[] = [
  { id: "A", label: "A · Foto fondo" },
  { id: "B", label: "B · Split" },
  { id: "C", label: "C · Minimalista" },
  { id: "D", label: "D · Marcos dorados" },
  { id: "E", label: "E · Gradiente" },
];

type CategoriaFiltro = "todos" | "femenino" | "masculino" | "unisex";

function CarouselGenerator({ perfumes, onBack }: CarouselGeneratorProps) {
  const productosCatalogo = useMemo<CarouselProduct[]>(
    () => perfumes.map(toCarouselProduct),
    [perfumes],
  );

  const [estilo, setEstilo] = useState<CarouselStyle>("B");
  const [formato, setFormato] = useState<CarouselFormat>("feed");
  const [tipoPost, setTipoPost] = useState<CarouselPostType>("producto");
  const [categoria, setCategoria] = useState<CategoriaFiltro>("todos");
  const [producto, setProducto] = useState<CarouselProduct>(
    () => productosCatalogo[0],
  );
  const [slides, setSlides] = useState<CarouselSlide[]>(() =>
    generarSlides(productosCatalogo[0], "producto"),
  );
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editTemp, setEditTemp] = useState<CarouselSlide>({
    etiqueta: "",
    titulo: "",
    subtitulo: "",
  });
  const [copiado, setCopiado] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedTemplate[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showTut, setShowTut] = useState(false);

  const filtrados = useMemo(
    () =>
      categoria === "todos"
        ? productosCatalogo
        : productosCatalogo.filter((p) => p.categoria === categoria),
    [categoria, productosCatalogo],
  );

  const regenSlides = (p: CarouselProduct = producto, t: CarouselPostType = tipoPost) => {
    setSlides(generarSlides(p, t));
    setEditIdx(null);
  };

  const otroProducto = () => {
    if (!filtrados.length) return;
    let nuevo: CarouselProduct;
    do {
      nuevo = filtrados[Math.floor(Math.random() * filtrados.length)];
    } while (nuevo.id === producto.id && filtrados.length > 1);
    setProducto(nuevo);
    setSlides(generarSlides(nuevo, tipoPost));
    setEditIdx(null);
  };

  const cambiarCategoria = (cat: CategoriaFiltro) => {
    setCategoria(cat);
    const f =
      cat === "todos"
        ? productosCatalogo
        : productosCatalogo.filter((p) => p.categoria === cat);
    if (f.length && !f.find((p) => p.id === producto.id)) {
      setProducto(f[0]);
      setSlides(generarSlides(f[0], tipoPost));
    }
  };

  const cambiarTipo = (t: CarouselPostType) => {
    setTipoPost(t);
    setSlides(generarSlides(producto, t));
  };

  const elegirProducto = (id: string) => {
    const p = productosCatalogo.find((x) => x.id === id);
    if (!p) return;
    setProducto(p);
    setSlides(generarSlides(p, tipoPost));
  };

  const guardarEdicion = () => {
    if (editIdx === null) return;
    const ns = [...slides];
    ns[editIdx] = { ...editTemp };
    setSlides(ns);
    setEditIdx(null);
  };

  const caption = buildCaption(producto, slides);
  const hashtags = buildHashtags(producto);

  const copiar = () => {
    const txt = `${caption}\n\n${hashtags}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(txt).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      } catch {
        // sin acceso al portapapeles
      }
      document.body.removeChild(ta);
    }
  };

  /**
   * Comparte los 5 slides + caption a WhatsApp (o a la app que elija el
   * usuario en el menú de share). Usa la Web Share API con `files`, que en
   * mobile abre WhatsApp con las imágenes ya adjuntas listas para enviar al
   * contacto que el usuario elija.
   *
   * Fallback si el navegador no soporta share con files:
   *  - Descarga el ZIP
   *  - Abre WhatsApp con solo el caption (como antes)
   */
  const enviarAWhatsApp = async () => {
    setStatus("wa");
    try {
      // 1) Renderizar los 5 slides como File[]
      const files: File[] = [];
      for (let i = 0; i < slides.length; i++) {
        const canvas = await renderSlide(slides[i], producto, estilo, formato);
        const blob = await canvasToBlob(canvas);
        files.push(
          new File([blob], `slide-${i + 1}.png`, { type: "image/png" }),
        );
      }

      const shareData: ShareData = {
        title: `${producto.nombre} · DT Fragancias`,
        text: `${caption}\n\n${hashtags}`,
        files,
      };

      // 2) Si el navegador soporta share con archivos, usarlo
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files }) &&
        typeof navigator.share === "function"
      ) {
        try {
          await navigator.share(shareData);
          setStatus(null);
          return;
        } catch (err) {
          // El usuario canceló el sheet de share — no es un error real
          if ((err as Error).name === "AbortError") {
            setStatus(null);
            return;
          }
          // Cualquier otro error cae al fallback
          console.warn("Web Share falló, cayendo al fallback:", err);
        }
      }

      // 3) Fallback: copiar caption + descargar ZIP + abrir WhatsApp con texto
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${caption}\n\n${hashtags}`);
      }
      const zipFiles = [];
      for (let i = 0; i < files.length; i++) {
        zipFiles.push({
          name: `slide-${i + 1}.png`,
          data: await blobToU8(files[i]),
        });
      }
      zipFiles.push({
        name: "caption.txt",
        data: new TextEncoder().encode(`${caption}\n\n${hashtags}`),
      });
      downloadBlob(
        createZip(zipFiles),
        `dt-${producto.id}-${estilo}-${formato}-${Date.now()}.zip`,
      );

      const msg = encodeURIComponent(
        `${caption}\n\n${hashtags}\n\n📸 Las 5 fotos se descargaron en un .zip — adjuntalas al chat.`,
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank");
      alert(
        "Tu navegador no soporta compartir imágenes directo. Descargamos el .zip y abrimos WhatsApp con el caption listo.",
      );
    } catch (e) {
      alert("Error al preparar el envío: " + (e as Error).message);
    }
    setStatus(null);
  };

  const descargarSlide = async (i: number) => {
    setStatus(`slide-${i}`);
    try {
      const canvas = await renderSlide(slides[i], producto, estilo, formato);
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, `${producto.id}-s${i + 1}-${estilo}-${formato}.png`);
    } catch (e) {
      alert("Error al generar slide: " + (e as Error).message);
    }
    setStatus(null);
  };

  const descargarZip = async () => {
    setStatus("zip");
    try {
      const files = [];
      for (let i = 0; i < slides.length; i++) {
        const c = await renderSlide(slides[i], producto, estilo, formato);
        const b = await canvasToBlob(c);
        files.push({ name: `slide-${i + 1}.png`, data: await blobToU8(b) });
      }
      try {
        files.push({
          name: `producto-${producto.id}.jpg`,
          data: await imageUrlToU8(producto.foto),
        });
      } catch {
        // si la foto no se puede descargar (CORS), seguimos sin ella
      }
      files.push({
        name: "caption.txt",
        data: new TextEncoder().encode(`${caption}\n\n${hashtags}`),
      });
      downloadBlob(
        createZip(files),
        `dt-${producto.id}-${estilo}-${formato}-${Date.now()}.zip`,
      );
    } catch (e) {
      alert("Error al generar ZIP: " + (e as Error).message);
    }
    setStatus(null);
  };

  const guardarPlantilla = () => {
    const s: SavedTemplate = {
      id: Date.now(),
      nombre: producto.nombre,
      producto,
      estilo,
      formato,
      tipoPost,
      slides: [...slides],
    };
    setSaved((prev) => [s, ...prev.slice(0, 9)]);
  };

  const cargarPlantilla = (s: SavedTemplate) => {
    setProducto(s.producto);
    setEstilo(s.estilo);
    setFormato(s.formato);
    setTipoPost(s.tipoPost);
    setSlides(s.slides);
    setShowSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F0E3] p-3">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between pt-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[#1A2238] hover:bg-white/60"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <button
            onClick={() => setShowTut(true)}
            className="flex items-center gap-1 text-xs text-[#9A7A1F] underline"
          >
            <Info size={12} /> Cómo usar
          </button>
        </div>

        <div className="mb-5 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#1A2238]">
            <span className="text-[#D4AF37]">DT</span>Fragancias
          </h1>
          <p className="text-xs uppercase tracking-[0.24em] text-[#9A7A1F]">
            Generador de carruseles · @dt_fragancias
          </p>
        </div>

        {/* Controles */}
        <div className="mb-3 space-y-3 rounded-2xl border border-[#E8DDBF] bg-white p-4">
          {/* Estilo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#1A2238]">
              Estilo visual
            </label>
            <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
              {ESTILOS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEstilo(e.id)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
                    estilo === e.id
                      ? "bg-[#1A2238] text-white"
                      : "bg-[#F8F0E3] text-[#1A2238] hover:bg-[#E8DDBF]"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#1A2238]">
              Formato de exportación
            </label>
            <div className="mt-1 flex gap-2">
              {Object.entries(FORMATOS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFormato(k as CarouselFormat)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                    formato === k
                      ? "bg-[#1A2238] text-white"
                      : "bg-[#F8F0E3] text-[#1A2238] hover:bg-[#E8DDBF]"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo + Categoría */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#1A2238]">
                Tipo
              </label>
              <select
                value={tipoPost}
                onChange={(e) => cambiarTipo(e.target.value as CarouselPostType)}
                className="mt-1 w-full rounded-lg border border-[#E8DDBF] bg-[#FBF8F1] p-2 text-xs text-[#1A2238]"
              >
                <option value="producto">Producto del día</option>
                <option value="ocasion">Por ocasión</option>
                <option value="novedad">Novedad</option>
                <option value="testimonio">Testimonio</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#1A2238]">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) =>
                  cambiarCategoria(e.target.value as CategoriaFiltro)
                }
                className="mt-1 w-full rounded-lg border border-[#E8DDBF] bg-[#FBF8F1] p-2 text-xs text-[#1A2238]"
              >
                <option value="todos">Todos</option>
                <option value="femenino">Femeninos</option>
                <option value="masculino">Masculinos</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>

          {/* Selector de producto */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#1A2238]">
              Producto
            </label>
            <select
              value={producto.id}
              onChange={(e) => elegirProducto(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8DDBF] bg-[#FBF8F1] p-2 text-xs text-[#1A2238]"
            >
              {filtrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.tamano}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={otroProducto}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1A2238] py-3 text-sm font-semibold text-white hover:bg-[#0e1626]"
            >
              <RefreshCw size={15} /> Otro producto
            </button>
            <button
              onClick={() => regenSlides()}
              className="rounded-lg bg-[#F8F0E3] px-4 py-3 text-sm text-[#1A2238] hover:bg-[#E8DDBF]"
              title="Regenerar textos"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={guardarPlantilla}
              className="rounded-lg bg-[#F8F0E3] px-4 py-3 text-sm text-[#1A2238] hover:bg-[#E8DDBF]"
              title="Guardar plantilla"
            >
              <Heart size={15} />
            </button>
          </div>
        </div>

        {/* Producto actual */}
        <div className="mb-3 rounded-2xl border border-[#E8DDBF] bg-white p-4">
          <div className="flex items-center gap-3">
            <img
              src={producto.foto}
              alt={producto.nombre}
              className="h-16 w-16 rounded-lg bg-[#F8F0E3] object-contain"
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#1A2238]">
                {producto.nombre}
              </h3>
              <p className="text-xs text-gray-500">
                {producto.tamano} · {producto.categoria}
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#1A2238]">
              Vista previa del carrusel
            </h2>
            <span className="text-xs text-[#9A7A1F]">✏️ Tocá Editar</span>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {slides.map((slide, i) => (
              <div key={i} className="w-64 flex-shrink-0 snap-center">
                <div className="h-80 w-64 overflow-hidden rounded-2xl bg-[#101827] shadow-2xl">
                  <SlidePreview slide={slide} producto={producto} estilo={estilo} />
                </div>
                <div className="mt-1 flex items-center justify-between gap-1 px-1">
                  <span className="text-xs text-[#9A7A1F]">
                    Slide {i + 1}/5
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditIdx(i);
                        setEditTemp({ ...slide });
                      }}
                      className="flex items-center gap-1 rounded-full bg-[#F8F0E3] px-2 py-1 text-xs text-[#1A2238]"
                    >
                      <Edit3 size={9} /> Editar
                    </button>
                    <button
                      onClick={() => descargarSlide(i)}
                      disabled={status === `slide-${i}`}
                      className="flex items-center gap-1 rounded-full bg-[#1A2238] px-2 py-1 text-xs text-white disabled:opacity-60"
                    >
                      <Download size={9} />{" "}
                      {status === `slide-${i}` ? "…" : "PNG"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enviar a WhatsApp + ZIP backup */}
        <div className="mb-3 rounded-2xl bg-[#1A2238] p-4">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-white">
            <Send size={15} /> Enviar carrusel a WhatsApp
          </h3>
          <p className="mb-3 text-xs text-[#D4AF37]">
            Las 5 fotos + caption se mandan directo al chat que elijas
          </p>
          <button
            onClick={enviarAWhatsApp}
            disabled={status === "wa"}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-sm font-bold text-white hover:bg-[#1ebd5a] disabled:opacity-60"
          >
            <Send size={15} />
            {status === "wa" ? "Preparando…" : "Enviar a WhatsApp"}
          </button>
          <button
            onClick={descargarZip}
            disabled={status === "zip"}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent py-2 text-xs font-medium text-white/80 hover:bg-white/10 disabled:opacity-60"
            title="Bajar el .zip con todo (foto + 5 slides + caption.txt)"
          >
            <Package size={13} />
            {status === "zip" ? "Generando .zip…" : "O descargar .zip"}
          </button>
        </div>

        {/* Caption */}
        <div className="mb-3 rounded-2xl border border-[#E8DDBF] bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-[#1A2238]">
            Caption para Instagram
          </h3>
          <pre className="mb-2 whitespace-pre-wrap rounded-lg bg-[#F8F0E3] p-3 font-sans text-xs text-[#1A2238]">
            {caption}
          </pre>
          <p className="break-words text-xs text-[#9A7A1F]">{hashtags}</p>
          <button
            onClick={copiar}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A2238] py-2 text-sm font-medium text-white hover:bg-[#0e1626]"
          >
            <Copy size={13} /> {copiado ? "¡Copiado!" : "Copiar caption + hashtags"}
          </button>
        </div>

        {/* Plantillas guardadas */}
        <div className="mb-6 rounded-2xl border border-[#E8DDBF] bg-white p-4">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="flex w-full items-center justify-between text-sm font-semibold text-[#1A2238]"
          >
            <span className="flex items-center gap-2">
              <Heart size={15} /> Plantillas guardadas ({saved.length})
            </span>
            {showSaved ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showSaved && (
            <div className="mt-3 space-y-2">
              {saved.length === 0 && (
                <p className="py-2 text-center text-xs text-gray-500">
                  Todavía no guardaste ninguna. Tocá ❤️ para guardar la
                  configuración actual.
                </p>
              )}
              {saved.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg bg-[#F8F0E3] p-2"
                >
                  <img
                    src={s.producto.foto}
                    alt=""
                    className="h-10 w-10 rounded bg-white object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#1A2238]">
                      {s.nombre}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Estilo {s.estilo} · {FORMATOS[s.formato].label}
                    </p>
                  </div>
                  <button
                    onClick={() => cargarPlantilla(s)}
                    className="rounded bg-[#1A2238] px-2 py-1 text-xs text-white"
                  >
                    Usar
                  </button>
                  <button
                    onClick={() =>
                      setSaved((prev) => prev.filter((x) => x.id !== s.id))
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mb-6 text-center text-xs text-[#9A7A1F]">
          {productosCatalogo.length} productos · 5 estilos · 3 formatos · 1080px HD
        </p>
      </div>

      {/* Modal Editor */}
      {editIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          onClick={() => setEditIdx(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A2238]">
                Editar slide {editIdx + 1}
              </h2>
              <button onClick={() => setEditIdx(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-700">
                  Etiqueta (arriba)
                </label>
                <input
                  value={editTemp.etiqueta}
                  onChange={(e) =>
                    setEditTemp((t) => ({ ...t, etiqueta: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-700">
                  Título
                </label>
                <textarea
                  value={editTemp.titulo}
                  onChange={(e) =>
                    setEditTemp((t) => ({ ...t, titulo: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-700">
                  Subtítulo
                </label>
                <textarea
                  value={editTemp.subtitulo}
                  onChange={(e) =>
                    setEditTemp((t) => ({ ...t, subtitulo: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setEditIdx(null)}
                className="flex-1 rounded-lg bg-gray-200 py-2 text-sm font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1A2238] py-2 text-sm font-medium text-white"
              >
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tutorial */}
      {showTut && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setShowTut(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-bold text-[#1A2238]">Cómo usar</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="mb-1 font-semibold text-[#9A7A1F]">🎨 5 estilos</p>
                <p className="text-xs text-gray-600">
                  A foto fondo · B split · C minimalista · D marcos dorados · E
                  gradiente por categoría.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[#9A7A1F]">
                  📐 3 formatos
                </p>
                <p className="text-xs text-gray-600">
                  Feed 4:5, Cuadrado 1:1, Stories 9:16. Todos en 1080px HD.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[#9A7A1F]">
                  📦 Descargas
                </p>
                <p className="text-xs text-gray-600">
                  .zip completo (5 slides + foto + caption.txt) o PNG por slide.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[#9A7A1F]">💚 WhatsApp</p>
                <p className="text-xs text-gray-600">
                  El botón WA abre un mensaje con caption y hashtags listos.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTut(false)}
              className="mt-4 w-full rounded-lg bg-[#1A2238] py-2 font-medium text-white"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview component (in-DOM, no canvas) ----------------------------------

function SlidePreview({
  slide,
  producto,
  estilo,
}: {
  slide: CarouselSlide;
  producto: CarouselProduct;
  estilo: CarouselStyle;
}) {
  if (estilo === "A") {
    return (
      <div className="relative h-full w-full">
        <img
          src={producto.foto}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#101827]/40 to-[#101827]/90" />
        <div className="relative flex h-full flex-col justify-end p-4 text-white">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#D4AF37]">
            {slide.etiqueta}
          </p>
          <h3 className="mb-1 text-lg font-bold leading-tight">
            {slide.titulo}
          </h3>
          <p className="text-xs text-white/85">{slide.subtitulo}</p>
        </div>
      </div>
    );
  }
  if (estilo === "B") {
    return (
      <div className="flex h-full w-full">
        <div
          className="relative h-full w-1/2"
          style={{ background: "linear-gradient(135deg,#F8F0E3,#E8DDBF)" }}
        >
          <img
            src={producto.foto}
            alt=""
            className="absolute inset-0 h-full w-full object-contain p-2"
          />
        </div>
        <div className="flex w-1/2 flex-col justify-center bg-[#101827] p-3 text-white">
          <p className="mb-1 text-[8px] font-semibold uppercase tracking-widest text-[#D4AF37]">
            {slide.etiqueta}
          </p>
          <h3 className="mb-1 text-sm font-bold leading-tight">
            {slide.titulo}
          </h3>
          <p className="text-[10px] text-white/75">{slide.subtitulo}</p>
        </div>
      </div>
    );
  }
  if (estilo === "C") {
    return (
      <div className="flex h-full w-full flex-col bg-[#101827]">
        <div className="relative flex-1">
          <img
            src={producto.foto}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101827]" />
        </div>
        <div className="p-4 text-center text-white">
          <p className="mb-1 text-[8px] uppercase tracking-widest text-[#D4AF37]/85">
            {slide.etiqueta}
          </p>
          <h3 className="mb-1 text-sm font-bold leading-tight">
            {slide.titulo}
          </h3>
          <p className="text-[10px] text-white/70">{slide.subtitulo}</p>
        </div>
      </div>
    );
  }
  if (estilo === "D") {
    return (
      <div className="relative h-full w-full">
        <img
          src={producto.foto}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/85" />
        <div className="absolute left-3 top-3 h-6 w-6 rounded-tl border-l-2 border-t-2 border-[#D4AF37]/80" />
        <div className="absolute right-3 top-3 h-6 w-6 rounded-tr border-r-2 border-t-2 border-[#D4AF37]/80" />
        <div className="absolute bottom-3 left-3 h-6 w-6 rounded-bl border-b-2 border-l-2 border-[#D4AF37]/80" />
        <div className="absolute bottom-3 right-3 h-6 w-6 rounded-br border-b-2 border-r-2 border-[#D4AF37]/80" />
        <div className="relative flex h-full flex-col justify-end p-5 text-white">
          <div className="mb-2 border-t border-[#D4AF37]/50" />
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#D4AF37]">
            {slide.etiqueta}
          </p>
          <h3 className="mb-1 text-lg font-bold leading-tight">
            {slide.titulo}
          </h3>
          <p className="text-xs text-white/85">{slide.subtitulo}</p>
        </div>
      </div>
    );
  }
  // Estilo E
  const gradStops: Record<string, string> = {
    femenino: "linear-gradient(135deg,#c44569,#f8a5c2)",
    masculino: "linear-gradient(135deg,#1A2238,#3a4f8a)",
    unisex: "linear-gradient(135deg,#614124,#D4AF37)",
    home: "linear-gradient(135deg,#1a3619,#2d5a27)",
  };
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center p-4 text-white"
      style={{ background: gradStops[producto.categoria] || gradStops.unisex }}
    >
      <img
        src={producto.foto}
        alt=""
        className="mb-3 h-28 w-28 object-contain drop-shadow-lg"
      />
      <div className="mb-3 h-px w-2/3 bg-white/30" />
      <p className="mb-1 text-[8px] uppercase tracking-widest text-white/65">
        {slide.etiqueta}
      </p>
      <h3 className="mb-1 text-center text-sm font-bold leading-tight">
        {slide.titulo}
      </h3>
      <p className="text-center text-[10px] text-white/80">{slide.subtitulo}</p>
    </div>
  );
}

export default CarouselGenerator;
