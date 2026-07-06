# Tasks: add-supabase-perfume-crud

Ordered, phase-grouped implementation checklist. Do phases top to bottom. Local testing (Phase 6) MUST pass before Deploy (Phase 7).

## 1. Supabase project & schema

- [ ] Create a Supabase project (free tier); note the project URL and anon key.
- [ ] In Auth settings, **disable public sign-ups** and email confirmations for self-signup.
- [ ] Create the `perfumes` table with columns per `design.md` (a): `id bigint identity PK`, `name`, `brand`, `price numeric null`, `gender` (+ check), `category`, `size`, `image_url`, `description`, `notes jsonb`, `collection` (+ check), `is_featured boolean not null default false`, `created_at`, `updated_at`.
- [ ] Create the `perfume-images` Storage bucket as **public**.
- [ ] Enable RLS on `perfumes`.
- [ ] Add policy: public `SELECT` on `perfumes` (`anon` + `authenticated`).
- [ ] Add policies: `INSERT` / `UPDATE` / `DELETE` on `perfumes` for `authenticated` only.
- [ ] Add Storage policies on the bucket: public `SELECT`, authenticated write.
- [ ] **Verify:** from the SQL editor, confirm anon `SELECT` works and an unauthenticated write is rejected.

## 2. Auth

- [ ] Create the single admin Auth user (email + password) in the dashboard. ← owner action
- [x] Add `@supabase/supabase-js` to `package.json` and install.
- [x] Create `src/lib/supabase.ts` exporting a typed singleton client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; throw a clear error if either is missing.
- [x] Create an admin auth hook/context (`session`, `signIn`, `signOut`, `loading`) using `supabase.auth`.
- [x] Remove `ADMIN_PASSWORD` and the `sessionStorage` admin flag from `AdminPanel.tsx`.
- [x] Update `canAccessStudio()` in `App.tsx` to key off a live Supabase session instead of `dtfragancias_admin_session`.
- [ ] **Verify:** login with correct/incorrect credentials behaves per spec; session survives reload; logout clears it. ← owner action (needs .env.local)

## 3. Data layer

- [x] Add a `PerfumeRow` type to `src/types/index.ts` (`price: number | null`, `notes: Notes`, `collection: PerfumeCollection`, `is_featured: boolean`). No `any`.
- [x] Add a `rowToInput(row)` mapper (`price null → "Consultar"`, `image_url → image`, expose `is_featured`).
- [x] Update `normalizePerfume`/`buildCommercialMetadata` in `src/data/index.ts` so `isFeatured` comes from the explicit `is_featured` flag (authoritative) instead of the id/collection/name heuristic; keep all other derived metadata unchanged.
- [x] Create `src/hooks/useRemotePerfumes.ts`: fetch rows, map via `normalizePerfume(input, row.id, row.collection, is_featured)`, return `{ perfumes, loading, error, refetch }`.
- [x] Update `usePerfumeCatalog.ts` to consume `useRemotePerfumes()` instead of static `basePerfumes` + `getStoredPerfumes()`; keep all filter/sort logic unchanged; expose `loading`/`error`/`refetch`.
- [x] Update `App.tsx` catalog view to render loading and error states; wire the admin "saved" callback to `refetch`.
- [ ] **Verify:** catalog renders from Supabase; a "Consultar" row and a numeric-price row both display and filter correctly.

## 4. Admin CRUD UI

- [x] Replace the password login form in `AdminPanel.tsx` with the Supabase email+password login.
- [x] Add a **collection** select (`regular | mini | accesorio | arabe`) to the create/edit form.
- [x] Add a **"Destacar" toggle** (checkbox/switch, Gold `#D4AF37` on-state) to the create/edit form to set `is_featured`.
- [x] Replace the image path text field with a **file input**: upload to `perfume-images`, show a preview, store the public URL (keep an "or paste URL" fallback).
- [x] Implement **create**: insert a row with RAW fields + `image_url` + `collection` + `is_featured`; map `"Consultar"` → `null` price.
- [x] Implement a **list** of existing perfumes (thumbnail, name, brand, price) with Edit/Delete actions and a **featured indicator** (star / "Destacado" badge).
- [x] Implement **edit**: prefill the form (including the "Destacar" toggle state), allow image replacement, `UPDATE` the row.
- [x] Implement **delete** with a confirmation step.
- [x] After each write, call `refetch()` and show a `Toast`.
- [ ] **Verify:** mobile-first check — the panel and forms work on a phone-width viewport.

## 5. Migration

- [ ] Write `scripts/migrate-to-supabase.ts` per `design.md` (g): read the four `.ts` arrays with the same collection mapping.
- [ ] For each item: upload its `public/imagenes/...` file to `perfume-images`, get the public URL.
- [ ] Insert rows with RAW fields + `image_url` + `collection` + `price` (`"Consultar"` → `null`) + `is_featured` **seeded** from today's featured logic (`collection === "arabe" || id < 8 || name matches sauvage/good girl/one million`) so the featured set does not regress.
- [ ] Use the **service-role** key from a non-committed, non-`VITE_` env var for the script only.
- [ ] Add a verification step: assert 35/14/5/1 = 55 rows by collection, no empty `image_url`, seeded `is_featured` matches the pre-migration featured set, and sample slug/tags match the `.ts` pipeline.
- [ ] Run the migration against the (empty) table.
- [ ] **Verify:** open the catalog and confirm all 55 perfumes render with images from Storage and no broken links.

## 6. Local testing (MUST pass before deploy)

- [ ] Put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (confirm it is git-ignored).
- [ ] Run `npm run dev` and manually verify: public catalog, admin login, create with photo, edit, delete, "Consultar" handling, "Destacar" toggle affecting the "Destacados" filter and ordering, loading/error states.
- [ ] Run `npm run lint` and fix issues.
- [ ] Run `npm run build` and confirm it passes.
- [ ] **Verify (adversarial):** in a logged-out session, confirm a write attempt is rejected by RLS (not just hidden in the UI).

## 7. Deploy

- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Project Environment Variables.
- [ ] Deploy to Vercel.
- [ ] **Verify in production:** catalog loads from Supabase, admin can create/edit/delete, images resolve.
- [ ] After production is confirmed stable, remove `src/data/perfumesRegulares.ts`, `arabes.ts`, `minis.ts`, `otros.ts` from the runtime import path and delete `getStoredPerfumes`/`saveStoredPerfumes` (keep a git-tagged backup of the `.ts` files).
- [ ] Update `CLAUDE.md` to reflect Supabase as the source of truth and the new "add a perfume" flow (via admin panel, not editing `.ts`).
