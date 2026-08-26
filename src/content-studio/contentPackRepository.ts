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
  | "AUTH_ERROR"
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

function isContentPackStatus(value: unknown): value is ContentPackStatus {
  return value === "draft" || value === "approved" || value === "rejected";
}

function isContentPackReason(value: unknown): value is ContentPackReason {
  return value === "manual" || value === "new_product";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOptionalString(value: Record<string, unknown>, key: string): boolean {
  return value[key] === undefined || typeof value[key] === "string";
}

function isStoryIdea(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.text === "string" &&
    isOptionalString(value, "cta")
  );
}

function isReelIdea(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.hook === "string" &&
    isStringArray(value.shots) &&
    isStringArray(value.onScreenText) &&
    typeof value.cta === "string" &&
    typeof value.caption === "string"
  );
}

function isImageConcept(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.scene === "string" &&
    isOptionalString(value, "overlayText")
  );
}

function isContentPackPayload(value: unknown): value is ContentPackPayload {
  if (!isRecord(value)) return false;

  return (
    typeof value.instagramCaption === "string" &&
    Array.isArray(value.stories) &&
    value.stories.every(isStoryIdea) &&
    isReelIdea(value.reel) &&
    isStringArray(value.hashtags) &&
    Array.isArray(value.imageConcepts) &&
    value.imageConcepts.every(isImageConcept) &&
    typeof value.whatsappText === "string"
  );
}

function mapRow(row: unknown): ContentPack {
  if (!isContentPackRow(row)) throw databaseError();

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

function isContentPackRow(row: unknown): row is ContentPackRow {
  if (!isRecord(row)) return false;
  const candidate = row;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.product_id === "number" &&
    isContentPackReason(candidate.reason) &&
    isContentPackPayload(candidate.payload) &&
    isContentPackStatus(candidate.status) &&
    typeof candidate.created_at === "string" &&
    typeof candidate.updated_at === "string"
  );
}

async function assertContentAdmin(): Promise<void> {
  if (!SUPABASE_CONFIGURED) {
    throw new ContentPackRepositoryError(
      "CONFIGURATION_MISSING",
      "Supabase no está configurado.",
    );
  }

  let data: { session: { user: { app_metadata?: Record<string, unknown> } | null } | null } | null;
  try {
    ({ data } = await supabase.auth.getSession());
  } catch {
    throw new ContentPackRepositoryError(
      "AUTH_ERROR",
      "No se pudo validar la sesión del administrador.",
    );
  }

  const user = data?.session?.user;
  if (!user) {
    throw new ContentPackRepositoryError("SESSION_MISSING", "No hay una sesión activa.");
  }

  if (user.app_metadata?.[CONTENT_ADMIN_CLAIM] !== true) {
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

function databaseError(): ContentPackRepositoryError {
  return new ContentPackRepositoryError(
    "DATABASE_ERROR",
    "No se pudo procesar el content pack.",
  );
}

async function runDatabaseOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ContentPackRepositoryError) throw error;
    throw databaseError();
  }
}

export async function listContentPacks(status?: ContentPackStatus): Promise<ContentPack[]> {
  await assertContentAdmin();
  if (status !== undefined) validateStatus(status);

  return runDatabaseOperation(async () => {
    let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
    if (status !== undefined) query = query.eq("status", status);

    const { data, error } = (await query) as QueryResult<ContentPackRow[]>;
    if (error) throw databaseError();
    if (data === null) return [];
    if (!Array.isArray(data)) throw databaseError();
    return data.map(mapRow);
  });
}

export async function createContentPack(input: NewContentPack): Promise<ContentPack> {
  await assertContentAdmin();
  validateReason(input.reason);
  const updatedAt = new Date().toISOString();

  return runDatabaseOperation(async () => {
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

    if (error || !data) throw databaseError();
    return mapRow(data);
  });
}

export async function updateContentPack(
  id: string,
  payload: ContentPackPayload,
): Promise<ContentPack> {
  await assertContentAdmin();

  return runDatabaseOperation(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw databaseError();
    return mapRow(data);
  });
}

export async function setContentPackStatus(
  id: string,
  status: ContentPackStatus,
): Promise<ContentPack> {
  await assertContentAdmin();
  validateStatus(status);

  return runDatabaseOperation(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw databaseError();
    return mapRow(data);
  });
}
