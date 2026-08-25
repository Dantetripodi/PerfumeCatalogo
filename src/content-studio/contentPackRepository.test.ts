import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentPackPayload } from "./contentPackTypes";

const { getSession, from } = vi.hoisted(() => ({
  getSession: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  SUPABASE_CONFIGURED: true,
  supabase: { auth: { getSession }, from },
}));

import {
  ContentPackRepositoryError,
  createContentPack,
  listContentPacks,
  setContentPackStatus,
  updateContentPack,
} from "./contentPackRepository";

const payload: ContentPackPayload = {
  instagramCaption: "Una fragancia luminosa.",
  stories: [{ title: "Story", text: "Probala", cta: "Escribinos" }],
  reel: {
    hook: "Te va a sorprender",
    shots: ["Frasco"],
    onScreenText: ["Luminosa"],
    cta: "Escribinos",
    caption: "Caption",
  },
  hashtags: ["#perfume"],
  imageConcepts: [{ title: "Luz", scene: "Lino" }],
  whatsappText: "Hola",
};

const row = {
  id: "pack-1",
  product_id: 42,
  reason: "manual",
  payload,
  status: "draft",
  created_at: "2026-08-25T12:00:00.000Z",
  updated_at: "2026-08-25T12:00:00.000Z",
};

function authorizedSession() {
  getSession.mockResolvedValue({
    data: {
      session: {
        user: { app_metadata: { content_admin: true } },
      },
    },
  });
}

function queryChain(result: { data: unknown; error: null | { message: string } }) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);
  chain.then.mockImplementation((resolve: (value: typeof result) => unknown) =>
    Promise.resolve(resolve(result)),
  );
  from.mockReturnValue(chain);
  return chain;
}

describe("contentPackRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mapea rows snake_case al modelo ContentPack", async () => {
    authorizedSession();
    const chain = queryChain({ data: [row], error: null });

    await expect(listContentPacks()).resolves.toEqual([
      {
        id: "pack-1",
        productId: 42,
        reason: "manual",
        payload,
        status: "draft",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    ]);
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("sanitiza los errores de base de datos sin exponer detalles de Supabase", async () => {
    authorizedSession();
    queryChain({
      data: null,
      error: { message: "secret relation, token=private-value" },
    });

    await expect(listContentPacks()).rejects.toEqual(
      new ContentPackRepositoryError(
        "DATABASE_ERROR",
        "No se pudo procesar el content pack.",
      ),
    );
  });

  it("envía product_id, reason, payload y draft al crear", async () => {
    authorizedSession();
    const chain = queryChain({ data: row, error: null });

    await createContentPack({ productId: 42, reason: "new_product", payload });

    expect(chain.insert).toHaveBeenCalledWith({
      product_id: 42,
      reason: "new_product",
      payload,
      status: "draft",
      updated_at: expect.any(String),
    });
  });

  it("actualiza payload y status con timestamps", async () => {
    authorizedSession();
    const chain = queryChain({ data: row, error: null });

    await updateContentPack("pack-1", payload);
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ payload, updated_at: expect.any(String) }),
    );

    await setContentPackStatus("pack-1", "approved");
    expect(chain.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "approved", updated_at: expect.any(String) }),
    );
  });

  it("filtra por estados permitidos y rechaza estados inválidos", async () => {
    authorizedSession();
    const chain = queryChain({ data: [], error: null });

    await listContentPacks("approved");
    expect(chain.eq).toHaveBeenCalledWith("status", "approved");

    await expect(setContentPackStatus("pack-1", "pending" as never)).rejects.toMatchObject({
      code: "INVALID_STATUS",
    });
  });

  it.each([
    ["configuración faltante", "CONFIGURATION_MISSING", "Supabase no está configurado."],
    ["sesión ausente", "SESSION_MISSING", "No hay una sesión activa."],
    ["claim ausente", "PERMISSION_DENIED", "El usuario no tiene permisos para gestionar content packs."],
  ] as const)("distingue %s con error estable en español", async (_case, code, message) => {
    vi.resetModules();
    vi.doMock("../lib/supabase", () => ({
      SUPABASE_CONFIGURED: code !== "CONFIGURATION_MISSING",
      supabase: {
        auth: {
          getSession: code === "SESSION_MISSING"
            ? vi.fn().mockResolvedValue({ data: { session: null } })
            : vi.fn().mockResolvedValue({ data: { session: { user: { app_metadata: {} } } } }),
        },
        from,
      },
    }));
    const repository = await import("./contentPackRepository");

    await expect(repository.listContentPacks()).rejects.toEqual(
      new repository.ContentPackRepositoryError(code, message),
    );
  });

  it("no consulta Supabase sin el claim content_admin verdadero", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { app_metadata: { content_admin: "true" } } } },
    });

    await expect(listContentPacks()).rejects.toEqual(
      new ContentPackRepositoryError(
        "PERMISSION_DENIED",
        "El usuario no tiene permisos para gestionar content packs.",
      ),
    );
    expect(from).not.toHaveBeenCalled();
  });
});
