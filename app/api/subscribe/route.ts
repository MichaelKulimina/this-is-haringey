import { NextResponse } from "next/server";

// Phase 6 stub — returns ok immediately.
// Real double opt-in logic (Supabase insert + Resend verification email) is implemented in Phase 6.
export async function POST() {
  return NextResponse.json({ ok: true });
}
