# Project: DTFragancias

A web catalog of perfumes used as a sales and content tool for Instagram/WhatsApp. Deployed on Vercel as a static frontend. Instagram: @dt_fragancias.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (`vite@^7` in package.json; treat as Vite 5+ conventions) |
| Styles | Tailwind CSS 3 |
| Icons | lucide-react |
| Deploy | Vercel (static frontend) |
| Backend (new) | Supabase (Postgres + Auth + Storage, free tier) |

There is **no custom backend server**. The app is a static bundle. Supabase is reached directly from the browser using the public anon key; Postgres **Row Level Security (RLS)** is the real access guard.

## Source of truth

- **Today:** perfume data lives in local `.ts` arrays under `src/data/` (`perfumesRegulares.ts`, `arabes.ts`, `minis.ts`, `otros.ts`) and is combined in `src/data/index.ts`. An `AdminPanel` writes new items to `localStorage` only — nothing persists across devices or deploys.
- **After this change:** **Supabase becomes the source of truth.** The `.ts` arrays are kept as a read-only backup only until the migration is confirmed, then deprecated. Perfume rows are fetched from Supabase at runtime and passed through the existing normalization pipeline on the client.

## Key conventions (from CLAUDE.md — keep these)

- **No React Router.** Navigation is state-driven (`view`/`appView` in `App.tsx`) plus hash routes (`#/admin`, `#/studio`, `#/carousel`, `#/perfume/:slug`).
- **Data-driven views.** Components render from the `Perfume[]` array; do not hardcode products in JSX.
- **`price` is `number | "Consultar"`.** Always format via `formatPrice()` in `src/utils/price.ts`. Never render a raw price.
- **Derivation pipeline is sacred.** Store RAW input fields; derive display fields (`id`, `slug`, `tags`, `stock`, `isFeatured`, `occasion`, `season`, `intensity`, `longevity`, `whatsappHint`) on the client via `normalizePerfume` in `src/data/index.ts`. Migrated and new perfumes must render identically to existing ones.
- **Mobile-first.** Every component must work well on a phone.
- **TypeScript strict, no `any`.** Type everything, including Supabase row shapes.
- **Tailwind only.** Do not mix inline styles with Tailwind unless strictly necessary. Reuse the existing palette (Navy `#1A2238`, Gold `#D4AF37`, Dark gold `#9A7A1F`, Cream `#F8F0E3`, Border `#E8DDBF`, Input bg `#FBF8F1`).
- **Do not break the catalog.** Admin/Supabase is an additive layer over the read-only public catalog.

## Environment

- Vite exposes only vars prefixed with `VITE_` to the client. New vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `.env.local` is already git-ignored via the `*.local` pattern in `.gitignore`. Local dev reads from `.env.local`; production reads from Vercel Project Environment Variables.
