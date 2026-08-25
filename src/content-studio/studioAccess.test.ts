import { describe, expect, it } from "vitest";
import { ADMIN_ONLY_ACCESS_MESSAGE } from "./studioAccess";

describe("Content Agent access message", () => {
  it("explains how to get admin-only access", () => {
    expect(ADMIN_ONLY_ACCESS_MESSAGE).toBe(
      "Para usar DT Content Agent, iniciá sesión desde Admin; el PIN por sí solo no habilita esta herramienta.",
    );
  });
});
