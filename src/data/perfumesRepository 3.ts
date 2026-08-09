/**
 * The only module that talks to Supabase about perfumes.
 *
 * Components and hooks call these functions instead of building queries, so the
 * UI never imports the database client. Swapping the backend, or handing a fake
 * to a test, means replacing this file and nothing else.
 *
 * Every function returns a plain result rather than throwing: callers already
 * render inline error messages, and this keeps the Supabase error shape from
 * leaking upward.
 */
import { supabase } from "../lib/supabase";
import { normalizePerfume, rowToInput } from "./normalize";
import { Perfume, PerfumeCategory, PerfumeCollection, PerfumeRow, Notes } from "../types";

const TABLE = "perfumes";
const IMAGE_BUCKET = "perfume-images";
const STORAGE_PUBLIC_PREFIX = `/storage/v1/object/public/${IMAGE_BUCKET}/`;

export type RepositoryResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/** The writable shape of a perfume, mirroring the table columns. */
export interface PerfumeDraft {
  name: string;
  brand: string;
  price: number | null;
  gender: Perfume["gender"];
  category: PerfumeCategory;
  size: string;
  image_url: string;
  description: string;
  notes: Notes;
  collection: PerfumeCollection;
  is_featured: boolean;
}

export async function fetchPerfumes(): Promise<RepositoryResult<Perfume[]>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, error: "No se pudo cargar el catálogo. Verificá tu conexión e intentá de nuevo." };
  }

  const perfumes = (data as PerfumeRow[]).map(row => {
    const { input, id, collection, isFeatured } = rowToInput(row);
    return normalizePerfume(input, id, collection, isFeatured);
  });

  return { ok: true, data: perfumes };
}

export async function createPerfume(draft: PerfumeDraft): Promise<RepositoryResult> {
  const { error } = await supabase.from(TABLE).insert(draft);
  return error ? { ok: false, error: `Error al crear: ${error.message}` } : { ok: true, data: undefined };
}

export async function updatePerfume(id: number, draft: PerfumeDraft): Promise<RepositoryResult> {
  const { error } = await supabase
    .from(TABLE)
    .update({ ...draft, updated_at: new Date().toISOString() })
    .eq("id", id);

  return error ? { ok: false, error: `Error al actualizar: ${error.message}` } : { ok: true, data: undefined };
}

export async function deletePerfume(perfume: Perfume): Promise<RepositoryResult> {
  const { error } = await supabase.from(TABLE).delete().eq("id", perfume.id);
  if (error) return { ok: false, error: `Error al borrar: ${error.message}` };

  // Best effort: drop the stored image too, but never block the delete on it.
  // Products imported from the supplier keep a repo-relative path and own no
  // storage object, so this only applies to photos uploaded from the panel.
  if (perfume.image.includes(STORAGE_PUBLIC_PREFIX)) {
    const storageKey = perfume.image.split(STORAGE_PUBLIC_PREFIX)[1];
    if (storageKey) void supabase.storage.from(IMAGE_BUCKET).remove([storageKey]);
  }

  return { ok: true, data: undefined };
}

export async function uploadPerfumeImage(
  storageKey: string,
  file: Blob,
  contentType: string
): Promise<RepositoryResult<string>> {
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storageKey, file, { contentType, upsert: true });

  if (error) return { ok: false, error: `Error al subir la imagen: ${error.message}` };

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storageKey);
  return { ok: true, data: data.publicUrl };
}
