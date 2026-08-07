# DTFragancias — Guía de Proyecto para Claude

## ¿Qué es este proyecto?

DTFragancias es un catálogo web de perfumes que funciona como herramienta de ventas y generación de contenido para Instagram/WhatsApp. Está desplegado en Vercel y opera como frontend estático.

- **Web**: https://dtfragancias-catalogo.vercel.app/
- **Repo**: https://github.com/Dantetripodi/PerfumeCatalogo
- **Instagram**: @dt_fragancias

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Íconos | lucide-react |
| Deploy | Vercel (frontend estático) |
| Sin backend | Todo es estático, sin API propia |

---

## Estructura de carpetas

```
src/
├── components/         # UI components del catálogo
│   ├── Cart.tsx           # Carrito de compras
│   ├── Filters.tsx        # Panel de filtros
│   ├── Footer.tsx
│   ├── Header.tsx         # Navbar con búsqueda
│   ├── LazyImage.tsx      # Imagen lazy load
│   ├── Notice.tsx
│   ├── PerfumeCard.tsx    # Card de producto en grilla
│   ├── PerfumeDetails.tsx # Modal con detalle del perfume
│   ├── PerfumeListItem.tsx
│   └── Toast.tsx
├── content-studio/     # ⭐ Content Studio (generador de contenido)
│   ├── templates/
│   │   ├── instagram.ts    # Captions de Instagram
│   │   ├── stories.ts      # Textos para historias
│   │   ├── reel.ts         # Guiones de reels
│   │   ├── whatsapp.ts     # Mensajes de WhatsApp
│   │   ├── hashtags.ts     # Hashtags por categoría/género
│   │   └── imagePrompt.ts  # Prompts para generar imágenes con IA
│   ├── types.ts            # ContentOutput y tipos internos
│   ├── generators.ts       # Funciones generadoras de contenido
│   ├── ContentStudio.tsx   # Pantalla principal del Content Studio
│   └── ContentCard.tsx     # Card reutilizable para cada output
├── context/            # CartContext y useCart
├── data/               # Datos de productos
│   ├── perfumesRegulares.ts  # curados a mano
│   ├── minis.ts / otros.ts / arabes.ts / arabic.ts
│   ├── yvesRegulares.ts      # ⚙️ generado — import RED YVES
│   ├── yvesProbadores.ts     # ⚙️ generado — probadores 10ml
│   ├── yvesArabic.ts         # ⚙️ generado — Arabic Collection
│   └── yvesHome.ts           # ⚙️ generado — línea Home
├── hooks/              # useDebounce, useIntersectionObserver, usePerfumeCatalog
├── types/
│   └── index.ts           # Perfume, PerfumeInput, CartItem, PerfumeCategory
└── utils/
    ├── price.ts            # formatPrice, lineItemTotal, computeNumericTotal
    └── whatsapp.ts         # buildWhatsappMessage para carrito
```

---

## Tipos clave (`src/types/index.ts`)

```typescript
interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: number | "Consultar";
  gender: "masculino" | "femenino" | "unisex";
  category: PerfumeCategory;
  size: string;
  image: string;
  description: string;
  notes: { top: string[]; middle: string[]; base: string[] };
}
```

---

## Paleta de colores (Tailwind custom)

| Nombre | Hex | Uso |
|--------|-----|-----|
| Navy | `#1A2238` | Textos, botones principales |
| Gold | `#D4AF37` | Acentos, badges, highlights |
| Dark gold | `#9A7A1F` | Precios, hover gold |
| Cream | `#F8F0E3` | Background principal |
| Border | `#E8DDBF` | Bordes de cards |
| Input bg | `#FBF8F1` | Fondo de inputs |

---

## Convenciones importantes

- **No hay React Router**: la navegación entre vistas se maneja con estado (`view` en `App.tsx`)
- **Datos locales**: los productos viven en `src/data/`. Para agregar un producto a mano, editá el archivo `.ts` correspondiente. Los archivos `yves*.ts` son **generados** — no los edites, corré el importador
- **Colecciones** (`PerfumeCollection`): `regular` · `mini` · `arabe` · `arabic` · `home` · `accesorio`. Cada una tiene su rango de IDs en `ID_RANGES` (`src/data/index.ts`); 5000–5999 queda reservado para los perfumes custom guardados en localStorage
- **Precios**: pueden ser `number` (ej: `15000`) o `"Consultar"`. Siempre usar `formatPrice()` de `src/utils/price.ts`
- **Imágenes**: van en `public/imagenes/` con subcarpetas por categoría
- **Badges en cards**: se generan automáticamente según el `id` del producto (`id >= 3000` = Arabe, `id >= 1000 && < 2000` = Mini)

---

## Content Studio

El Content Studio es una sección interna (no pública) que permite generar contenido de marketing para un perfume seleccionado.

### Acceso
- Botón "Content Studio" en el Header (⚗️ ícono)
- Vista separada que reemplaza el catálogo (no es un modal)

### Outputs generados por perfume
1. **Caption Instagram** — texto emocional con CTA
2. **Historia Instagram** — texto corto para story
3. **Guion Reel** — script con escenas y timing
4. **Mensaje WhatsApp** — texto listo para pegar
5. **Hashtags** — set de 15 tags contextual
6. **Prompt imagen IA** — para usar en Midjourney / DALL-E

### Sin IA externa
Todo se genera con templates locales en TypeScript. Sin llamadas a APIs.

---

## Etapas del roadmap

- [x] **ETAPA 0**: Repo base funcional
- [x] **ETAPA 1** (parcial): Mejoras UX header, búsqueda, cards
- [x] **ETAPA 3 MVP**: Content Studio con templates locales ← *estás aquí*
- [ ] **ETAPA 1** (completa): Filtros mejorados, estados visuales, CTA WhatsApp más vendedor
- [ ] **ETAPA 2**: Estructura de datos extendida (ocasión, notas separadas, tags de estilo)
- [ ] **ETAPA 3** (full): Content Studio con integración IA real (OpenAI/Claude API)
- [ ] **ETAPA 4**: Badges, secciones de recomendación, quiz "tu perfume ideal"
- [ ] **ETAPA 5**: SEO, metadata, confianza, FAQ

---

## Comandos útiles

```bash
npm run dev      # Servidor local en http://localhost:5173
npm run build    # Build de producción
npm run lint     # ESLint
npm run preview  # Preview del build

npm run import-redyves        # Reimporta el catálogo del proveedor + baja imágenes
npm run sync-redyves-images   # Solo actualiza las fotos que cambiaron
npm run sync-catalog -- --dry-run   # Muestra qué subiría a Supabase, sin escribir
SYNC_FORCE=true npm run sync-catalog # Reemplaza la tabla con el catálogo local
```

## ⚠️ De dónde lee el catálogo

**La app lee de Supabase, NO de `src/data/`.** `useRemotePerfumes` hace
`supabase.from("perfumes").select("*")` y no tiene fallback a los archivos locales.
Agregar productos a `src/data/` no los hace aparecer en el catálogo — hay que
correr `npm run sync-catalog` para empujarlos a la tabla.

`src/data/` es la fuente de verdad; Supabase es la copia que sirve la app.

**Para revisar los datos locales antes de publicarlos:**

```bash
VITE_USE_LOCAL_CATALOG=true npm run dev
```

Con ese flag `useRemotePerfumes` devuelve el array de `src/data` y no toca Supabase
(tampoco hace falta la anon key). Sacá el flag para volver a leer de la DB.

Las `image_url` que sube `sync-catalog` son **rutas relativas** (`/imagenes/...`):
las fotos viven en el repo y las sirve Vercel, no Supabase Storage. Las que
subís desde el admin sí van a Storage con URL absoluta; ambas conviven.

`scripts/migrate-to-supabase.ts` es el script original de una sola vez: tiene los
55 productos hardcodeados adentro y NO ve los archivos generados. Usá `sync-catalog`.

---

## Proveedor RED YVES

El catálogo mayorista de RED YVES (`redyveshome.com`) se importa con `scripts/import-redyves.ts`.

- **Fuente**: `GET https://redyveshome.com/api/productos?page=N&limit=100` (paginado, sin auth)
- Las **notas olfativas, la familia y el perfume original inspirador** vienen embebidos en el HTML de `descripcion`; el script los parsea, no son campos propios de la API
- **Precio de venta** se deriva del costo con margen fijo por escalones (ver `toSalePrice`), no con un multiplicador
- **Dedupe**: los productos que ya están en los archivos curados a mano se saltean; los agotados también
- **Imágenes**: se bajan a `public/imagenes/redyves/`. El nombre de archivo del proveedor lleva el timestamp de subida, así que una foto reemplazada llega con otra URL — `scripts/redyves-manifest.json` guarda de dónde vino cada una y `sync-redyves-images.ts` compara contra eso

## Cómo agregar un perfume nuevo

1. Abrí el archivo correspondiente en `src/data/` (ej: `perfumesRegulares.ts`)
2. Agregá un objeto `PerfumeInput` al array
3. Subí la imagen a `public/imagenes/perfumes/`
4. El `id` se asigna automáticamente en el `index.ts` de data

---

## Notas para Claude

- **Antes de modificar código**: leer los archivos afectados con `Read`
- **Antes de cambios grandes**: proponer plan y esperar confirmación
- **TypeScript estricto**: no uses `any`, typear todo correctamente
- **Tailwind limpio**: no mezclar inline styles con Tailwind salvo que sea estrictamente necesario
- **No romper el catálogo**: el Content Studio es una capa adicional, no reemplaza nada
- **Mobile-first**: todos los componentes deben funcionar bien en celular
- **Después de cada cambio significativo**: correr `npm run build` para verificar
