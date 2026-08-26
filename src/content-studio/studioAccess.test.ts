import { describe, expect, it } from "vitest";
import { ADMIN_ONLY_ACCESS_MESSAGE, isContentAdminSession, shouldShowContentPackError } from "./studioAccess";

describe("Content Agent access message", () => {
  it("explains how to get admin-only access", () => {
    expect(ADMIN_ONLY_ACCESS_MESSAGE).toBe(
      "Para usar DT Content Agent, iniciá sesión desde Admin; el PIN por sí solo no habilita esta herramienta.",
    );
  });

  it("requires the boolean content_admin claim for an authenticated user", () => {
    expect(isContentAdminSession(null)).toBe(false);
    expect(isContentAdminSession({ user: { app_metadata: {} } } as never)).toBe(false);
    expect(isContentAdminSession({ user: { app_metadata: { content_admin: false } } } as never)).toBe(false);
    expect(isContentAdminSession({ user: { app_metadata: { content_admin: "true" } } } as never)).toBe(false);
    expect(isContentAdminSession({ user: { app_metadata: { content_admin: true } } } as never)).toBe(true);
  });

  it("shows normalized pack errors in both Studio modes", () => {
    expect(shouldShowContentPackError("generate", "No se pudo guardar el content pack.")).toBe(true);
    expect(shouldShowContentPackError("inbox", "No se pudo guardar el content pack.")).toBe(true);
    expect(shouldShowContentPackError("generate", null)).toBe(false);
  });
});
