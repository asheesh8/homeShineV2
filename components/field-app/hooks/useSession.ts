"use client";

import { startTransition, useEffect, useState } from "react";
import type { LoginForm, Session } from "@/components/field-app/types";
import { SESSION_KEY } from "@/components/field-app/utils";
import { appUsers } from "@/lib/simple-field";

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

function findUser(username: string, password: string) {
  return appUsers.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Load from localStorage after mount to avoid SSR hydration mismatch
  useEffect(() => {
    const id = window.setTimeout(() => {
      const stored = loadSession();
      if (stored) setSession(stored);
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

  function login() {
    const user = findUser(loginForm.username, loginForm.password);
    if (!user) {
      setLoginError("Username or password is incorrect.");
      return;
    }
    startTransition(() => {
      setSession({ id: user.id, name: user.name, role: user.role });
      setLoginError("");
      setLoginForm({ username: "", password: "" });
    });
  }

  function logout() {
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
