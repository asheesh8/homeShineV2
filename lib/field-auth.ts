import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { appUsers, type UserId } from "@/lib/simple-field";

/*
 * Server-side sign-in for the field app.
 *
 * Passwords live only in the FIELD_APP_USERS environment variable
 * ("steven:<password>,beth:<password>"), never in the client bundle. A
 * successful sign-in sets an HTTP-only cookie signed with FIELD_SESSION_SECRET,
 * and every staff API route checks that cookie before touching Supabase — those
 * routes run with the service-role key, so the cookie is the only thing
 * standing between the public internet and customer records.
 */

const COOKIE_NAME = "hs_field_session";
const SESSION_DAYS = 30;

function sessionSecret(): string {
  const secret = process.env.FIELD_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("FIELD_SESSION_SECRET must be set to 32+ random characters.");
  }
  return secret;
}

function configuredPasswords(): Map<string, string> {
  const users = new Map<string, string>();
  for (const entry of (process.env.FIELD_APP_USERS ?? "").split(",")) {
    const split = entry.indexOf(":");
    if (split > 0) users.set(entry.slice(0, split).trim().toLowerCase(), entry.slice(split + 1));
  }
  return users;
}

// Hash both sides first so the comparison is constant-time regardless of length.
function sameSecret(a: string, b: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function verifyCredentials(username: string, password: string) {
  const key = username.trim().toLowerCase();
  const expected = configuredPasswords().get(key);
  const user = appUsers.find((u) => u.username === key);
  if (!user || !expected || !sameSecret(password, expected)) return null;
  return user;
}

export async function startSession(userId: UserId) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE_NAME);
}

/** The signed-in staff member, or null when the cookie is missing, forged or expired. */
export async function getFieldUser() {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [userId, expires, signature] = raw.split(".");
  if (!userId || !expires || !signature) return null;
  if (!sameSecret(signature, sign(`${userId}.${expires}`))) return null;
  if (Number(expires) < Date.now()) return null;
  return appUsers.find((u) => u.id === userId) ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Sign in required." }, { status: 401 });
}
