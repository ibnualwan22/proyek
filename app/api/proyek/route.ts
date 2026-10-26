import { NextRequest, NextResponse } from "next/server";
import { readProyek, writeProyek, newId, nowISO, type Proyek } from "@/lib/data";

export async function GET() {
  const list = readProyek().sort((a, b) => a.urutan - b.urutan);
  return NextResponse.json({ ok: true, proyek: list });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Proyek>;
  if (!body.nama || !String(body.nama).trim()) {
    return NextResponse.json({ ok: false, error: "Nama proyek wajib diisi" }, { status: 400 });
  }
  const list = readProyek();
  const item: Proyek = {
    id: newId(),
    nama: String(body.nama).trim(),
    deskripsi: String(body.deskripsi || ""),
    url: String(body.url || ""),
    repo: String(body.repo || ""),
    status: "aktif",
    urutan: list.length + 1,
    created_at: nowISO(),
  };
  list.push(item);
  writeProyek(list);
  return NextResponse.json({ ok: true, proyek: item });
}
