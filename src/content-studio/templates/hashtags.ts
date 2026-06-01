import { Perfume, PerfumeCategory } from "../../types";

// ─── Hashtags por categoría, género y contexto ───────────────────────────────

const BASE_TAGS = [
  "#dtfragancias",
  "#perfumes",
  "#perfumesargentina",
  "#fragancias",
  "#perfumeargentino",
  "#catalogodeperfumes",
];

const GENDER_TAGS: Record<"masculino" | "femenino" | "unisex", string[]> = {
  masculino: [
    "#perfumesmasculinos",
    "#perfumehombre",
    "#fraganciasmasculinas",
    "#hombrederecho",
    "#perfumeformen",
  ],
  femenino: [
    "#perfumesfemeninos",
    "#perfumemujer",
    "#fraganciasmujer",
    "#fraganciafemenina",
    "#mujereselegantes",
  ],
  unisex: [
    "#perfumeunisex",
    "#fraganciaunisex",
    "#perfumeparatodos",
    "#unisexfragrance",
    "#generolibre",
  ],
};

const CATEGORY_TAGS: Partial<Record<PerfumeCategory, string[]>> = {
  oriental: ["#perfumeoriental", "#oud", "#ambar", "#aromaoriental", "#perfumearabe"],
  amaderado: ["#perfumeamaderado", "#madera", "#woodyfragrance", "#sillage"],
  floral: ["#perfumefloral", "#floralscent", "#florales", "#perfumedeflores"],
  cítrico: ["#perfumecitrico", "#citrus", "#frescura", "#freshscent"],
  acuático: ["#perfumeacuatico", "#freshwater", "#oceano", "#aromafresco"],
  frutal: ["#perfumefrutal", "#frutalscent", "#frutales", "#dulce"],
  "amaderado especiado": ["#especiado", "#spicy", "#amaderadoespeciado", "#woodspice"],
  "oriental especiado": ["#orientalespeciado", "#oud", "#intense", "#musk"],
  aromatica: ["#aromatico", "#herbaceo", "#aromatic", "#classic"],
};

const OCCASION_TAGS = ["#perfumespremium", "#regaloperfecto", "#olerrico", "#sillage", "#perfumeduradero"];

export function generateHashtags(perfume: Perfume): string[] {
  const categoryTags = CATEGORY_TAGS[perfume.category] ?? ["#aromaexclusivo", "#fraganciaunica"];
  const genderTags = GENDER_TAGS[perfume.gender];

  const all = [
    ...BASE_TAGS,
    ...genderTags,
    ...categoryTags,
    ...OCCASION_TAGS,
  ];

  // Deduplicate and limit to 20
  return [...new Set(all)].slice(0, 20);
}
