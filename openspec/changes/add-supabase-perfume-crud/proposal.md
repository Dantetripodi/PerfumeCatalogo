# Change: add-supabase-perfume-crud

## Why

Today the catalog data lives in hand-edited `.ts` files under `src/data/`, and the only "admin" tool is `AdminPanel.tsx`, which:

- **Writes to `localStorage` only** (`saveStoredPerfumes` in `src/data/index.ts`). New products live in one browser and never reach production or any other device. This is a data trap for a non-technical owner who expects "I added it, it's live."
- **Is protected by a hardcoded password** (`ADMIN_PASSWORD = "DTFragancias2026"` in `AdminPanel.tsx`). It ships in the public JS bundle, so it is effectively no protection at all.
- **Cannot edit or delete** — it only appends.
- **Cannot upload photos** — the image field is a manual path string the owner must type after copying a file into `public/imagenes/`.

The owner is a solo, non-technical perfume seller who wants **autonomy**: add/edit/delete perfumes with a photo, see the change in the live site, without editing code or asking a developer. The current setup cannot deliver that.

## What Changes

- **Supabase as source of truth.** A `perfumes` table in Supabase (free tier) holds the RAW perfume fields. The public catalog reads from it at runtime.
- **Real admin authentication.** Replace the hardcoded frontend password with Supabase Auth (email + password) for a single admin account. Public visitors are read-only.
- **Full CRUD for admin.** Create, list, edit, and delete perfumes from a panel that reuses the existing `AdminPanel` look.
- **Photo upload.** The admin picks an image file in the form; it uploads to a public Supabase Storage bucket and the perfume stores the public URL. All images (existing + new) are unified into Storage.
- **RLS enforcement.** Postgres policies allow public `SELECT` but restrict `INSERT`/`UPDATE`/`DELETE` to the authenticated admin. Security does not depend on hiding UI.
- **One-time data migration.** A script migrates the current ~55 perfumes (35 regulares @60000, 14 árabes = 12 "Consultar" + 2 @85000, 5 minis @18000, 1 otro @6000) into the table, uploads their images from `public/imagenes/` to Storage, and sets each row's image URL.
- **Manual "featured" control.** Add an owner-controlled `is_featured` flag with a "Destacar" toggle in the admin form, replacing the current id/collection heuristic as the source of featured status. The owner decides which perfumes are featured (and thus ordered higher); migration seeds it to preserve today's featured set.
- **Preserve the derivation pipeline.** Store RAW fields; keep running `normalizePerfume` on the client after fetch so migrated + new perfumes render identically as normal cards.
- **`.ts` deprecation path.** Keep `src/data/*.ts` as backup until migration is verified in production, then remove them from the runtime path.

## Impact

- **New dependency:** `@supabase/supabase-js`.
- **New env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (in `.env.local` locally, already git-ignored via `*.local`; set in Vercel for production).
- **New Supabase resources:** `perfumes` table, `perfume-images` Storage bucket, RLS policies, one admin Auth user.
- **New files (implementation phase):** `src/lib/supabase.ts` (client), a fetch hook (e.g. `src/hooks/useRemotePerfumes.ts`), an auth context/hook, and a migration script under `scripts/`.
- **Modified files:**
  - `src/hooks/usePerfumeCatalog.ts` — replace the static `basePerfumes` import + `getStoredPerfumes()` with data fetched from Supabase; add `loading`/`error` states. Keep all filtering/sorting logic.
  - `src/components/AdminPanel.tsx` — swap the hardcoded password login for Supabase Auth; add edit/delete and file upload; write to Supabase instead of `localStorage`.
  - `src/App.tsx` — surface `loading`/`error` in the catalog view; keep admin gating.
  - `src/types/index.ts` — add a `PerfumeRow` type for the DB row (includes `is_featured: boolean`); `Perfume` and `PerfumeInput` stay as-is.
  - `src/data/index.ts` — `normalizePerfume`/`buildCommercialMetadata` change so `isFeatured` comes from the explicit `is_featured` flag instead of the id/collection heuristic; `buildSlug`, `buildTags`, and all other derived metadata stay and are reused after fetch; `getStoredPerfumes`/`saveStoredPerfumes` (localStorage) are removed once migration lands.
- **Deprecated after verification:** `src/data/perfumesRegulares.ts`, `arabes.ts`, `minis.ts`, `otros.ts` (kept as backup during migration).
- **Security note:** the anon key is designed to be public; it is safe in the bundle. RLS is the actual guard.
