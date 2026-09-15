"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AdminUser } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { TOKEN_STORAGE_KEY, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { useHydrated } from "@/hooks/use-hydrated";

const USER_STORAGE_KEY = "tc-admin-user";

type Permission = "canPublish" | "canDelete";

interface AuthContextValue {
  admin: AdminUser | null;
  /** False until localStorage has been read on the client. */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** JWT exp check without verifying the signature — the API does that. */
function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/** Only the fields the panel needs; never keep anything else the API returns. */
const toAdmin = (value: AdminUser): AdminUser => ({
  _id: value._id,
  name: value.name,
  email: value.email,
  role: value.role,
  permissions: {
    canPublish: Boolean(value.permissions?.canPublish),
    canDelete: Boolean(value.permissions?.canDelete),
  },
});

/** Session saved by a previous sign-in, or null when absent, malformed or expired. */
function readStoredAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return token && stored && !tokenExpired(token) ? toAdmin(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // `ready` stays false through hydration, so server and client both render the
  // loading state before the stored session is consulted.
  const ready = useHydrated();
  const [admin, setAdmin] = useState<AdminUser | null>(readStoredAdmin);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    setAdmin(null);
    queryClient.removeQueries({ queryKey: ["admin"] });
  }, [queryClient]);

  useEffect(() => {
    const onUnauthorized = () => {
      clear();
      router.replace("/admin/login?expired=1");
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [clear, router]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, admin: user } = await adminApi.login(email, password);
    const safeUser = toAdmin(user);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
    setAdmin(safeUser);
  }, []);

  const logout = useCallback(() => {
    clear();
    router.replace("/admin/login");
  }, [clear, router]);

  const can = useCallback(
    (permission: Permission) => Boolean(admin && (admin.role === "superadmin" || admin.permissions[permission])),
    [admin],
  );

  const value = useMemo(() => ({ admin, ready, login, logout, can }), [admin, ready, login, logout, can]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}
