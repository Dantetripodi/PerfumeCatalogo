import { describe, expect, it } from "vitest";
import { canOpenInternalTool } from "./useInternalTools";

describe("internal tool access", () => {
  it("does not let PIN-only access open Content Studio", () => {
    expect(canOpenInternalTool("content-studio", false, true)).toBe(false);
  });

  it("allows an authenticated admin session to open Content Studio", () => {
    expect(canOpenInternalTool("content-studio", true, false)).toBe(true);
  });

  it("keeps PIN access available for Carousel", () => {
    expect(canOpenInternalTool("carousel", false, true)).toBe(true);
  });
});
