# Design: add-supabase-perfume-crud

This design keeps the existing derivation pipeline intact and treats Supabase strictly as a store of RAW perfume fields. Everything the UI shows beyond the raw fields is still computed on the client by `normalizePerfume` in `src/data/index.ts`.

## Grounding notes (from reading the code)

- `PerfumeInput` (`src/types/index.ts`) is `Omit<Perfume, "id" | "collection" | "stock" | "tags" | "isFeatured" | "isBestSeller" | "isNew" | "occasion" | "season" | "intensity" | "longevity" | "whatsappHint" | "slug">`. So the RAW fields are exactly: `name`, `brand`, `price`, `gender`, `category`, `size`, `image`, `description`, `notes`.
- **`collection` is NOT stored per item today** — it is inferred from *which array* the item lives in (`assignIds(perfumesRegulares, …, "regular")`, etc. in `src/data/index.ts`). Once rows come from one DB table there are no separate arrays, so `collection` MUST become an explicit column.
- **`id` is NOT stored today** — it is assigned by array position via `ID_RANGES` (regulares 1–999, minis 1000–1999, otros 2000–2999, arabes 3000–3999), and localStorage items get `5000 + index`. DB rows are unordered, so `id` MUST be derived from a stable DB key.
- `id` matters at runtime: it is a React `key`, the cart identity (`removeFromCart(id)`, `updateQuantity(id)`), the favorites key (`isFavorite(perfume.id)`), and feeds `featuredScore` (`id < 10`, `id >= 3000`). It must be a **stable positive integer**.
- Today `isFeatured` is fully derived (`buildCommercialMetadata`: `collection === "arabe" || id < 8 || name matches` heuristics) — the owner cannot control it. This change adds an **explicit owner-controlled `is_featured` flag** as the authoritative source (see id/collection modeling).
- `normalizePerfume(item, id, collection)` already takes `id` and `collection` as explicit params — so we can call it unchanged after fetch by passing the DB-derived id and the stored collection.
- `price` is `number | "Consultar"`; `stock` derives from it (`price === "Consultar" ? "consult" : "by-order"`).

## (a) Database schema — `perfumes` table

One table holding RAW fields plus the two fields that used to be implicit (`collection`, stable id).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `bigint generated always as identity primary key` | Stable, DB-owned. Source of the runtime numeric `id`. |
| `name` | `text not null` | RAW |
| `brand` | `text not null` | RAW |
| `price` | `numeric null` | **`NULL` means "Consultar".** See (below). |
| `gender` | `text not null` | Constrained to `'masculino' | 'femenino' | 'unisex'` via `check`. |
| `category` | `text not null` | Free-ish string; normalized on client by `normalizeCategory`. |
| `size` | `text not null` | e.g. `"100ml"`. |
| `image_url` | `text not null` | Public Storage URL. Maps to `Perfume.image`. |
| `description` | `text not null` | RAW |
| `notes` | `jsonb not null` | `{ top: string[]; middle: string[]; base: string[] }`, default `'{"top":[],"middle":[],"base":[]}'`. |
| `collection` | `text not null` | `'regular' | 'mini' | 'accesorio' | 'arabe'` via `check`. Was implicit; now explicit. |
| `is_featured` | `boolean not null default false` | **Owner-controlled "Destacar" flag.** Authoritative source of `Perfume.isFeatured` (see id/collection modeling). |
| `created_at` | `timestamptz not null default now()` | Ordering / audit. |
| `updated_at` | `timestamptz not null default now()` | Bumped on update (trigger optional). |

### price modeling — decision

**Chosen: `numeric NULL`, where `NULL` == "Consultar".**

- Client mapping: `const price = row.price === null ? "Consultar" : Number(row.price)`.
- Reverse (admin write): `"Consultar"` → `null`; a number → that number.
- Rationale: numeric column enables the existing price-range filters (`minPrice`/`maxPrice` in `usePerfumeCatalog`) and price sorting server-side later if wanted. A single nullable column is the minimum moving part.

Alternatives considered:
- *Sentinel string column* (store the literal `"Consultar"` in a `text` price): rejected — breaks numeric filtering/sorting and forces parsing everywhere.
- *Two columns (`price_numeric` + `price_is_consult` boolean)*: rejected as YAGNI — `NULL` already carries the "consult" meaning unambiguously for a solo owner.

### id / collection / featured modeling — decision

- **`id`:** use the DB `bigint identity` primary key directly as the runtime `Perfume.id`. It is stable, unique, and positive.
- **`collection`:** store explicitly (see column). The migration sets it per source file; the admin create form sets it via a select. `normalizePerfume(row, row.id, row.collection)` then runs unchanged.
- **`is_featured` (owner-controlled):** the DB flag is now the **authoritative** source of `Perfume.isFeatured`. `normalizePerfume` receives it and sets `isFeatured = row.is_featured` directly.
  - **The magic-id heuristic is REMOVED as a source of featured state.** `featuredScore` has thresholds (`id < 10`, `id >= 3000`) tuned to the old ID_RANGES that are meaningless under DB ids; the previous plan's "accept the ordering shift" decision is **replaced** by this explicit flag. `featuredScore` may still add points for `isFeatured`/`isBestSeller`/category/etc., but featured status itself no longer depends on the id.
  - **Recommendation (chosen): DB flag is authoritative; heuristic dropped; default `false`; owner toggles what they want featured.** `buildCommercialMetadata` no longer computes `isFeatured` from `collection`/`id`/name matches — it consumes the passed `is_featured` instead. Simplest and gives the owner real control.
  - **Migration seeds `is_featured = true` for árabes** (and any current featured set) so nothing visually regresses on day one — see (g).

Alternative considered — *keep the heuristic as a fallback when `is_featured` is unset*: rejected. A `boolean not null default false` has no "unset" state, and mixing two sources reintroduces the id-dependence we are removing. Clean single source is better for a solo owner.

Alternative considered — *derive everything server-side and store the full `Perfume`*: rejected. It duplicates logic that already lives and is tested in `normalizePerfume`, risks drift between DB and client, and makes tag/metadata tweaks require a data migration. **Keep RAW-in-DB + derive-on-client.**

## (b) Storage bucket + public read

- Bucket: `perfume-images`, **public**. Rationale: catalog images must load for anonymous visitors without signed URLs; simplest path.
- Object path convention: `perfumes/{collection}/{slug-or-uuid}.{ext}` to stay human-browsable and avoid collisions.
- Public URL via `supabase.storage.from('perfume-images').getPublicUrl(path)`; store that string in `image_url`.
- Storage RLS: public `SELECT`; `INSERT`/`UPDATE`/`DELETE` restricted to authenticated (admin) role.

## (c) RLS policies

Enable RLS on `perfumes`, then:

- `SELECT`: `using (true)` for role `anon` and `authenticated` — public read.
- `INSERT` / `UPDATE` / `DELETE`: `to authenticated using (true) with check (true)`.

Because there is exactly **one** admin Auth user and no self-signup (email confirmations off / signups disabled in Supabase Auth settings), "authenticated" effectively means "the admin". This is the simplest correct model for a solo owner.

Storage policies mirror this on `storage.objects` for the `perfume-images` bucket: public `SELECT`, authenticated write.

## (d) Auth approach

- Supabase Auth, **email + password**, a single pre-created admin user. **Disable public sign-ups** in the Supabase dashboard so no one else can create an account.
- Remove `ADMIN_PASSWORD` and the `sessionStorage` flag from `AdminPanel.tsx`. Gate the CRUD UI on the presence of a live Supabase session (`supabase.auth.getSession()` / `onAuthStateChange`).
- A small auth hook/context (e.g. `src/hooks/useAdminAuth.ts` or a context) exposes `session`, `signIn`, `signOut`, and `loading`.
- Note: the Content Studio / Carousel PIN gate in `App.tsx` currently also keys off the old `dtfragancias_admin_session` `sessionStorage` value (`canAccessStudio`). **Decision:** keep the Studio PIN independent for now (out of scope), but replace the admin-session check in `canAccessStudio` with "has a live Supabase session" so the two stay consistent. Flag this as a small touch-point, not a rewrite of the Studio gate.

Alternative considered — *email allowlist / multiple admins*: rejected as YAGNI. One owner, one account. Revisit only if a second seller joins; the RLS shape would extend cleanly.

## (e) Client data layer

- `src/lib/supabase.ts`: creates and exports a singleton client from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Fail loudly (typed error) at startup if either is missing.
- New type in `src/types/index.ts`: `PerfumeRow` describing the DB row (all columns, `price: number | null`, `notes: Notes`, `collection: PerfumeCollection`, `is_featured: boolean`). No `any`.
- Mapping helper `rowToInput(row): { input: PerfumeInput; id: number; collection: PerfumeCollection; isFeatured: boolean }`:
  - `price: row.price === null ? "Consultar" : row.price`
  - `image: row.image_url`
  - `isFeatured: row.is_featured`
  - passes `notes` through, others 1:1.
- `normalizePerfume` / `buildCommercialMetadata` change: accept the explicit `is_featured` and set `Perfume.isFeatured = row.is_featured` directly, replacing the `collection`/`id`/name-match computation for that field. All other derived metadata (`occasion`, `season`, `intensity`, `longevity`, `whatsappHint`, `isBestSeller`, `isNew`, `tags`) stays as-is.
- New hook `useRemotePerfumes()`: fetches rows, maps each with `normalizePerfume(input, row.id, row.collection, is_featured)`, returns `{ perfumes, loading, error, refetch }`.
- `usePerfumeCatalog.ts` change: replace `getStoredPerfumes()` + static `basePerfumes` with `useRemotePerfumes()`; feed its `perfumes` into the existing `all` memo. **All filtering/sorting logic stays byte-for-byte.** Expose `loading`/`error`/`refetch` upward so `App.tsx` can render loading/error/empty states and so the admin can trigger a refetch after writes (replacing the current `refreshCustomPerfumes`).

## (f) Admin CRUD UI

Reuse the current `AdminPanel.tsx` look (same modal shell, palette, `TextInput` component, notes-as-comma-separated inputs). Changes:

1. **Login:** Supabase Auth email+password form replaces the hardcoded-password form. On success, show CRUD.
2. **List:** show existing perfumes (name, brand, thumbnail, price) with **Edit** and **Delete** actions, and a visible **featured indicator** (e.g. a star/"Destacado" badge) so the owner sees at a glance which perfumes are featured.
3. **Create / Edit form:** same RAW fields as today plus:
   - **Collection select** (`regular | mini | accesorio | arabe`) — now required since it is explicit.
   - **"Destacar" toggle** (checkbox/switch) — sets `is_featured`. Reuse the palette (Gold `#D4AF37` for the on state). The owner flips this to control which perfumes are featured (and thus ordered higher via `featuredScore`).
   - **Image = file input** (not a path text field): on select, upload to Storage, show a preview, store the returned public URL. Keep an "or paste URL" fallback for convenience.
4. **Delete:** confirmation dialog, then delete row (and optionally the Storage object).
5. After any write, call `refetch()` from the data layer so the catalog updates without a full reload. Toasts reuse the existing `Toast`.

All mobile-first (the modal is already `max-w-3xl` scrollable; keep single-column on small screens).

## (g) Migration script design

A one-time Node script (e.g. `scripts/migrate-to-supabase.ts`, run locally with the **service-role** key from a non-committed env var, never shipped to the client):

1. Import the four `.ts` arrays and the same `ID_RANGES`/collection mapping used in `src/data/index.ts` so `collection` matches today's inference.
2. For each item: resolve its `image` path under `public/imagenes/`, upload the file to `perfume-images` at `perfumes/{collection}/{basename}`, get the public URL.
3. Insert a row: RAW fields + `image_url` = public URL + `collection` + `price` (`"Consultar"` → `null`, else the number) + **`is_featured`** seeded to preserve today's featured set.
   - **Seeding rule:** compute the *current* featured value for each item using today's logic (`buildCommercialMetadata`: `collection === "arabe" || id < 8 || name matches "sauvage"/"good girl"/"one million"`) and store it as `is_featured`. In practice this sets `true` for all árabes and the current featured regulares, `false` otherwise — so the catalog's featured set and ordering do not visually regress on day one. After migration, the owner controls it entirely via the "Destacar" toggle.
4. **Verify:** after insert, count rows per collection (expect 35/14/5/1 = 55), assert no `image_url` is empty, confirm the seeded `is_featured` set matches the pre-migration featured set, and fetch a few rows back through `rowToInput` + `normalizePerfume` to confirm they render-equal to the `.ts` pipeline (compare slug/tags for a sample).
5. Idempotency: guard against double-runs (e.g. skip if the table is non-empty, or upsert by a natural key like `name + collection`). Keep it simple: recommend running against an empty table and truncating to re-run.
6. **Backup:** do not delete the `.ts` files. After production verification, remove them from the runtime import path in a follow-up.

## (h) Env / config + local-vs-prod workflow

- `.env.local` (git-ignored via `*.local`):
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```
  The **service-role** key (migration only) goes in a separate non-committed var used solely by the script, never `VITE_`-prefixed, never in the bundle.
- **Local-first workflow:** wire a **cloud Supabase project** (free tier), put its URL + anon key in `.env.local`, run `npm run dev`, verify create/edit/delete and the migrated catalog locally. Only then add the same vars to Vercel → Project → Environment Variables and deploy.
- **Cloud project vs Supabase CLI local stack — recommendation:** use the **cloud project** for a solo non-technical owner. The CLI local stack (Docker, `supabase start`, migrations) is powerful but adds Docker + migration files + a sync step. A single cloud project the owner can also open in the Supabase dashboard is fewer moving parts and matches "local dev points at the real (dev) DB." If a separate prod DB is later wanted, create a second cloud project and swap env vars — no code change.

## (i) Security notes

- The **anon key is public by design**; shipping it in the client bundle is expected and safe. It only grants what RLS allows (public read).
- **RLS is the real guard.** Every write policy must require `authenticated`. Never rely on hiding the admin UI.
- The **service-role key bypasses RLS** — it is used only in the local migration script and must never be `VITE_`-prefixed, committed, or deployed.
- Disable public sign-ups in Supabase Auth so the single admin account cannot be joined by others.
```
