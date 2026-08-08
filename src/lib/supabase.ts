import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Local review mode: read the catalog from src/data instead of Supabase. */
export const USE_LOCAL_CATALOG = import.meta.env.VITE_USE_LOCAL_CATALOG === "true";

/**
 * False when the env vars are missing. The client below is still constructed so
 * imports do not explode, but it points at nothing — anything that actually
 * talks to Supabase must check this first and say so, otherwise the placeholder
 * key comes back as a bare "Invalid API key" that blames the wrong thing.
 */
export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

// In local-catalog mode nothing ever calls Supabase, so a missing key must not
// white-screen the app — this module is imported at startup and a throw here
// takes the whole catalog down before React mounts.
if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    "Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local";
  if (!USE_LOCAL_CATALOG) throw new Error(message);
  console.warn(`${message} — running with VITE_USE_LOCAL_CATALOG=true, so this is expected.`);
}

export const supabase = createClient(
  supabaseUrl ?? "http://localhost",
  supabaseAnonKey ?? "local-catalog-mode"
);
