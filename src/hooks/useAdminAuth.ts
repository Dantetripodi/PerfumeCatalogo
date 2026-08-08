import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, SUPABASE_CONFIGURED } from "../lib/supabase";

const MISSING_CREDENTIALS =
  "El panel admin necesita las credenciales de Supabase. " +
  "Agregá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a tu archivo .env.local y reiniciá el servidor.";

interface AdminAuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Without real credentials the client points at nothing; skip the round trip
    // so the panel settles into a signed-out state instead of hanging on loading.
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    // Hydrate from current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!SUPABASE_CONFIGURED) return MISSING_CREDENTIALS;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, signIn, signOut };
}
