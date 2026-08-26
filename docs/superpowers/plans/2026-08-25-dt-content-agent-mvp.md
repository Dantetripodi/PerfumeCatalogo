# DT Content Agent MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing local Content Studio into a persisted Supabase-backed Content Pack workflow with manual generation, editing, review states, and no automatic publishing.

**Architecture:** Keep the existing lazy-loaded Studio entry point and local generators. Add a typed content-pack domain layer, a Supabase repository, and a small stateful review UI inside `src/content-studio/`; the public catalog remains unchanged. PIN access remains the UI gate, while Supabase mutations require an authenticated Supabase session and show a clear error when credentials/session are unavailable.

**Tech Stack:** React 18, TypeScript strict mode, Vite, Tailwind CSS, lucide-react, Supabase JS, Supabase SQL migration, Vitest.

---

## Scope and file map

Create:

- `supabase/migrations/20260825_create_content_packs.sql` — table, indexes, RLS, and authenticated-user policies.
- `src/content-studio/contentPackTypes.ts` — domain types, status/reason unions, and JSON payload shape.
- `src/content-studio/brandKit.ts` — typed DT visual guidance used by image concepts.
- `src/content-studio/contentPackGenerators.ts` — adapter from the existing `Perfume` and generators to a pack.
- `src/content-studio/contentPackRepository.ts` — Supabase CRUD/status operations and error normalization.
- `src/content-studio/useContentPacks.ts` — loading, selection, save, edit, regenerate, and status actions.
- `src/content-studio/ContentPackInbox.tsx` — filters, pack list, and selected-pack review screen.
- `src/content-studio/ContentPackEditor.tsx` — editable fields and review actions.
- `src/content-studio/contentPackGenerators.test.ts`, `src/content-studio/contentPackRepository.test.ts`, and `src/content-studio/contentPackState.test.ts` — focused unit tests.
- `vitest.config.ts` — minimal test configuration.

Modify:

- `package.json` and `package-lock.json` — add `test`/watch scripts and Vitest.
- `src/content-studio/types.ts` — preserve existing output types and add compatible aliases only if needed.
- `src/content-studio/generators.ts` — expose the existing generators to the pack adapter without duplicating template logic.
- `src/content-studio/templates/stories.ts`, `src/content-studio/templates/reel.ts`, `src/content-studio/templates/instagram.ts`, and `src/content-studio/templates/imagePrompt.ts` — improve tone/structure while preserving deterministic local generation.
- `src/content-studio/ContentStudio.tsx` — add create/inbox modes, save action, and pack editor integration.
- `src/App.tsx` — pass the existing catalog products and authenticated session context without changing the public catalog route.
- `CLAUDE.md` — document the new migration, test command, and authenticated persistence requirement.

## Data contract

Use this TypeScript contract as the source of truth:

```ts
export type ContentPackReason = "manual" | "new_product";
export type ContentPackStatus = "draft" | "approved" | "rejected";

export interface StoryIdea {
  title: string;
  text: string;
  cta?: string;
}

export interface ReelIdea {
  hook: string;
  shots: string[];
  onScreenText: string[];
  cta: string;
  caption: string;
}

export interface ImageConcept {
  title: string;
  scene: string;
  overlayText?: string;
}

export interface ContentPackPayload {
  instagramCaption: string;
  stories: StoryIdea[];
  reel: ReelIdea;
  hashtags: string[];
  imageConcepts: ImageConcept[];
  whatsappText: string;
}

export interface ContentPack {
  id: string;
  productId: number;
  reason: ContentPackReason;
  payload: ContentPackPayload;
  status: ContentPackStatus;
  createdAt: string;
  updatedAt: string;
}
```

The database row uses snake_case columns and `payload jsonb`; repository mapping is the only place that converts between row and domain shape.

### Task 1: Add test tooling and define the pack domain

**Files:**

- Create: `vitest.config.ts`
- Create: `src/content-studio/contentPackTypes.ts`
- Create: `src/content-studio/contentPackGenerators.test.ts`
- Modify: `package.json`, `package-lock.json`
- Modify: `src/content-studio/generators.ts`

- [ ] **Step 1: Add the test command and Vitest dependency**

Add:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Install the repository's existing package manager dependency with `npm install -D vitest`; do not change unrelated dependency versions.

- [ ] **Step 2: Add the minimal Vitest config**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
```

- [ ] **Step 3: Write failing generator tests**

Test that a pack generated for a representative product has:

```ts
expect(pack.reason).toBe("manual");
expect(pack.payload.stories.length).toBeGreaterThanOrEqual(2);
expect(pack.payload.stories.length).toBeLessThanOrEqual(4);
expect(pack.payload.reel.hook.length).toBeGreaterThan(0);
expect(pack.payload.reel.shots.length).toBeGreaterThanOrEqual(3);
expect(pack.payload.hashtags.length).toBeGreaterThan(0);
```

Use a local fixture implementing the real `Perfume` interface; do not import the large catalog.

- [ ] **Step 4: Implement the domain types and generator adapter**

Define the contracts above and add:

```ts
export function generateContentPack(
  perfume: Perfume,
  reason: ContentPackReason = "manual",
): Omit<ContentPack, "id" | "createdAt" | "updatedAt" | "status"> {
  const base = generateAllContent(perfume);
  return {
    productId: perfume.id,
    reason,
    payload: {
      instagramCaption: base.instagramCaption,
      stories: normalizeStories(base.instagramStory),
      reel: normalizeReel(base.reelScript, base.instagramCaption),
      hashtags: base.hashtags,
      imageConcepts: [{ title: "Concepto DT", scene: base.imagePrompt }],
      whatsappText: base.whatsappText,
    },
  };
}
```

Keep `normalizeStories` and `normalizeReel` deterministic and pure. Reuse existing template functions; do not duplicate their product/price logic.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- --run src/content-studio/contentPackGenerators.test.ts`

Expected: PASS with the generated pack shape and 2–4 stories.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/content-studio/contentPackTypes.ts src/content-studio/contentPackGenerators.test.ts src/content-studio/generators.ts
git commit -m "feat(content-studio): define content pack domain"
```

### Task 2: Improve the local content quality and brand guidance

**Files:**

- Create: `src/content-studio/brandKit.ts`
- Modify: `src/content-studio/templates/stories.ts`
- Modify: `src/content-studio/templates/reel.ts`
- Modify: `src/content-studio/templates/instagram.ts`
- Modify: `src/content-studio/templates/imagePrompt.ts`
- Modify: `src/content-studio/contentPackGenerators.test.ts`

- [ ] **Step 1: Add tests for the promised tone**

Assert that generated story text contains conversational prompts/CTAs and does not contain a long flyer-style block; assert that the reel has a hook, at least three shots, on-screen text, and a CTA. Assert that image concepts include the DT palette/lifestyle direction but do not instruct heavy text overlays.

- [ ] **Step 2: Define the typed brand kit**

```ts
export const DT_BRAND_KIT = {
  palette: ["crema", "beige", "camel", "marrón cálido", "negro", "dorado sutil"],
  mood: ["cálida", "premium accesible", "natural", "minimalista", "lifestyle"],
  props: ["madera", "lino", "libros", "bandejas", "luz natural cálida", "plantas"],
  avoid: ["neón", "saturación excesiva", "flyer barato", "texto abundante"],
} as const;
```

- [ ] **Step 3: Rewrite templates with bounded output**

Stories must return 2–4 short, conversational frames such as greeting/question/product/CTA. Reels must explicitly format hook, shots, on-screen text, CTA, and caption. Captions must use one product angle and one CTA instead of repeating all product metadata. Image prompts must use the brand kit and request a clean composition with minimal/no overlay text.

- [ ] **Step 4: Run lint and focused tests**

Run: `npm test -- --run src/content-studio/contentPackGenerators.test.ts && npm run lint`

Expected: PASS and no ESLint errors.

- [ ] **Step 5: Commit**

```bash
git add src/content-studio/brandKit.ts src/content-studio/templates src/content-studio/contentPackGenerators.test.ts
git commit -m "feat(content-studio): improve DT content tone"
```

### Task 3: Add Supabase persistence and security policies

**Files:**

- Create: `supabase/migrations/20260825_create_content_packs.sql`
- Create: `src/content-studio/contentPackRepository.ts`
- Create: `src/content-studio/contentPackRepository.test.ts`
- Modify: `src/lib/supabase.ts` only if a shared configuration/error helper is needed

- [ ] **Step 1: Write repository mapping tests**

Mock the Supabase client boundary and test that a snake_case row maps to `ContentPack`, that a new draft sends `product_id`, `reason`, `payload`, and `status = 'draft'`, and that a status update only sends an allowed status. Test that repository calls return a user-facing configuration/session error when `SUPABASE_CONFIGURED` is false or there is no authenticated session.

- [ ] **Step 2: Add the migration**

Create:

```sql
create table if not exists public.content_packs (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.perfumes(id) on delete cascade,
  reason text not null check (reason in ('manual', 'new_product')),
  payload jsonb not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists content_packs_status_updated_idx
  on public.content_packs(status, updated_at desc);

create index if not exists content_packs_product_idx
  on public.content_packs(product_id);

alter table public.content_packs enable row level security;

create policy "authenticated users can read content packs"
  on public.content_packs for select to authenticated using (true);

create policy "authenticated users can insert content packs"
  on public.content_packs for insert to authenticated with check (true);

create policy "authenticated users can update content packs"
  on public.content_packs for update to authenticated using (true) with check (true);
```

Add an `updated_at` trigger using the project's standard Supabase pattern if one exists; otherwise update `updated_at` explicitly in repository update calls. Do not create anonymous write policies.

- [ ] **Step 3: Implement the repository**

Expose:

```ts
listContentPacks(status?: ContentPackStatus): Promise<ContentPack[]>;
createContentPack(input: NewContentPack): Promise<ContentPack>;
updateContentPack(id: string, payload: ContentPackPayload): Promise<ContentPack>;
setContentPackStatus(id: string, status: ContentPackStatus): Promise<ContentPack>;
```

Before every mutation, call `supabase.auth.getSession()`; return a stable `ContentPackRepositoryError` with Spanish guidance if credentials/session are missing. Convert Supabase errors into that error without exposing raw SQL details in the UI.

- [ ] **Step 4: Run repository tests and TypeScript validation**

Run: `npm test -- --run src/content-studio/contentPackRepository.test.ts && npx tsc -p tsconfig.app.json --noEmit`

Expected: PASS and no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260825_create_content_packs.sql src/content-studio/contentPackRepository.ts src/content-studio/contentPackRepository.test.ts
git commit -m "feat(content-studio): persist content packs securely"
```

### Task 4: Add state transitions and review workflow logic

**Files:**

- Create: `src/content-studio/contentPackState.test.ts`
- Create: `src/content-studio/useContentPacks.ts`

- [ ] **Step 1: Write transition tests**

Test pure helpers for:

```ts
canEdit("draft") === true;
canEdit("approved") === true;
canEdit("rejected") === true;
nextStatus("draft", "approve") === "approved";
nextStatus("draft", "reject") === "rejected";
nextStatus("approved", "reject") === "rejected";
```

Also test that regenerating an existing pack returns a new unsaved draft and never mutates the original pack id/status.

- [ ] **Step 2: Implement the hook**

The hook must expose `packs`, `selectedPack`, `loading`, `error`, `refresh`, `selectPack`, `createDraft`, `savePack`, `approvePack`, `rejectPack`, and `regeneratePack`. Keep the selected product separate from the selected persisted pack. Optimistically update only after a repository call succeeds; on error preserve the edited local values and surface the normalized message.

- [ ] **Step 3: Run state tests**

Run: `npm test -- --run src/content-studio/contentPackState.test.ts`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content-studio/useContentPacks.ts src/content-studio/contentPackState.test.ts
git commit -m "feat(content-studio): add pack review state"
```

### Task 5: Build the inbox and editable pack detail UI

**Files:**

- Create: `src/content-studio/ContentPackInbox.tsx`
- Create: `src/content-studio/ContentPackEditor.tsx`
- Modify: `src/content-studio/ContentCard.tsx` only to support a controlled editable mode without breaking copy mode

- [ ] **Step 1: Define the inbox behavior before implementation**

The inbox renders status tabs `Todos`, `Borradores`, `Aprobados`, `Rechazados`, a product search field, a list sorted by `updatedAt` descending, and an empty state. Selecting a pack opens its editor; loading, save, and repository errors are visible and do not discard edits.

- [ ] **Step 2: Implement the inbox**

Use existing palette tokens and lucide icons. Show product name/image by resolving `productId` against the `perfumes` prop. Do not render the inbox in the public catalog. Keep mobile layout single-column; use a two-column list/detail layout only at large breakpoints.

- [ ] **Step 3: Implement the editor**

Use controlled `textarea` fields for caption, each story text/title/CTA, reel hook/shots/on-screen text/CTA/caption, WhatsApp text, and hashtags. Provide:

```ts
onSave(): Promise<void>;
onApprove(): Promise<void>;
onReject(): Promise<void>;
onRegenerate(): Promise<void>;
```

Disable actions while saving, show status badge and timestamps, and display a short warning that approval is internal only and does not publish to Instagram.

- [ ] **Step 4: Run the build**

Run: `npm run build`

Expected: Vite build succeeds and the lazy Studio chunk remains code-split.

- [ ] **Step 5: Commit**

```bash
git add src/content-studio/ContentPackInbox.tsx src/content-studio/ContentPackEditor.tsx src/content-studio/ContentCard.tsx
git commit -m "feat(content-studio): add review inbox UI"
```

### Task 6: Integrate creation, inbox mode, and existing access flow

**Files:**

- Modify: `src/content-studio/ContentStudio.tsx`
- Modify: `src/App.tsx`
- Modify: `src/hooks/useInternalTools.ts` only if a separate inbox hash is needed

- [ ] **Step 1: Add mode controls without changing routing**

Keep the existing `onBack` behavior and add a local Studio mode switch: `Generar` and `Bandeja`. The generate mode keeps the existing product selector and output cards. Add `Generar Content Pack` and `Guardar borrador` actions using the new hook.

- [ ] **Step 2: Connect the product generator**

When a product is selected, generate a local draft through `generateContentPack(product, "manual")`. Saving calls `createContentPack`; after success, switch to inbox and select the saved pack. Regeneration uses the same selected product and creates a new draft.

- [ ] **Step 3: Pass products/session context**

Pass the existing `allPerfumes` list as already done. Do not expose Supabase service keys in the client. The repository checks the current Supabase session itself; the existing PIN gate remains the first UI gate.

- [ ] **Step 4: Add an actionable no-session error**

If the user entered only the PIN and is not authenticated, show: `Para guardar Content Packs, iniciá sesión desde Admin; el PIN sólo habilita la herramienta.` Keep local generation and copying usable.

- [ ] **Step 5: Run lint, tests, and build**

Run: `npm test && npm run lint && npm run build`

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add src/content-studio/ContentStudio.tsx src/App.tsx src/hooks/useInternalTools.ts
git commit -m "feat(content-studio): integrate pack generation and inbox"
```

### Task 7: Document deployment and verify the complete flow

**Files:**

- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/specs/2026-08-25-dt-content-agent-design.md` only if implementation decisions need clarification

- [ ] **Step 1: Document the migration and auth requirement**

Add the exact migration command/procedure used by the project, note that `content_packs` requires authenticated Supabase users, and document:

```bash
npm test
npm run lint
npm run build
```

Also document that approval is not publication.

- [ ] **Step 2: Apply the migration in the configured Supabase project**

Run the SQL in `supabase/migrations/20260825_create_content_packs.sql` using the project's Supabase migration workflow or SQL editor. Confirm that `select/insert/update` policies exist for `authenticated` and no `anon` mutation policy exists.

- [ ] **Step 3: Execute the manual smoke test**

With valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`:

1. Open the catalog and enter Content Studio through the existing gate.
2. Select a product and generate a pack.
3. Confirm 2–4 stories, a structured reel, hashtags, and an image concept.
4. Save the draft; confirm it appears in the inbox after refresh.
5. Edit caption and story text; save; refresh and confirm values persist.
6. Approve, reject, and regenerate; confirm status changes and the original pack remains.
7. Confirm no Instagram/WhatsApp publication occurs automatically.

Without valid credentials, select a product and confirm local generation/copy still works while saving shows the Spanish auth/configuration message.

- [ ] **Step 4: Run final verification**

Run: `npm test && npm run lint && npm run build`

Expected: PASS, with no public-catalog regressions.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-08-25-dt-content-agent-design.md
git commit -m "docs: document content pack deployment and verification"
```

## Self-review

- Spec coverage: manual/new-product generation is covered by Tasks 1 and 6; content quality and brand kit by Task 2; persistence/RLS by Task 3; review states and regeneration by Task 4; inbox/editing by Task 5; access and no-publication behavior by Task 6; validation and deployment by Task 7.
- Placeholder scan: no `TODO`, `TBD`, or deferred implementation step is required; future automatic events/publication are explicitly out of scope.
- Type consistency: `ContentPackPayload`, `ContentPackStatus`, and `ContentPackReason` are defined once in Task 1 and referenced by repository, hook, and UI tasks. Repository method names are used consistently.
- Scope: one independently testable MVP; event detection, scheduling, metrics, and external AI remain separate future projects.

