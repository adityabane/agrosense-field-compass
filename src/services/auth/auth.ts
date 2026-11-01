import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** Supabase Auth is enabled only when its env vars are present. */
export const AUTH_ENABLED = Boolean(url && key);

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!AUTH_ENABLED || typeof window === "undefined") return null;
  if (!client) client = createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

export async function getSession(): Promise<Session | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session;
}

export async function getAccessToken() {
  return (await getSession())?.access_token ?? null;
}

export async function signIn(email: string, password: string) {
  const c = supabase();
  if (!c) throw new Error("Authentication is not configured.");
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string) {
  const c = supabase();
  if (!c) throw new Error("Authentication is not configured.");
  const { data, error } = await c.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
  if (error) throw error;
  return data.session !== null;
}

export async function signOut() {
  await supabase()?.auth.signOut();
}

export async function handleSessionExpired() {
  const c = supabase();
  if (!c) return;
  const { error } = await c.auth.refreshSession();
  if (error) {
    await c.auth.signOut();
    if (typeof window !== "undefined") window.location.assign("/login?expired=1");
  }
}
