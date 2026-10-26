import { NextResponse } from "next/server";
import { AUTH_COOKIE, sha256hex } from "@/lib/auth";

export async function POST(req: Request) {
  const { password, remember } = (await req.json().catch(() => ({}))) as {
    password?: string;
    remember?: boolean;
  };
  const expected = process.env.DASHBOARD_PASSWORD || "";
  if (!password || !expected || password !== expected) {
    return NextResponse.json({ ok: false, error: "Password salah" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await sha256hex(expected), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Ingat saya: 30 hari; tidak: 1 hari.
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
  });
  return res;
}
