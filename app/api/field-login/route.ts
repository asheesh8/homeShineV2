import { NextResponse } from "next/server";

import { endSession, getFieldUser, startSession, unauthorized, verifyCredentials } from "@/lib/field-auth";

/* GET — who is signed in (the client uses this to drop a stale session) */
export async function GET() {
  const user = await getFieldUser();
  if (!user) return unauthorized();
  return NextResponse.json({ id: user.id, name: user.name, role: user.role });
}

/* POST — sign in with { username, password } */
export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const user =
    typeof body.username === "string" && typeof body.password === "string"
      ? verifyCredentials(body.username, body.password)
      : null;
  if (!user) {
    return NextResponse.json({ error: "Username or password is incorrect." }, { status: 401 });
  }

  await startSession(user.id);
  return NextResponse.json({ id: user.id, name: user.name, role: user.role });
}

/* DELETE — sign out */
export async function DELETE() {
  await endSession();
  return NextResponse.json({ ok: true });
}
