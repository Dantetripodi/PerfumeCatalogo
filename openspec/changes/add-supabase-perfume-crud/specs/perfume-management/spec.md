# Spec: perfume-management

## ADDED Requirements

### Requirement: Public read of catalog from Supabase

The system SHALL load the public perfume catalog from the Supabase `perfumes` table at runtime, without requiring authentication, and pass each row through the existing `normalizePerfume` pipeline so that display fields (`id`, `slug`, `tags`, `stock`, `isFeatured`, `occasion`, `season`, `intensity`, `longevity`, `whatsappHint`) are derived on the client.

#### Scenario: Anonymous visitor sees the catalog

- **Given** a visitor with no account opens the site
- **When** the catalog view loads
- **Then** the system fetches all perfume rows from Supabase using the anon key
- **And** every row is normalized on the client and rendered as a `PerfumeCard` identical in shape to today's cards (name, brand, `formatPrice(price)`, category, size, image, badges)
- **And** the hero product count reflects the number of rows returned

#### Scenario: Fetch is loading

- **Given** the catalog fetch has not yet resolved
- **When** the catalog view renders
- **Then** the system shows a loading state (skeleton or spinner) instead of an empty "no perfumes found" message

#### Scenario: Fetch fails

- **Given** the Supabase request fails (network or server error)
- **When** the catalog view renders
- **Then** the system shows a friendly error message with a retry action
- **And** does not crash the app

### Requirement: Admin authentication via Supabase Auth

The system SHALL authenticate the admin using Supabase Auth (email + password) for a single admin account, and SHALL NOT rely on any hardcoded password in the client bundle. The hardcoded `ADMIN_PASSWORD` constant SHALL be removed.

#### Scenario: Admin logs in with valid credentials

- **Given** the admin opens the admin panel
- **When** they enter the correct email and password
- **Then** Supabase Auth returns a valid session
- **And** the admin CRUD interface becomes available

#### Scenario: Wrong credentials are rejected

- **Given** the admin panel login form is open
- **When** someone enters an incorrect email or password
- **Then** the system shows an authentication error
- **And** the CRUD interface remains hidden

#### Scenario: Session persists across reloads

- **Given** the admin has an active Supabase session
- **When** they reload the page and reopen the admin panel
- **Then** the system restores the session from Supabase (no re-login required until it expires)

#### Scenario: Admin logs out

- **Given** an authenticated admin
- **When** they choose to log out
- **Then** the Supabase session is cleared
- **And** the CRUD interface is hidden again

### Requirement: Admin creates a perfume with photo upload

The system SHALL let an authenticated admin create a perfume by filling the RAW fields (name, brand, price, gender, category, size, description, notes) and uploading an image file, which is stored in the Supabase Storage bucket, with the perfume row referencing the file's public URL.

#### Scenario: Create with uploaded photo

- **Given** an authenticated admin on the create form
- **When** they fill all required fields, select an image file, and submit
- **Then** the image is uploaded to the `perfume-images` bucket
- **And** a new row is inserted into `perfumes` with `image_url` set to the file's public URL and `collection` set explicitly
- **And** the new perfume appears in the catalog after refetch, normalized like any other card

#### Scenario: Image preview before submit

- **Given** the admin has selected an image file but not yet submitted
- **When** the form renders
- **Then** the system shows a preview of the selected image

#### Scenario: Required fields validated

- **Given** the create form
- **When** the admin submits with a missing required field (e.g. name)
- **Then** the system blocks submission and indicates the missing field
- **And** no row is inserted

### Requirement: Admin edits a perfume

The system SHALL let an authenticated admin edit any existing perfume, updating RAW fields and optionally replacing the image, persisting changes to Supabase.

#### Scenario: Edit text fields

- **Given** an authenticated admin viewing the perfume list
- **When** they open a perfume, change its price from `"Consultar"` to `45000`, and save
- **Then** the row's `price` column is updated to `45000`
- **And** the catalog reflects the new price via `formatPrice` after refetch

#### Scenario: Replace image on edit

- **Given** an authenticated admin editing a perfume
- **When** they upload a new image file and save
- **Then** the new image is uploaded to Storage and `image_url` is updated
- **And** the card shows the new image after refetch

### Requirement: Admin deletes a perfume

The system SHALL let an authenticated admin delete a perfume, removing its row from Supabase, with a confirmation step.

#### Scenario: Delete with confirmation

- **Given** an authenticated admin viewing the perfume list
- **When** they choose delete and confirm
- **Then** the row is removed from `perfumes`
- **And** the perfume disappears from the catalog after refetch

#### Scenario: Delete is cancellable

- **Given** the delete confirmation is shown
- **When** the admin cancels
- **Then** no row is deleted

### Requirement: RLS enforcement (non-admin cannot write)

The system SHALL enforce, via Postgres Row Level Security, that anonymous and non-admin clients can only `SELECT` from `perfumes` and can only read from the public Storage bucket; `INSERT`, `UPDATE`, and `DELETE` SHALL succeed only for the authenticated admin. UI hiding SHALL NOT be the security boundary.

#### Scenario: Anonymous write is rejected at the database

- **Given** a client using only the anon key (no admin session)
- **When** it attempts an `INSERT`, `UPDATE`, or `DELETE` on `perfumes`
- **Then** the request is rejected by RLS regardless of any client-side check

#### Scenario: Authenticated admin write succeeds

- **Given** a client with a valid admin session
- **When** it performs an `INSERT`, `UPDATE`, or `DELETE` on `perfumes`
- **Then** the operation succeeds

#### Scenario: Public can read

- **Given** any client (anonymous or authenticated)
- **When** it performs a `SELECT` on `perfumes`
- **Then** the operation succeeds

### Requirement: Price "Consultar" handling

The system SHALL model a price of `"Consultar"` in the database and map it back to the `number | "Consultar"` union used by the app, so that "Consultar" perfumes render and behave exactly as they do today.

#### Scenario: NULL price maps to "Consultar"

- **Given** a perfume row whose `price` column is `NULL`
- **When** the row is loaded and normalized
- **Then** the app treats its `price` as `"Consultar"`
- **And** the card shows a "Consultar" badge and `formatPrice` renders it accordingly
- **And** its `stock` derives to `"consult"`

#### Scenario: Numeric price maps to number

- **Given** a perfume row whose `price` column is `60000`
- **When** the row is loaded and normalized
- **Then** the app treats its `price` as the number `60000`
- **And** its `stock` derives to `"by-order"`

### Requirement: Admin controls featured perfumes

The system SHALL let an authenticated admin mark or unmark any perfume as featured via an explicit `is_featured` flag, and this flag SHALL be the authoritative source of the perfume's featured status and affect catalog ordering. The previous id/collection heuristic SHALL NOT override the flag.

#### Scenario: Admin marks a perfume as featured

- **Given** an authenticated admin editing a perfume whose `is_featured` is `false`
- **When** they enable the "Destacar" toggle and save
- **Then** the row's `is_featured` column becomes `true`
- **And** after refetch the perfume's `Perfume.isFeatured` is `true`
- **And** it appears under the "Destacados" quick filter and ranks higher in the default (featured) sort

#### Scenario: Admin unmarks a perfume

- **Given** an authenticated admin editing a perfume whose `is_featured` is `true`
- **When** they disable the "Destacar" toggle and save
- **Then** the row's `is_featured` column becomes `false`
- **And** after refetch the perfume is no longer treated as featured, regardless of its `id` or `collection`

#### Scenario: Featured state is visible in the admin list

- **Given** an authenticated admin viewing the perfume list
- **When** the list renders
- **Then** each perfume shows whether it is currently featured (e.g. a star or "Destacado" badge)

#### Scenario: Flag overrides the legacy heuristic

- **Given** an árabe perfume (which the old heuristic would auto-feature) whose `is_featured` is `false`
- **When** it is loaded and normalized
- **Then** its `Perfume.isFeatured` is `false`

### Requirement: Migration correctness

The system SHALL migrate all existing perfumes and their images from the `.ts` data files and `public/imagenes/` into Supabase, such that after migration the catalog renders identically to before, with images served from Storage.

#### Scenario: All existing perfumes are present

- **Given** the current data files contain 55 perfumes (35 regulares, 14 árabes, 5 minis, 1 otro)
- **When** the migration script has run
- **Then** the `perfumes` table contains all 55 rows with correct name, brand, price (NULL for the 12 "Consultar" árabes), gender, category, size, description, and notes
- **And** each row's `collection` is set correctly (`regular`, `arabe`, `mini`, `accesorio`)
- **And** each row's `is_featured` is seeded to match the pre-migration featured set (e.g. `true` for árabes and the current featured regulares) so the featured set does not visually regress

#### Scenario: All images are uploaded and referenced

- **Given** the images referenced by the data files exist under `public/imagenes/`
- **When** the migration script has run
- **Then** each corresponding image is present in the `perfume-images` bucket
- **And** each perfume row's `image_url` points to its public Storage URL
- **And** every card renders its image with no broken links

#### Scenario: Rendering is unchanged

- **Given** a perfume that existed before migration
- **When** it is loaded from Supabase and normalized
- **Then** its derived fields (slug, tags, badges) match what the `.ts` pipeline produced, its `isFeatured` matches the seeded `is_featured` (equal to the pre-migration value), and the card looks the same to a visitor
