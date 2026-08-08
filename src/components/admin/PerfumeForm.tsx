import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ImageIcon, Save, X } from "lucide-react";
import { createPerfume, updatePerfume, uploadPerfumeImage } from "../../data/perfumesRepository";
import { Perfume, PerfumeCategory, PerfumeCollection, PerfumeInput, COLLECTION_LABELS } from "../../types";
import { buildSlug } from "../../data/normalize";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  brand: string;
  price: string;            // "Consultar" or a numeric string
  size: string;
  gender: PerfumeInput["gender"];
  category: string;
  collection: PerfumeCollection;
  description: string;
  notesTop: string;
  notesMiddle: string;
  notesBase: string;
  isFeatured: boolean;
  imageUrl: string;         // current persisted URL
}

interface PerfumeFormProps {
  /** null = create mode */
  editingPerfume: Perfume | null;
  onBack: () => void;
  /** Called after a successful save with the operation type */
  onSaved: (operation: "created" | "updated") => void;
  onError: (message: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function perfumeToFormState(perfume: Perfume): FormState {
  return {
    name: perfume.name,
    brand: perfume.brand,
    price: typeof perfume.price === "number" ? String(perfume.price) : "Consultar",
    size: perfume.size,
    gender: perfume.gender,
    category: perfume.category,
    collection: perfume.collection,
    description: perfume.description,
    notesTop: perfume.notes.top.join(", "),
    notesMiddle: perfume.notes.middle.join(", "),
    notesBase: perfume.notes.base.join(", "),
    isFeatured: perfume.isFeatured ?? false,
    imageUrl: perfume.image,
  };
}

const emptyFormState: FormState = {
  name: "",
  brand: "Yves Dorgeval",
  price: "Consultar",
  size: "100ml",
  gender: "unisex",
  category: "oriental",
  collection: "regular",
  description: "",
  notesTop: "",
  notesMiddle: "",
  notesBase: "",
  isFeatured: false,
  imageUrl: "",
};

function parseNotes(raw: string): string[] {
  return raw.split(",").map(n => n.trim()).filter(Boolean);
}

function parsePrice(raw: string): number | "Consultar" {
  const trimmed = raw.trim();
  if (trimmed.toLowerCase() === "consultar") return "Consultar";
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0 ? n : "Consultar";
}

function makeSafeSlug(name: string, collection: PerfumeCollection, ext: string): string {
  const ts = Date.now();
  const slug = buildSlug(`${collection}-${name}`).replace(/-+/g, "-").slice(0, 50);
  return `perfumes/${collection}/${ts}-${slug}.${ext}`;
}

const MAX_SIDE = 900;
const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.82;

/**
 * Resize `file` so its longest side is at most MAX_SIDE px,
 * then encode as WebP (falling back to JPEG if unavailable).
 * Returns { blob, ext, contentType }.
 */
async function resizeImage(
  file: File
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
      const targetW = Math.round(w * scale);
      const targetH = Math.round(h * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Try WebP first, fall back to JPEG
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob && webpBlob.size > 0) {
            resolve({ blob: webpBlob, ext: "webp", contentType: "image/webp" });
          } else {
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  resolve({ blob: jpegBlob, ext: "jpg", contentType: "image/jpeg" });
                } else {
                  reject(new Error("Failed to encode image"));
                }
              },
              "image/jpeg",
              JPEG_QUALITY
            );
          }
        },
        "image/webp",
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for resizing"));
    };

    img.src = objectUrl;
  });
}

// ─── TextInput sub-component ─────────────────────────────────────────────────

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label, value, onChange, placeholder, required, className = "",
}) => (
  <label className={`text-sm font-medium text-[#1A2238] ${className}`}>
    {label}
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
    />
  </label>
);

// ─── PerfumeForm ─────────────────────────────────────────────────────────────

const PerfumeForm: React.FC<PerfumeFormProps> = ({
  editingPerfume,
  onBack,
  onSaved,
  onError,
}) => {
  const isEditing = editingPerfume !== null;
  const [form, setForm] = useState<FormState>(
    isEditing ? perfumeToFormState(editingPerfume) : emptyFormState
  );
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    isEditing ? editingPerfume.image : null
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null); // URL after upload
  const [isDragging, setIsDragging] = useState(false);
  // Track locally-created object URLs so we can revoke them on cleanup
  const localPreviewRef = useRef<string | null>(null);

  // Re-init when editingPerfume changes (e.g. opening a different perfume)
  useEffect(() => {
    if (isEditing) {
      setForm(perfumeToFormState(editingPerfume));
      setPreviewUrl(editingPerfume.image);
    } else {
      setForm(emptyFormState);
      setPreviewUrl(null);
    }
    setNewImageUrl(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPerfume]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ── Photo upload ────────────────────────────────────────────────────────────

  /** Single entry point for all three input methods (click, drag, paste). */
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError("Ese archivo no es una imagen.");
      return;
    }

    // Revoke previous local object URL to avoid leaks
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    const localPreview = URL.createObjectURL(file);
    localPreviewRef.current = localPreview;
    setPreviewUrl(localPreview);

    setUploadingImage(true);
    try {
      // Resize + convert to WebP (or JPEG fallback) before uploading
      const { blob: optimizedBlob, ext, contentType } = await resizeImage(file);
      const storageKey = makeSafeSlug(form.name || "perfume", form.collection, ext);

      const upload = await uploadPerfumeImage(storageKey, optimizedBlob, contentType);

      if (!upload.ok) {
        onError(upload.error);
        setPreviewUrl(isEditing ? editingPerfume.image : null);
        setUploadingImage(false);
        return;
      }

      setNewImageUrl(upload.data);
      setField("imageUrl", upload.data);
    } catch {
      onError("Error inesperado al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.collection, isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear when leaving the drop zone itself, not its children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  // ── Clipboard paste ──────────────────────────────────────────────────────────

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      // Find the first image item, if any
      let imageFile: File | null = null;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          imageFile = item.getAsFile();
          break;
        }
      }

      // Only intercept when the clipboard actually contains an image.
      // If the user is pasting text into a text field, imageFile is null
      // and we return without calling preventDefault — normal paste proceeds.
      if (!imageFile) return;

      // Don't hijack if focus is inside a regular text input / textarea
      const active = document.activeElement;
      const isTextTarget =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;
      if (isTextTarget) return;

      e.preventDefault();
      void handleFile(imageFile);
    };

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleFile]);

  // ── Cleanup object URLs on unmount ───────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const resolvedImageUrl = newImageUrl ?? form.imageUrl;

    if (!resolvedImageUrl) {
      onError("El perfume necesita una imagen. Subí un archivo o pegá una URL.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: parsePrice(form.price) === "Consultar" ? null : parsePrice(form.price) as number,
      gender: form.gender,
      category: form.category.trim() as PerfumeCategory,
      size: form.size.trim(),
      image_url: resolvedImageUrl,
      description: form.description.trim(),
      notes: {
        top: parseNotes(form.notesTop),
        middle: parseNotes(form.notesMiddle),
        base: parseNotes(form.notesBase),
      },
      collection: form.collection,
      is_featured: form.isFeatured,
    };

    const result = isEditing
      ? await updatePerfume(editingPerfume.id, payload)
      : await createPerfume(payload);

    if (!result.ok) {
      onError(result.error);
      setSaving(false);
      return;
    }

    onSaved(isEditing ? "updated" : "created");

    setSaving(false);
  };

  const collectionOptions = Object.entries(COLLECTION_LABELS) as Array<
    [PerfumeCollection, string]
  >;

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-md border border-[#E8DDBF] px-3 py-1.5 text-sm font-medium text-[#1A2238] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
        >
          <ArrowLeft size={14} />
          Volver
        </button>
        <h3 className="font-semibold text-[#1A2238]">
          {isEditing ? `Editar: ${editingPerfume.name}` : "Nuevo perfume"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">

        {/* Name */}
        <TextInput
          label="Nombre"
          value={form.name}
          onChange={v => setField("name", v)}
          required
        />

        {/* Brand */}
        <TextInput
          label="Marca"
          value={form.brand}
          onChange={v => setField("brand", v)}
          required
        />

        {/* Price */}
        <TextInput
          label="Precio"
          value={form.price}
          onChange={v => setField("price", v)}
          placeholder="60000 o Consultar"
          required
        />

        {/* Size */}
        <TextInput
          label="Tamaño"
          value={form.size}
          onChange={v => setField("size", v)}
          placeholder="100ml"
          required
        />

        {/* Gender */}
        <label className="text-sm font-medium text-[#1A2238]">
          Género
          <select
            value={form.gender}
            onChange={e => setField("gender", e.target.value as PerfumeInput["gender"])}
            className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="unisex">Unisex</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </label>

        {/* Category */}
        <TextInput
          label="Categoría"
          value={form.category}
          onChange={v => setField("category", v)}
          placeholder="oriental, floral, cítrico..."
          required
        />

        {/* Collection */}
        <label className="text-sm font-medium text-[#1A2238]">
          Línea <span className="font-normal text-gray-400">(colección)</span>
          <select
            value={form.collection}
            onChange={e => setField("collection", e.target.value as PerfumeCollection)}
            className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            required
          >
            {collectionOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        {/* Destacar toggle */}
        <label className="flex cursor-pointer items-center gap-3 self-center rounded-lg border border-[#E8DDBF] p-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={e => setField("isFeatured", e.target.checked)}
              className="sr-only"
            />
            <div
              className={`h-6 w-11 rounded-full transition-colors ${
                form.isFeatured ? "bg-[#D4AF37]" : "bg-gray-200"
              }`}
            />
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.isFeatured ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-[#1A2238]">
            ★ Destacar en catálogo
          </span>
        </label>

        {/* Description */}
        <label className="text-sm font-medium text-[#1A2238] sm:col-span-2">
          Descripción
          <textarea
            value={form.description}
            onChange={e => setField("description", e.target.value)}
            className="mt-1 min-h-24 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            required
          />
        </label>

        {/* Notes */}
        <TextInput
          label="Notas de salida"
          value={form.notesTop}
          onChange={v => setField("notesTop", v)}
          placeholder="Bergamota, limón"
        />
        <TextInput
          label="Notas de corazón"
          value={form.notesMiddle}
          onChange={v => setField("notesMiddle", v)}
          placeholder="Jazmín, lavanda"
        />
        <TextInput
          label="Notas de fondo"
          value={form.notesBase}
          onChange={v => setField("notesBase", v)}
          placeholder="Vainilla, ámbar"
        />

        {/* Image — drop zone (click / drag / paste) + URL fallback */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-[#1A2238]">Imagen</span>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Zona de carga de imagen"
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!uploadingImage) fileInputRef.current?.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors",
              isDragging
                ? "border-[#D4AF37] bg-[#D4AF37]/10"
                : "border-[#E8DDBF] bg-[#FBF8F1] hover:border-[#D4AF37] hover:bg-[#FBF8F1]",
              uploadingImage ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            {previewUrl ? (
              /* Preview with a "remove" button */
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-28 w-auto max-w-full rounded-md object-cover shadow"
                />
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (localPreviewRef.current) {
                      URL.revokeObjectURL(localPreviewRef.current);
                      localPreviewRef.current = null;
                    }
                    setPreviewUrl(null);
                    setNewImageUrl(null);
                    setField("imageUrl", "");
                  }}
                  className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-gray-500 shadow transition-colors hover:bg-white hover:text-red-500"
                  aria-label="Quitar imagen"
                >
                  <X size={14} />
                </button>
                <span className="text-xs text-gray-400">
                  {uploadingImage ? "Subiendo…" : "Clic para cambiar"}
                </span>
              </>
            ) : (
              /* Empty state */
              <>
                <ImageIcon size={28} className="text-[#D4AF37]/70" />
                <p className="text-sm font-medium text-[#1A2238]">
                  {uploadingImage
                    ? "Subiendo imagen a Supabase Storage…"
                    : "Arrastrá una imagen, pegá (Ctrl/Cmd+V) o hacé clic para elegir"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP · máx. recomendado 2 MB</p>
              </>
            )}
          </div>

          {/* URL fallback */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-gray-400">o pegá una URL:</span>
            <input
              type="url"
              value={newImageUrl ?? form.imageUrl}
              onChange={e => {
                setField("imageUrl", e.target.value);
                setNewImageUrl(e.target.value);
                setPreviewUrl(e.target.value || null);
              }}
              placeholder="https://..."
              className="flex-1 rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1A2238] px-4 py-3 font-medium text-white transition-colors hover:bg-[#25304F] disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear perfume"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfumeForm;
