"use client";

import { startTransition, useEffect, useState } from "react";
import type { LoginForm, Session } from "@/components/field-app/types";
import { SESSION_KEY } from "@/components/field-app/utils";

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

// Credentials are checked by /api/field-login, which sets the HTTP-only cookie
// the staff API routes require. localStorage only remembers who to show as
// signed in; the cookie is what actually grants access.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Load from localStorage after mount to avoid SSR hydration mismatch, then
  // confirm the server cookie is still valid so an expired session signs out.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const stored = loadSession();
      if (!stored) return;
      setSession(stored);
      fetch("/api/field-login")
        .then((res) => {
          if (res.status === 401) setSession(null);
        })
        .catch(() => {
          // Offline: keep the cached session; API calls will fail on their own.
        });
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  async function login() {
    let res: Response;
    try {
      res = await fetch("/api/field-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
    } catch {
      setLoginError("Couldn't reach the server. Check your connection.");
      return;
    }
    if (!res.ok) {
      setLoginError("Username or password is incorrect.");
      return;
    }
    const user = (await res.json()) as Session;
    startTransition(() => {
      setSession({ id: user.id, name: user.name, role: user.role });
      setLoginError("");
      setLoginForm({ username: "", password: "" });
    });
  }

  function logout() {
    fetch("/api/field-login", { method: "DELETE" }).catch(() => {});
    startTransition(() => {
      setSession(null);
      setLoginError("");
    });
  }

  function updateLoginField(key: keyof LoginForm, value: string) {
    setLoginForm((prev) => ({ ...prev, [key]: value }));
  }

  return { session, loginForm, loginError, login, logout, updateLoginField };
}
