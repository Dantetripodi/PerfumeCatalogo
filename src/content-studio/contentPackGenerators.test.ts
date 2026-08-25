import { describe, expect, it } from "vitest";
import {
  generateContentPack,
  normalizeReel,
  normalizeStories,
} from "./contentPackGenerators";
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

describe("normalizeStories", () => {
  it("devuelve una lista vacía para una entrada vacía y conserva frames válidos", () => {
    expect(normalizeStories("   \n")).toEqual([]);
    expect(normalizeStories("Saludo\nProducto\nCTA")).toHaveLength(3);
  });
});

describe("normalizeReel", () => {
  it("devuelve campos vacíos para una entrada vacía", () => {
    expect(normalizeReel("", "Caption")).toEqual({
      hook: "",
      shots: [],
      onScreenText: [],
      cta: "",
      caption: "Caption",
    });
  });

  it("limpia Hook y VO sin dejar dos puntos en el hook", () => {
    const reel = normalizeReel(
      "HOOK\nVO: Hook hablado\n📷 Plano inicial\nCTA\nVO: Pedilo ahora",
      "Caption",
    );

    expect(reel.hook).toBe("Hook hablado");
  });

  it("extrae Texto, Texto animado y Texto en pantalla", () => {
    const reel = normalizeReel(
      "HOOK\nTexto en pantalla: Hook visual\nTexto: Primer dato\nTexto animado: Segundo dato\nCTA\nTexto: Escribinos",
      "Caption",
    );

    expect(reel.onScreenText).toEqual([
      "Hook visual",
      "Primer dato",
      "Segundo dato",
      "Escribinos",
    ]);
  });

  it("toma sólo el contenido textual del CTA y no mezcla plano ni VO posteriores", () => {
    const reel = normalizeReel(
      "HOOK\nTexto: Hook\nCTA\n📷 Logo DT\nTexto animado: Escribinos al WhatsApp\nVO: Pedilo ahora",
      "Caption",
    );

    expect(reel.cta).toBe("Escribinos al WhatsApp");
  });

  it("soporta el formato actual del template con shots y labels variados", () => {
    const reel = normalizeReel(
      "[0–3s] HOOK\n📷 Plano detalle\nTexto en pantalla: Este perfume sorprende\n[3–8s] PRESENTACIÓN\n📷 Frasco completo\nVO: Presentación\n[8–18s] DESCRIPCIÓN\n📷 Ambiente\nTexto: Notas frescas\n[26–30s] CTA\n📷 Logo\nTexto: WhatsApp en la bio 📲\nVO: Hacé tu pedido hoy",
      "Caption",
    );

    expect(reel.hook).toBe("Este perfume sorprende");
    expect(reel.shots).toHaveLength(4);
    expect(reel.onScreenText).toContain("Notas frescas");
    expect(reel.cta).toBe("WhatsApp en la bio 📲");
  });
});
