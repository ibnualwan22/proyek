import { NextRequest, NextResponse } from "next/server";
import { readKomentar, writeKomentar, newId, nowISO } from "@/lib/data";

export async function GET(req: NextRequest) {
  const fitur_id = req.nextUrl.searchParams.get("fitur_id");
  let list = readKomentar().sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (fitur_id) list = list.filter((k) => k.fitur_id === fitur_id);
  return NextResponse.json({ ok: true, komentar: list });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { fitur_id?: string; nama?: string; isi?: string };
  if (!body.fitur_id || !body.isi || !String(body.isi).trim()) {
    return NextResponse.json({ ok: false, error: "Komentar wajib diisi" }, { status: 400 });
  }
  const isi = String(body.isi).trim().slice(0, 2000);
  const nama = String(body.nama || "Anonim").trim().slice(0, 60) || "Anonim";
  const list = readKomentar();
  const item = { id: newId(), fitur_id: String(body.fitur_id), nama, isi, created_at: nowISO() };
  list.push(item);
  writeKomentar(list);
  return NextResponse.json({ ok: true, komentar: item });
}
