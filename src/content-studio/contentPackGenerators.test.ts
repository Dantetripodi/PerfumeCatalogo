import { describe, expect, it } from "vitest";
import { generateContentPack } from "./contentPackGenerators";
import type { Perfume } from "../types";

const perfumeFixture: Perfume = {
  id: 42,
  name: "Eau de Lumière",
  brand: "DT Collection",
  price: 18500,
  gender: "unisex",
  category: "cítrico",
  size: "100 ml",
  image: "/images/eau-de-lumiere.jpg",
  description: "Una fragancia luminosa, fresca y fácil de llevar todos los días.",
  notes: {
    top: ["bergamota", "mandarina"],
    middle: ["neroli", "jazmín"],
    base: ["almizcle blanco", "cedro"],
  },
  collection: "regular",
  stock: "by-order",
  tags: ["fresco", "diario"],
  slug: "eau-de-lumiere",
  occasion: "uso diario",
  intensity: "suave",
  longevity: "6 a 8 horas",
};

describe("generateContentPack", () => {
  it("genera un pack manual con stories, reel y hashtags utilizables", () => {
    const pack = generateContentPack(perfumeFixture, "manual");

    expect(pack.reason).toBe("manual");
    expect(pack.productId).toBe(perfumeFixture.id);
    expect(pack.payload.stories.length).toBeGreaterThanOrEqual(2);
    expect(pack.payload.stories.length).toBeLessThanOrEqual(4);
    expect(pack.payload.reel.hook.length).toBeGreaterThan(0);
    expect(pack.payload.reel.shots.length).toBeGreaterThanOrEqual(3);
    expect(pack.payload.hashtags.length).toBeGreaterThan(0);
  });
});
