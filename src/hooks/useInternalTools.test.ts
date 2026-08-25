import { describe, expect, it } from "vitest";
import { canOpenInternalTool } from "./useInternalTools";

describe("internal tool access", () => {
  it("does not let PIN-only access open Content Studio", () => {
    expect(canOpenInternalTool("content-studio", false, false, true)).toBe(false);
  });

  it("does not let an authenticated user without content_admin open Content Studio", () => {
    expect(canOpenInternalTool("content-studio", true, false, false)).toBe(false);
  });

  it("allows only content_admin to open Content Studio", () => {
    expect(canOpenInternalTool("content-studio", true, true, false)).toBe(true);
  });

  it("keeps authenticated access to Carousel without content_admin", () => {
    expect(canOpenInternalTool("carousel", true, false, false)).toBe(true);
  });

  it("keeps PIN access available for Carousel without a session", () => {
    expect(canOpenInternalTool("carousel", false, false, true)).toBe(true);
  });
});
