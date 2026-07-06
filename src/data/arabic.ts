import { PerfumeInput } from "../types";

export const perfumesArabic: PerfumeInput[] = [
  {
    name: "Pure Herbal",
    brand: "Yves Dorgeval",
    price: 85000,
    gender: "unisex",
    category: "oriental",
    size: "100ml",
    image: "/imagenes/perfumes/Pure-Herbal-X.jpg",
    description:
      "Pure Herbal X de Lattafa Perfumes es una fragancia de la familia olfativa para Hombres y Mujeres. Esta fragrancia es nueva. Pure Herbal X se lanzó en 2019",
    notes: {
      top: ["naranja siciliana", "bergamota de Calabria", "limón siciliano"],
      middle: ["frutas"],
      base: ["almizcle blanco", "vainilla de Madagascar ", "ámbar"],
    },
  },
  {
    name: "Clayton",
    brand: "Yves Dorgeval",
    price: 85000,
    gender: "masculino",
    category: "oriental floral",
    size: "120ml",
    image: "/imagenes/perfumes/Clayton-X.jpg",
    description:
      "Layton de Parfums de Marly es una fragancia de la familia olfativa Oriental Floral para Hombres y Mujeres",
    notes: {
      top: ["manzana", "lavanda", "bergamota", "mandarina"],
      middle: ["geranio", "violeta", "jazmín"],
      base: ["vainilla", "cardamomo", "sándalo", "pimienta", "madera de gaiac", "pachulí"],
    },
  },
];
