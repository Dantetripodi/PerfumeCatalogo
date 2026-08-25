import { SUPABASE_CONFIGURED, supabase } from "../lib/supabase";
import type {
  ContentPack,
  ContentPackPayload,
  ContentPackReason,
  ContentPackStatus,
  NewContentPack,
} from "./contentPackTypes";

const TABLE = "content_packs";
const CONTENT_ADMIN_CLAIM = "content_admin";

export type ContentPackRepositoryErrorCode =
  | "CONFIGURATION_MISSING"
  | "SESSION_MISSING"
  | "PERMISSION_DENIED"
  | "INVALID_STATUS"
  | "INVALID_REASON"
  | "DATABASE_ERROR";

export class ContentPackRepositoryError extends Error {
  readonly name = "ContentPackRepositoryError";

  constructor(
    readonly code: ContentPackRepositoryErrorCode,
    message: string,
  ) {
    super(message);
  }
}

type ContentPackRow = {
  id: string;
  product_id: number;
  reason: ContentPackReason;
  payload: ContentPackPayload;
  status: ContentPackStatus;
  created_at: string;
  updated_at: string;
};

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function isContentPackStatus(value: string): value is ContentPackStatus {
  return value === "draft" || value === "approved" || value === "rejected";
}

function isContentPackReason(value: string): value is ContentPackReason {
  return value === "manual" || value === "new_product";
}

function mapRow(row: ContentPackRow): ContentPack {
  return {
    id: row.id,
    productId: row.product_id,
    reason: row.reason,
    payload: row.payload,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertContentAdmin(): Promise<void> {
  if (!SUPABASE_CONFIGURED) {
    throw new ContentPackRepositoryError(
      "CONFIGURATION_MISSING",
      "Supabase no está configurado.",
    );
  }

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    throw new ContentPackRepositoryError("SESSION_MISSING", "No hay una sesión activa.");
  }

  if (user.app_metadata[CONTENT_ADMIN_CLAIM] !== true) {
    throw new ContentPackRepositoryError(
      "PERMISSION_DENIED",
      "El usuario no tiene permisos para gestionar content packs.",
    );
  }
}

function validateStatus(status: string): asserts status is ContentPackStatus {
  if (!isContentPackStatus(status)) {
    throw new ContentPackRepositoryError(
      "INVALID_STATUS",
      "El estado del content pack no es válido.",
    );
  }
}

function validateReason(reason: string): asserts reason is ContentPackReason {
  if (!isContentPackReason(reason)) {
    throw new ContentPackRepositoryError(
      "INVALID_REASON",
      "El motivo del content pack no es válido.",
    );
  }
}

function databaseError(message: string): ContentPackRepositoryError {
  return new ContentPackRepositoryError(
    "DATABASE_ERROR",
    `No se pudo guardar el content pack: ${message}`,
  );
}

export async function listContentPacks(status?: ContentPackStatus): Promise<ContentPack[]> {
  await assertContentAdmin();
  if (status !== undefined) validateStatus(status);

  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (status !== undefined) query = query.eq("status", status);

  const { data, error } = (await query) as QueryResult<ContentPackRow[]>;
  if (error) throw databaseError(error.message);
  return (data ?? []).map(mapRow);
}

export async function createContentPack(input: NewContentPack): Promise<ContentPack> {
  await assertContentAdmin();
  validateReason(input.reason);
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      product_id: input.productId,
      reason: input.reason,
      payload: input.payload,
      status: "draft",
      updated_at: updatedAt,
    })
    .select()
    .single();

  if (error || !data) throw databaseError(error?.message ?? "respuesta vacía");
  return mapRow(data as ContentPackRow);
}

export async function updateContentPack(
  id: string,
  payload: ContentPackPayload,
): Promise<ContentPack> {
  await assertContentAdmin();

  const { data, error } = await supabase
    .from(TABLE)
    .update({ payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) throw databaseError(error?.message ?? "respuesta vacía");
  return mapRow(data as ContentPackRow);
}

export async function setContentPackStatus(
  id: string,
  status: ContentPackStatus,
): Promise<ContentPack> {
  await assertContentAdmin();
  validateStatus(status);

  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) throw databaseError(error?.message ?? "respuesta vacía");
  return mapRow(data as ContentPackRow);
}
