import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { AUTH_ENABLED, supabase } from "@/services/auth/auth";

interface AuthState {
  ready: boolean;
  session: Session | null;
  enabled: boolean;
}
const Ctx = createContext<AuthState>({ ready: false, session: null, enabled: AUTH_ENABLED });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ ready: !AUTH_ENABLED, session: null, enabled: AUTH_ENABLED });
  useEffect(() => {
    const c = supabase();
    if (!c) return setState((s) => ({ ...s, ready: true }));
    const { data: sub } = c.auth.onAuthStateChange((_e, session) => setState({ ready: true, session, enabled: true }));
    c.auth.getSession().then(({ data }) => setState({ ready: true, session: data.session, enabled: true }));
    return () => sub.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
