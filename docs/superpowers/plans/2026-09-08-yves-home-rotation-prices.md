# Yves Home Rotation Prices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lower Yves Home prices so the catalog is better positioned for order-based sales with roughly $5.000 profit per product.

**Architecture:** Keep the change scoped to catalog data. Update generated Yves Home product prices, then verify the app still builds and prepare a PR with the pricing rationale.

**Tech Stack:** React, Vite, TypeScript, Supabase-backed catalog data.

---

### Task 1: Update Yves Home Static Prices

**Files:**
- Modify: `src/data/yvesHome.ts`

- [ ] **Step 1: Use the Red Yves comparison table**

Use the latest Red Yves prices from `https://redyveshome.com/api/productos?categoria=yves-home&limit=200` and price products as Red Yves cost plus roughly `$5.000`, rounded to clean catalog prices.

- [ ] **Step 2: Update each matched product price**

Apply the suggested prices to each matching Yves Home product in `src/data/yvesHome.ts`. Leave unmatched decorative products unchanged until their distributor prices are confirmed.

- [ ] **Step 3: Review the diff**

Run: `git diff -- src/data/yvesHome.ts`

Expected: only `price` values change in Yves Home catalog data.

### Task 2: Verify And Publish Branch

**Files:**
- Modify: `docs/superpowers/plans/2026-09-08-yves-home-rotation-prices.md`

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Vite build exits successfully.

- [ ] **Step 2: Commit the pricing update**

Run: `git add src/data/yvesHome.ts docs/superpowers/plans/2026-09-08-yves-home-rotation-prices.md && git commit -m "fix: adjust yves home rotation prices"`

Expected: commit includes only the pricing source file and this plan.

- [ ] **Step 3: Push branch and open PR**

Run: `git push -u origin fix/yves-home-rotation-prices`

Then create a PR into `main` summarizing that Yves Home prices were lowered for faster sales rotation using Red Yves plus approximately `$5.000` profit.

### Verification Notes

- `npm exec tsc -- --noEmit` passed.
- `npm run build` was started twice and remained running without emitting errors; both runs were interrupted after several minutes.
- `npm run lint` also remained running without emitting errors and was interrupted.
