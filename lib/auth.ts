export const AUTH_COOKIE = "mpgw_auth";

export async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAuthed(cookieVal: string | undefined): Promise<boolean> {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw || !cookieVal) return false;
  return cookieVal === (await sha256hex(pw));
}
