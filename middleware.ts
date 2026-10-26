import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, isAuthed } from "./lib/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/api/login", "/api/logout", "/api/health", "/api/publik"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  // Komentar: publik boleh baca & kirim; hapus hanya admin.
  if (pathname === "/api/komentar" && (method === "GET" || method === "POST")) return NextResponse.next();
  // Usulan: publik boleh kirim; baca & hapus hanya admin.
  if (pathname === "/api/usulan" && method === "POST") return NextResponse.next();

  const ok = await isAuthed(req.cookies.get(AUTH_COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
