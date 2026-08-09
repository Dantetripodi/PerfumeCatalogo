/**
 * DTFragancias — One-time migration script
 * ==========================================
 * Loads the static perfume catalog into Supabase:
 *   • table `perfumes`   — all 55 products
 *   • bucket `perfume-images` — local image files uploaded as Storage objects
 *
 * Idempotency:
 *   Run against an empty table:       npm run migrate
 *   Wipe + redo against a full table: MIGRATE_FORCE=true npm run migrate
 *
 * Required env (in .env.local):
 *   SUPABASE_URL            — your project URL   (or VITE_SUPABASE_URL as fallback)
 *   SUPABASE_SERVICE_ROLE_KEY — secret service-role key (bypasses RLS — keep it secret!)
 *
 * Where to find the service-role key:
 *   Supabase dashboard → Settings → API → "service_role" (secret) key
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types (inline — avoids pulling in Vite-specific src/ module resolution)
// ---------------------------------------------------------------------------

interface Notes {
  top: string[];
  middle: string[];
  base: string[];
}

type PerfumeCollection = "regular" | "mini" | "accesorio" | "arabe" | "arabic";

interface PerfumeInput {
  name: string;
  brand: string;
  price: number | "Consultar";
  gender: "masculino" | "femenino" | "unisex";
  category: string;
  size: string;
  image: string;
  description: string;
  notes: Notes;
}

interface PerfumeRow {
  name: string;
  brand: string;
  price: number | null;
  gender: "masculino" | "femenino" | "unisex";
  category: string;
  size: string;
  image_url: string;
  description: string;
  notes: Notes;
  collection: PerfumeCollection;
  is_featured: boolean;
}

// ---------------------------------------------------------------------------
// 1. Config / env
// ---------------------------------------------------------------------------

dotenv.config({ path: ".env.local" });

const supabaseUrl =
  process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const forceMode = process.env["MIGRATE_FORCE"] === "true";

if (!supabaseUrl) {
  console.error(
    "\n[migrate] ERROR: SUPABASE_URL (or VITE_SUPABASE_URL) is not set in .env.local.\n" +
      "  Add: SUPABASE_URL=https://<your-project-ref>.supabase.co\n"
  );
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error(
    "\n[migrate] ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.\n" +
      "  Find it in: Supabase dashboard → Settings → API → service_role (secret)\n" +
      "  Add:  SUPABASE_SERVICE_ROLE_KEY=eyJ...\n" +
      "  IMPORTANT: Remove it from .env.local after migration (never commit it).\n"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Supabase client (service-role — bypasses RLS)
// ---------------------------------------------------------------------------

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// 3. Source data  (inline copies — avoids Vite/browser imports)
// ---------------------------------------------------------------------------
// These mirror src/data/*.ts exactly; kept separate so tsx can run them
// in Node without Vite's module resolution.

const perfumesRegulares: PerfumeInput[] = [
  { name: "Victorious ONYX", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "cítrico", size: "100ml", image: "/imagenes/perfumes/invictus-onyx.jpg", description: "Un perfume que con sus notas marinas, pomelo y mandarina en la salida, jazmín y laureles en el corazón y, ámbar gris, pachulí, madera de gaiac y musgo en el fondo componen el aroma de la victoria.", notes: { top: ["Pomelo", "marinas", "mandarina"], middle: ["laureles", "jazmín"], base: ["ámbar gris", "pachulí", "madera de gaiac", "musgo"] } },
  { name: "YD12 Men", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/212-men-hombres.jpg", description: "Inspirado en 212 Men de Carolina Herrera. Una fragancia fresca y urbana con notas verdes, amaderadas y especiadas. Ideal para hombres modernos y sofisticados.", notes: { top: ["Pomelo", "Bergamota", "Verde Hoja"], middle: ["Pimienta", "Jengibre", "Gardenia"], base: ["Sándalo", "Incienso", "Almizcle"] } },
  { name: "212-Vip Black", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/212-vipBlack-hombres.jpg", description: "Inspirado en 212 VIP Black de Carolina Herrera. Una fragancia intensa y seductora con anis y hinojo en salida, corazón de lavanda y fondo de vainilla negra y almizcle.", notes: { top: ["Anis", "Hinojo"], middle: ["Lavanda"], base: ["Vainilla negra", "Almizcle"] } },
  { name: "212-Vip Night Club Men", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/212-vipNighClub-hombres.jpg", description: "Inspirado en 212 VIP Night Club Men de Carolina Herrera. Notas de salida cítricas y acuáticas, corazón especiado y fondo achocolatado.", notes: { top: ["Lima", "Notas acuosas", "Caviar"], middle: ["Nuez moscada", "Notas amaderadas", "Pimienta"], base: ["Chocolate", "Notas amaderadas"] } },
  { name: "Acqua Di Gio", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "cítrico", size: "100ml", image: "/imagenes/perfumes/Acquadi-men-hombres.jpg", description: "Inspirado en Acqua Di Gio de Giorgio Armani. Fresca y marina con limón, bergamota y notas marinas, corazón floral y fondo amaderado.", notes: { top: ["Lima", "Limón", "Bergamota", "Neroli"], middle: ["Notas marinas", "Jazmín", "Romero"], base: ["Almizcle blanco", "Cedro", "Ámbar"] } },
  { name: "Amor Amor Cacharel", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/AmorAmor-women-mujeres.jpg", description: "Inspirado en Amor Amor de Cacharel. Frutal y gourmand con grosella negra, rosa y fondo de vainilla y almizcle.", notes: { top: ["Grosella negra", "Naranja", "Pomelo"], middle: ["Rosa", "Jazmín", "Azucena"], base: ["Vainilla", "Haba tonka", "Almizcle"] } },
  { name: "Armani Code", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/ArmaniCode-hombres.jpg", description: "Inspirado en Armani Code de Giorgio Armani. Elegante y sofisticado con bergamota, flor de olivo y fondo de cuero y tabaco.", notes: { top: ["Limón", "Bergamota"], middle: ["Anís estrellado", "Flor de olivo"], base: ["Cuero", "Haba tonka", "Tabaco"] } },
  { name: "Bad Boy Cobalt", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "frutal", size: "100ml", image: "/imagenes/perfumes/badboy-cobalt-hombres.jpg", description: "Inspirado en Bad Boy de Carolina Herrera. Dinámico y audaz con pimienta rosa y vetiver.", notes: { top: ["Pimienta rosa", "Lavanda"], middle: ["Geranio", "Ciruela negra"], base: ["Vetiver"] } },
  { name: "Bad Boy", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/badboy-hombres.jpg", description: "Inspirado en Bad Boy de Carolina Herrera. Con pimienta, salvia y fondo cálido de haba tonka.", notes: { top: ["Pimienta blanca", "Pimienta negra", "Bergamota"], middle: ["Salvia", "Cedro"], base: ["Haba tonka", "Cacao", "Amberwood"] } },
  { name: "Black XS L'Aphrodisiaque", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/blackXS-afro-hombres.jpg", description: "Inspirado en Black XS de Paco Rabanne. Cálido y exótico con canela, miel y cuero.", notes: { top: ["Canela", "Azafrán"], middle: ["Miel", "Ciprés"], base: ["Praliné", "Cuero", "Almendra"] } },
  { name: "CH Women", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/Ch-women-mujeres.jpg", description: "Inspirado en CH Woman de Carolina Herrera. Floral y suave con praliné, rosa y fondo de sándalo.", notes: { top: ["Frutas tropicales", "Bergamota", "Pomelo"], middle: ["Praliné", "Flor de naranja africana", "Jazmín"], base: ["Sándalo", "Ámbar", "Cedro"] } },
  { name: "Eve EDP", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/EveParfum-mujeres.jpg", description: "Inspirado en Olympea EDP de Paco Rabanne. Dulce y seductor con jazmín, vainilla y sándalo.", notes: { top: ["Mango"], middle: ["Jazmín"], base: ["Vainilla", "Sándalo"] } },
  { name: "Givenchy Very Irresistible Sensual", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/Givenchy-women-mujeres.jpg", description: "Inspirado en Very Irrésistible de Givenchy. Femme con peonía, rosa y fondo de vainilla.", notes: { top: ["Peonía"], middle: ["Rosa"], base: ["Pachulí", "Vainilla"] } },
  { name: "Good Girl", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/Good-Girl-women-mujeres.jpg", description: "Inspirado en Good Girl de Carolina Herrera. Alterna lo dulce y lo oscuro con almendra, jazmín y cacao.", notes: { top: ["Almendra", "Café"], middle: ["Jazmín sambac", "Azahar"], base: ["Haba tonka", "Cacao"] } },
  { name: "Halloween Women", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/Halloween-women-mujeres.jpg", description: "Inspirado en Halloween Women de Jesús del Pozo. Misteriosa con violeta, tuberosa y fondo de mirra.", notes: { top: ["Violeta", "Petitgrain"], middle: ["Magnolia", "Tuberosa"], base: ["Incienso", "Mirra"] } },
  { name: "Hugo Boss Just Different", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/HugoBoss-hombres.jpg", description: "Inspirado en Boss Bottled de Hugo Boss. Fresco con menta y manzana, fondo especiado y amaderado.", notes: { top: ["Menta", "Manzana Granny Smith"], middle: ["Albahaca", "Cilantro"], base: ["Cachemira", "Tabaco"] } },
  { name: "L'Interdit", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/L-interdit-women-mujeres.jpg", description: "Inspirado en L'Interdit de Givenchy. Elegante con pera, jazmín y fondo de vetiver.", notes: { top: ["Pera", "Bergamota"], middle: ["Jazmín sambac", "Azahar"], base: ["Pachulí", "Vetiver"] } },
  { name: "La Vida Es Bella", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/LaVidaEsBella-women-mujeres.jpg", description: "Inspirado en La Vie Est Belle de Lancôme. Dulce con grosella negra, iris y fondo de haba tonka.", notes: { top: ["Grosella negra", "Pera"], middle: ["Iris", "Jazmín"], base: ["Haba tonka", "Praliné"] } },
  { name: "My Way", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/My-way-women-mujeres.jpg", description: "Inspirado en My Way de Giorgio Armani. Brillante con flor de azahar, bergamota y fondo de cedro.", notes: { top: ["Bergamota", "Azahar"], middle: ["Jazmín"], base: ["Cedro"] } },
  { name: "Nina Ricci", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "frutal", size: "100ml", image: "/imagenes/perfumes/NinaRicci-women-mujeres.jpg", description: "Inspirado en Nina Ricci. Fresco y joven con limón, manzana y fondo suave amaderado.", notes: { top: ["Limón", "Lima de Amalfi"], middle: ["Manzana Granny Smith", "Peonía"], base: ["Almizcle", "Cedro"] } },
  { name: "Phantom Black Parfum", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/Phantom-black-hombres.jpg", description: "Inspirado en Phantom de Paco Rabanne. Moderno y enérgico con bergamota, lavanda y fondo de vetiver.", notes: { top: ["Bergamota", "Limón"], middle: ["Lavanda", "Geranio"], base: ["Haba de vainilla", "Vetiver"] } },
  { name: "Phantom", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/Phantom-hombres.jpg", description: "Inspirado en Phantom de Paco Rabanne. Fresco con lavanda, pimienta y fondo amaderado.", notes: { top: ["Lavanda", "Limón de Amalfi"], middle: ["Pachulí", "Pimienta rosa"], base: ["Vainilla"] } },
  { name: "Polo Blue EDT", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "acuático", size: "100ml", image: "/imagenes/perfumes/poloBlue-hombres.jpg", description: "Inspirado en Polo Blue EDT de Ralph Lauren. Refrescante con pepino, melón y fondo amaderado.", notes: { top: ["Pepino", "Melón", "Mandarina"], middle: ["Salvia", "Geranio"], base: ["Gamuza", "Almizcle"] } },
  { name: "Sauvage Dior", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/Sauvage-men-hombres.jpg", description: "Inspirado en Sauvage de Dior. Vibrante con bergamota de Calabria, pimienta y fondo ahumado.", notes: { top: ["Bergamota de Calabria", "Pimienta"], middle: ["Lavanda", "Vetiver"], base: ["Cedro", "Ambroxan"] } },
  { name: "Scandal Pour Homme", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/Scandal-men-hombres.jpg", description: "Inspirado en Scandal Pour Homme de Jean Paul Gaultier. Atrevido con caramelo, vetiver y salvia esclarea.", notes: { top: ["Caramelo"], middle: ["Vetiver", "Salvia esclarea"], base: [] } },
  { name: "Scandal Absolut", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/Scandal-absolut-men.png", description: "Inspirado en Scandal Absolut de Jean Paul Gaultier. Atrevido y sensual con ciruela maribel, castaña y sandalo.", notes: { top: ["Ciruela Maribel"], middle: ["Castaña"], base: ["Sandalo"] } },
  { name: "Tom Ford - Oud Wood", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/Tomford-hombres.jpg", description: "Inspirado en Oud Wood de Tom Ford. Rico y exótico con madera de oud, sándalo y haba tonka.", notes: { top: ["Madera de oud", "Cardamomo"], middle: ["Pimienta de Sichuan", "Sándalo"], base: ["Haba tonka", "Ámbar"] } },
  { name: "212 Vip Rose", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/212-VipRose-mujer.jpg", description: "Inspirado en 212 VIP Rosé de Carolina Herrera. Sofisticado con champán, notas afrutadas y fondo almizclado.", notes: { top: ["Champán", "Notas afrutadas"], middle: ["Peach Blossom"], base: ["Almizcle blanco", "Ámbar"] } },
  { name: "Scandal Le Parfum Intense", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/Scandal-Le-Parfum-Intense-mujer.jpg", description: "Inspirado en Scandal Le Parfum Intense de Jean Paul Gaultier. Intenso con tuberosa y jazmín.", notes: { top: [], middle: ["Tuberosa", "Jazmín"], base: [] } },
  { name: "Olimpea Intense", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/Olimpea-Intense-mujer.jpg", description: "Inspirado en Olympea Intense de Paco Rabanne. Cálido con jazmín de agua, vainilla y ámbar gris.", notes: { top: ["Mandarina verde", "Jazmín de agua"], middle: ["Vainilla", "Sal"], base: ["Ámbar gris", "Sándalo"] } },
  { name: "212-Sexy Fem", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/perfumes/212-sexyFem-mujer.jpg", description: "Inspirado en 212 Sexy de Carolina Herrera. Jugoso con pimienta rosa, gardenia y fondo dulce.", notes: { top: ["Pimienta rosa", "Mandarina"], middle: ["Gardenia", "Pelargonio"], base: ["Vainilla", "Ámbar"] } },
  { name: "Miss Millionaire Fabulous", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/millionaire.jpg", description: "Inspirado en Lady Million de Paco Rabanne. Dulce y caramelizado con jazmín y haba tonka.", notes: { top: ["Mandarina", "Pimienta rosa"], middle: ["Jazmín"], base: ["Haba tonka", "Musgo"] } },
  { name: "Bella Leclat", brand: "Yves Dorgeval", price: 60000, gender: "femenino", category: "frutal", size: "100ml", image: "/imagenes/perfumes/Bella-Leclat-100ml.jpg", description: "Inspirado en LeClat de Paco Rabanne. Brillante con mandarina, jazmín y fondo suave.", notes: { top: ["Mandarina"], middle: ["Jazmín"], base: ["Vainilla"] } },
  { name: "One Million", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "oriental", size: "100ml", image: "/imagenes/perfumes/One-Million-Hombre.jpg", description: "Inspirado en One Million de Paco Rabanne. Especiado con mandarina roja, canela y fondo amaderado.", notes: { top: ["Mandarina roja", "Pomelo"], middle: ["Canela", "Rosa"], base: ["Ámbar", "Cuero"] } },
  { name: "CH men prive", brand: "Yves Dorgeval", price: 60000, gender: "masculino", category: "amaderado", size: "100ml", image: "/imagenes/perfumes/ch-prive.png", description: "Inspirado en CH Men Prive de Carolina Herrera..", notes: { top: ["Whisky", "Toronja"], middle: ["Cardamomo", "Lavanda", "Salvia", "Tomillo rojo"], base: ["Cuero", "Haba tonka", "Almizcle"] } },
];

const perfumesArabes: PerfumeInput[] = [
  { name: "9pm", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "oriental", size: "100ML", image: "/imagenes/arabes/9PM.jpg", description: "Es una fragancia masculina muy popular, conocida por su aroma dulce, especiado y ambarado, ideal para la noche o climas fríos", notes: { top: ["manzana", "canela", "lavanda silvestre", "bergamota"], middle: ["flor de azahar", " lirio"], base: ["vainilla", "haba tonka", "ambar", "pachuli"] } },
  { name: "Asad Lattafa", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "oriental", size: "100ML", image: "/imagenes/arabes/Asad-Lattafa.jpg", description: "Asad de Lattafa Perfumes es una fragancia de la familia olfativa Oriental para Hombre", notes: { top: ["Pimienta ngera", "Tabaco", "piña"], middle: ["Pachuli", "Cafe", "Iris"], base: ["Vainilla", "Madera seca", "Ambar"] } },
  { name: "Bharara King", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "aromatica", size: "100ML", image: "/imagenes/arabes/bhararaKing.jpg", description: "King de Bharara es una fragancia de la familia olfativa Aromática para Hombres", notes: { top: ["Naranja ", "Limón ", "Bergamota"], middle: ["Notas afrutadas"], base: ["Vainilla", "Almizcleblanco", "Ambar"] } },
  { name: "Al Haramain Amber Oud", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "amaderado", size: "100ML", image: "/imagenes/arabes/Haramain-AmberOud.jpg", description: "Amber Oud de Al Haramain Perfumes es una fragancia de la familia olfativa Oriental Amaderada para Hombres y Mujeres", notes: { top: ["Romero ", "Cedro", "Bergamota", "Limon"], middle: ["especies", "madera degaiac"], base: ["Resinas", "Ambar", "Almizcle"] } },
  { name: "Yara Moi Lattafa", brand: "Yves Dorgeval", price: "Consultar", gender: "femenino", category: "cítrico", size: "100ml", image: "/imagenes/arabes/Yara-Moi-Lattafa.jpg", description: "Una fragancia fresca y floral con notas de jazmín, durazno, caramelo y ámbar.", notes: { top: ["Jazmín", "Durazno (melocotón)"], middle: ["Caramelo", "Ámbar"], base: ["Pachulí", "Sándalo"] } },
  { name: "Yara Pink Lattafa", brand: "Yves Dorgeval", price: "Consultar", gender: "femenino", category: "ambar", size: "100ml", image: "/imagenes/arabes/Yara-Lattafa.jpg", description: "Yara de Lattafa es una fragancia de la familia olfativa Ámbar Vainilla para Mujeres.", notes: { top: ["Orquídea", "Heliotropo", "Naranja tangerina"], middle: ["Acuerdo goloso", "Frutas tropicales"], base: ["Vainilla", "Almizcle", "Sándalo"] } },
  { name: "Yara Tous Lattafa", brand: "Yves Dorgeval", price: "Consultar", gender: "femenino", category: "oriental", size: "100ml", image: "/imagenes/arabes/Yara-Amarrillo-Lattafa.jpg", description: "Yara Tous de Lattafa es una fragancia cautivadora y exótica gracias a una armoniosa combinación de notas olfativas", notes: { top: ["Mango", "Coco", "Maracuyá (fruta de la pasión)"], middle: ["Jazmín", "Flor de azahar del naranjo", "Heliotropo"], base: ["Vainilla", "Almizcle", "Cachemira"] } },
  { name: "Haya de Lattafa", brand: "Yves Dorgeval", price: "Consultar", gender: "femenino", category: "floral", size: "100ml", image: "/imagenes/arabes/Haya-Lattafa.jpg", description: "Haya de Lattafa es una fragancia floral y afrutada que evoca la frescura y la elegancia.", notes: { top: ["Champaña", "Fresa", "naranja tangerina", "naranja sanguina y rosa"], middle: ["Gardenia", "Gardenia", "orquídea de vainilla"], base: ["Ambar", "castaña", "Sándalo"] } },
  { name: "Odyssey Mandarin Sky", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "floral", size: "100ml", image: "/imagenes/arabes/odysseyMandarinSky.jpg", description: "Odyssey Mandarin Sky de Armaf es una fragancia cautivadora de la familia olfativa para hombres, lanzada en 2023", notes: { top: ["mandarina", "naranja", "azafrán", "salvia"], middle: ["caramelo", "haba tonka", "cempasúchil"], base: ["vetiver", "ambroxan", "cedro brindan"] } },
  { name: "Armaf Club de Nuit Intense", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "amaderado especiado", size: "105ml", image: "/imagenes/arabes/ClubdeNuit.jpg", description: "Club de Nuit Intense Man de Armaf es mucho más que una fragancia: es una declaración de estilo, misterio y presencia.", notes: { top: ["Limón chispeante.", "piña jugosa", "bergamota vibrante", "grosella negra"], middle: ["Abedul ahumado", "jazmín refinado", " rosa elegante"], base: ["Almizcle sensual", "ámbar cálido", "pachulí terroso", "vainilla cremosa"] } },
  { name: "Honor & Glory", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "amaderada dulce", size: "100ml", image: "/imagenes/arabes/HonorAndGlory.jpg", description: "Bade'e Al Oud Honor & Glory de Lattafa Perfumes es una fragancia de la familia olfativa para Hombres y Mujeres.", notes: { top: ["Piña", "Créme bruléea"], middle: ["canela", "cúrcuma ", "pimienta negra", "Benjuí"], base: ["vainilla", "sándalo", "cachemira ", "musgo"] } },
  { name: "Khamrah Qahwa Lattafa", brand: "Yves Dorgeval", price: "Consultar", gender: "masculino", category: "amaderada dulce", size: "100ml", image: "/imagenes/arabes/Khamrah-Qahwa.jpg", description: "Khamrah Qahwa de Lattafa Perfumes es una fragancia de la familia olfativa Oriental Vainilla para Hombres y Mujeres.", notes: { top: ["canela", "Cardamomo", "jengibre"], middle: ["praliné", "Frutas confitadas", "flores blancas"], base: ["vainilla", "Cafe", "Haba tonka", "benjuí", "almizcle"] } },
];

const perfumesArabic: PerfumeInput[] = [
  { name: "Pure Herbal", brand: "Yves Dorgeval", price: 85000, gender: "unisex", category: "oriental", size: "100ml", image: "/imagenes/perfumes/Pure-Herbal-X.jpg", description: "Pure Herbal X de Lattafa Perfumes es una fragancia de la familia olfativa para Hombres y Mujeres.", notes: { top: ["naranja siciliana", "bergamota de Calabria", "limón siciliano"], middle: ["frutas"], base: ["almizcle blanco", "vainilla de Madagascar ", "ámbar"] } },
  { name: "Clayton", brand: "Yves Dorgeval", price: 85000, gender: "masculino", category: "oriental floral", size: "120ml", image: "/imagenes/perfumes/Clayton-X.jpg", description: "Layton de Parfums de Marly es una fragancia de la familia olfativa Oriental Floral para Hombres y Mujeres", notes: { top: ["manzana", "lavanda", "bergamota", "mandarina"], middle: ["geranio", "violeta", "jazmín"], base: ["vainilla", "cardamomo", "sándalo", "pimienta", "madera de gaiac", "pachulí"] } },
];

const perfumesMinis: PerfumeInput[] = [
  { name: "Badboy Mini", brand: "Yves Dorgeval", price: 18000, gender: "femenino", category: "amaderado", size: "50ml", image: "/imagenes/minis/Badboy-50ml.jpg", description: "Versión mini de Bad Boy. Especiada con cacao, pimienta y bergamota.", notes: { top: ["Cacao", "Bergamota"], middle: ["Pimienta negra", "Salvia"], base: [] } },
  { name: "Sauvage Mini", brand: "Yves Dorgeval", price: 18000, gender: "masculino", category: "amaderado", size: "50ml", image: "/imagenes/minis/sauvage-50ml.jpg", description: "Miniatura de Sauvage. Fresco con bergamota, lavanda y vetiver.", notes: { top: ["Bergamota"], middle: ["Lavanda"], base: ["Vetiver"] } },
  { name: "Invictus Mini", brand: "Yves Dorgeval", price: 18000, gender: "masculino", category: "acuático", size: "50ml", image: "/imagenes/minis/invictus-50ml.jpg", description: "Miniatura de Invictus. Refrescante con notas marinas, cítricos y maderas.", notes: { top: ["Notas marinas", "Cítricos"], middle: [], base: [] } },
  { name: "12Heroes Mini", brand: "Yves Dorgeval", price: 18000, gender: "masculino", category: "amaderado", size: "50ml", image: "/imagenes/minis/12HeroesMen-50ml.jpg", description: "Miniatura inspirada en 212 Heroes Men. Con pera, jengibre y fondo almizclado.", notes: { top: ["Pera", "Jengibre"], middle: ["Geranio", "Salvia"], base: ["Almizcle"] } },
  { name: "Stronger with you", brand: "Yves Dorgeval", price: 18000, gender: "masculino", category: "vainilla dulce", size: "50ml", image: "/imagenes/minis/Stronger-with-you.png", description: "Versión mini de Stronger with you. Especiada Castaña, Azúcar, Salvia, Lavanda, Vainilla Y Humo..", notes: { top: ["Castaña", "Azucar"], middle: ["Salvia", "Lavanda"], base: ["Vainilla", "Humo"] } },
];

const otrosProductos: PerfumeInput[] = [
  { name: "Perfumero recargable", brand: "Otros", price: 6000, gender: "unisex", category: "perfumeria", size: "5ml", image: "/imagenes/perfumes/perfumeroRecargable.jpg", description: "Hoy te presentamos La mini botella atomizadora de perfume, es lo suficientemente pequeña y ligera para meterla en el bolsillo o en el bolso, haciendo que disfrutes de una fragancia maravillosa en cada momento.Cuando asista a una fiesta, pasa tiempo en vacaciones o en un viaje de negocios, es una gran herramienta para mantenerte oliendo fresco y darte confianza.Botella pequeña recargable de Perfume de 5ML, atomizador de aluminio portátil, botella de Perfume de repuesto para viaje.IMPORTANTE(el producto se vende sin contenido en su interior)", notes: { top: ["", ""], middle: ["", ""], base: [""] } },
];

// ---------------------------------------------------------------------------
// 4. Collection mapping
// ---------------------------------------------------------------------------

const COLLECTIONS: Array<{ items: PerfumeInput[]; collection: PerfumeCollection }> = [
  { items: perfumesRegulares, collection: "regular" },
  { items: perfumesArabes,    collection: "arabe" },
  { items: perfumesArabic,    collection: "arabic" },
  { items: perfumesMinis,     collection: "mini" },
  { items: otrosProductos,    collection: "accesorio" },
];

const EXPECTED_COUNTS: Record<PerfumeCollection, number> = {
  regular:   35,
  arabe:     12,
  arabic:     2,
  mini:       5,
  accesorio:  1,
};

// ---------------------------------------------------------------------------
// 5. Helpers
// ---------------------------------------------------------------------------

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

async function resolveImageUrl(
  imagePath: string,
  collection: PerfumeCollection,
  missingWarnings: string[]
): Promise<string> {
  // Remote URLs — use as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Local file path (e.g. "/imagenes/perfumes/x.jpg")
  const localPath = path.join(PROJECT_ROOT, "public", imagePath);
  const basename = path.basename(imagePath);
  const storageKey = `perfumes/${collection}/${basename}`;

  if (!fs.existsSync(localPath)) {
    missingWarnings.push(`  MISSING: ${imagePath} (expected at ${localPath})`);
    // Fall back to original string so image_url is NOT NULL
    return imagePath;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const contentType = getContentType(basename);

  const { error: uploadError } = await supabase.storage
    .from("perfume-images")
    .upload(storageKey, fileBuffer, { contentType, upsert: true });

  if (uploadError) {
    console.warn(`  [upload warn] ${storageKey}: ${uploadError.message}`);
    // Fall back to original string so the row is still valid
    return imagePath;
  }

  const { data } = supabase.storage
    .from("perfume-images")
    .getPublicUrl(storageKey);

  return data.publicUrl;
}

function buildRow(
  item: PerfumeInput,
  collection: PerfumeCollection,
  imageUrl: string
): PerfumeRow {
  const isFeatured = collection === "arabe" || collection === "arabic";

  return {
    name:        item.name.replace(/\s+/g, " ").trim(),
    brand:       item.brand,
    price:       item.price === "Consultar" ? null : Number(item.price),
    gender:      item.gender,
    category:    item.category,
    size:        item.size,
    image_url:   imageUrl,
    description: item.description.replace(/\s+/g, " ").trim(),
    notes:       item.notes,
    collection,
    is_featured: isFeatured,
  };
}

// ---------------------------------------------------------------------------
// 6. Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n=== DTFragancias → Supabase migration ===\n");

  // 3. Safety guard
  const { count, error: countError } = await supabase
    .from("perfumes")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("[migrate] Failed to query existing rows:", countError.message);
    process.exit(1);
  }

  if (count !== null && count > 0) {
    if (!forceMode) {
      console.error(
        `[migrate] Table 'perfumes' already has ${count} rows.\n` +
          "  Aborting to prevent duplicate data.\n" +
          "  To wipe and re-run: set MIGRATE_FORCE=true in .env.local, then run again.\n"
      );
      process.exit(1);
    }

    console.log(`[migrate] MIGRATE_FORCE=true — deleting ${count} existing rows…`);
    const { error: deleteError } = await supabase
      .from("perfumes")
      .delete()
      .gte("id", 0); // delete all rows

    if (deleteError) {
      console.error("[migrate] Failed to delete rows:", deleteError.message);
      process.exit(1);
    }
    console.log("[migrate] Existing rows deleted.\n");
  } else {
    console.log("[migrate] Table is empty — proceeding with fresh migration.\n");
  }

  const missingWarnings: string[] = [];
  let insertedCount = 0;
  const insertErrors: string[] = [];

  // 5. Per perfume: upload image + insert row
  for (const { items, collection } of COLLECTIONS) {
    console.log(`[migrate] Processing collection '${collection}' (${items.length} items)…`);

    for (const item of items) {
      const imageUrl = await resolveImageUrl(item.image, collection, missingWarnings);
      const row = buildRow(item, collection, imageUrl);

      const { error: insertError } = await supabase.from("perfumes").insert(row);

      if (insertError) {
        const msg = `  ERROR inserting '${item.name}' (${collection}): ${insertError.message}`;
        console.error(msg);
        insertErrors.push(msg);
      } else {
        insertedCount++;
        process.stdout.write(`  ✓ ${item.name}\n`);
      }
    }
  }

  // 6. Verify
  console.log("\n=== Verification ===\n");

  const { data: allRows, error: verifyError } = await supabase
    .from("perfumes")
    .select("collection, image_url");

  if (verifyError) {
    console.error("[migrate] Verification query failed:", verifyError.message);
    process.exit(1);
  }

  const rows = allRows ?? [];
  const countsByCollection: Partial<Record<PerfumeCollection, number>> = {};
  let nullImageCount = 0;

  for (const row of rows) {
    const col = row.collection as PerfumeCollection;
    countsByCollection[col] = (countsByCollection[col] ?? 0) + 1;
    if (!row.image_url) nullImageCount++;
  }

  let allGood = true;

  for (const [col, expected] of Object.entries(EXPECTED_COUNTS) as Array<[PerfumeCollection, number]>) {
    const actual = countsByCollection[col] ?? 0;
    const ok = actual === expected;
    if (!ok) allGood = false;
    console.log(`  ${ok ? "✓" : "✗"} ${col.padEnd(12)} expected ${expected}, got ${actual}`);
  }

  const totalExpected = Object.values(EXPECTED_COUNTS).reduce((a, b) => a + b, 0);
  const totalActual = rows.length;
  const totalOk = totalActual === totalExpected;
  if (!totalOk) allGood = false;
  console.log(`\n  ${totalOk ? "✓" : "✗"} TOTAL: expected ${totalExpected}, got ${totalActual}`);

  const noNullImages = nullImageCount === 0;
  if (!noNullImages) allGood = false;
  console.log(`  ${noNullImages ? "✓" : "✗"} Rows with null/empty image_url: ${nullImageCount}`);

  if (missingWarnings.length > 0) {
    console.log("\n=== Missing image warnings (rows inserted with fallback image_url) ===");
    for (const w of missingWarnings) console.warn(w);
  }

  if (insertErrors.length > 0) {
    console.log("\n=== Insert errors ===");
    for (const e of insertErrors) console.error(e);
  }

  console.log("\n=== Summary ===");
  console.log(`  Rows inserted: ${insertedCount}`);
  if (allGood && missingWarnings.length === 0 && insertErrors.length === 0) {
    console.log("✅  Migration complete — all 55 rows inserted and verified.\n");
  } else {
    console.log("❌  Migration finished with issues — see warnings/errors above.\n");
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("[migrate] Unexpected error:", err);
  process.exit(1);
});
