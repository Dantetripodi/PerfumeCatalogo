import { describe, expect, it } from "vitest";
import {
  generateContentPack,
  normalizeReel,
  normalizeStories,
} from "./contentPackGenerators";
import { generateReelScript } from "./templates/reel";
import { generateInstagramCaption } from "./templates/instagram";
import { generateImagePrompt } from "./templates/imagePrompt";
import { generateInstagramStory } from "./templates/stories";
import { truncateText } from "./templates/text";
import { DT_BRAND_KIT } from "./brandKit";
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

const longPerfumeFixture: Perfume = {
  ...perfumeFixture,
  id: 43,
  name: "Eau de Lumière Edición Especial Extraordinaria de Colección Limitada",
  description:
    "Una fragancia extraordinariamente luminosa, fresca, envolvente y fácil de llevar todos los días durante muchas horas.",
  notes: {
    top: ["bergamota muy fresca y luminosa de Sicilia", "mandarina dulce y chispeante"],
    middle: ["neroli blanco cremoso y jazmín delicado"],
    base: ["almizcle blanco suave y envolvente", "cedro cálido y persistente"],
  },
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

  it("mantiene un tono DT breve, natural y orientado a conversación", () => {
    const pack = generateContentPack(perfumeFixture);

    expect(pack.payload.stories.every((story) => story.text.length <= 72)).toBe(true);
    expect(pack.payload.stories.map((story) => story.text).join(" ")).toMatch(
      /Eau de Lumière|bergamota|¿|escribinos|WhatsApp/i,
    );
    expect(pack.payload.instagramCaption).toMatch(/bergamota|luminos|fresco/i);
    expect(pack.payload.instagramCaption).toMatch(/WhatsApp|mensaje|escribinos|consultá|pedilo/i);
    expect(pack.payload.instagramCaption).not.toMatch(/Familia olfativa|Tamaño:|💰 Solo/);
  });

  it("genera prompts con restricciones visuales de marca y sin sobrecarga de texto", () => {
    const prompt = generateImagePrompt(perfumeFixture);

    expect(prompt).toMatch(/crema|beige|camel|marrón|brown|dorado|gold/i);
    expect(prompt).toMatch(/madera|wood|lino|linen|luz natural|natural light|planta|plant/i);
    expect(prompt).toMatch(/minimal|clean|limpia/i);
    expect(prompt).toMatch(/no text|sin texto|no overlay|sin overlay/i);
    expect(prompt).toContain(`Avoid: ${DT_BRAND_KIT.avoid.join(", ")}.`);
    expect(prompt).toMatch(/superposici[oó]n m[ií]nima|minimal overlap/i);
    expect(prompt).toMatch(/texto abundante|excessive text/i);
  });
});

describe("DT templates", () => {
  it("trunca por palabras sin exceder el límite solicitado", () => {
    expect(truncateText("Notas de bergamota fresca", 20)).toBe("Notas de bergamota…");
  });

  it("mantiene stories en frames breves con saludo, pregunta, producto y CTA", () => {
    const story = generateInstagramStory(perfumeFixture);
    const frames = story.split("\n");

    expect(frames.length).toBeGreaterThanOrEqual(2);
    expect(frames.length).toBeLessThanOrEqual(4);
    expect(frames.join(" ")).toMatch(/hola|¿/i);
    expect(frames.join(" ")).toContain(perfumeFixture.name);
    expect(frames.join(" ")).toMatch(/escribinos|WhatsApp|DM|consultá/i);
    expect(frames.every((frame) => frame.length <= 72)).toBe(true);
    expect(story).not.toMatch(/catálogo|precio|nuevo en|deslizá/i);
  });

  it("expresa el reel con secciones parseables y texto en pantalla conciso", () => {
    const script = generateReelScript(perfumeFixture);
    const reel = normalizeReel(script, generateInstagramCaption(perfumeFixture));

    expect(script).toMatch(/HOOK/i);
    expect(script).toMatch(/CTA/i);
    expect(reel.hook).toMatch(/\S/);
    expect(reel.shots.length).toBeGreaterThanOrEqual(3);
    expect(reel.onScreenText.every((text) => text.length <= 60)).toBe(true);
    expect(reel.cta).toMatch(/WhatsApp|escribinos|mensaje|pedilo/i);
  });

  it("mantiene límites reales con nombres y notas extensos", () => {
    const storyFrames = generateInstagramStory(longPerfumeFixture).split("\n");
    const reel = normalizeReel(
      generateReelScript(longPerfumeFixture),
      "Caption",
    );

    expect(storyFrames.every((frame) => frame.length <= 72)).toBe(true);
    expect(reel.onScreenText.every((text) => text.length <= 60)).toBe(true);
    expect(reel.cta.length).toBeLessThanOrEqual(60);
    expect(reel.onScreenText.some((text) => text.endsWith("…"))).toBe(true);
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

  it("recorta comillas del formato real regular de generateReelScript", () => {
    const reel = normalizeReel(generateReelScript(perfumeFixture), "Caption");

    expect(reel.hook).toBe("Este perfume te va a sorprender");
    expect(reel.onScreenText).toEqual([
      "Este perfume te va a sorprender",
      "Notas: bergamota, mandarina",
      "Calidad premium, precio accesible",
      "WhatsApp en la bio 📲",
    ]);
    expect(reel.cta).toBe("WhatsApp en la bio 📲");
  });

  it("recorta comillas del formato real árabe con Texto animado", () => {
    const arabicPerfume = { ...perfumeFixture, brand: "Arabian Collection", category: "oriental" as const };
    const reel = normalizeReel(generateReelScript(arabicPerfume), "Caption");

    expect(reel.hook).toBe("¿Conocés los perfumes árabes?");
    expect(reel.onScreenText).toContain("Dura más de 8 horas");
    expect(reel.onScreenText).toContain("Escribinos al WhatsApp 👇");
    expect(reel.cta).toBe("Escribinos al WhatsApp 👇");
  });
});
