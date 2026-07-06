import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Perfume, PerfumeCategory, PerfumeCollection, PerfumeInput, COLLECTION_LABELS } from "../../types";
import { buildSlug } from "../../data";

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const storageKey = makeSafeSlug(form.name || "perfume", form.collection, ext);

      const { error: uploadError } = await supabase.storage
        .from("perfume-images")
        .upload(storageKey, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        onError(`Error al subir la imagen: ${uploadError.message}`);
        setPreviewUrl(isEditing ? editingPerfume.image : null);
        setUploadingImage(false);
        return;
      }

      const { data } = supabase.storage
        .from("perfume-images")
        .getPublicUrl(storageKey);

      setNewImageUrl(data.publicUrl);
      setField("imageUrl", data.publicUrl);
    } catch {
      onError("Error inesperado al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

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

    if (isEditing) {
      const { error } = await supabase
        .from("perfumes")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editingPerfume.id);

      if (error) {
        onError(`Error al actualizar: ${error.message}`);
        setSaving(false);
        return;
      }
      onSaved("updated");
    } else {
      const { error } = await supabase.from("perfumes").insert(payload);

      if (error) {
        onError(`Error al crear: ${error.message}`);
        setSaving(false);
        return;
      }
      onSaved("created");
    }

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

        {/* Image — file input + URL fallback */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-[#1A2238]">Imagen</span>

          {/* Preview */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-28 w-28 rounded-md border border-[#E8DDBF] object-cover"
            />
          )}

          {/* File picker */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2 rounded-md border border-[#E8DDBF] px-4 py-2 text-sm font-medium text-[#1A2238] transition-colors hover:border-[#D4AF37] disabled:opacity-50"
            >
              <Upload size={15} />
              {uploadingImage ? "Subiendo…" : "Subir foto"}
            </button>
            <span className="text-xs text-gray-400">o pegá una URL:</span>
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

          {uploadingImage && (
            <p className="text-xs text-[#9A7A1F]">Subiendo imagen a Supabase Storage…</p>
          )}
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
