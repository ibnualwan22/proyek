import { NextRequest, NextResponse } from "next/server";
import { readProyek, writeProyek } from "@/lib/data";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const list = readProyek();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return NextResponse.json({ ok: false, error: "Tidak ditemukan" }, { status: 404 });
  const cur = list[idx];
  list[idx] = {
    ...cur,
    nama: typeof body.nama === "string" && body.nama.trim() ? body.nama.trim() : cur.nama,
    deskripsi: typeof body.deskripsi === "string" ? body.deskripsi : cur.deskripsi,
    url: typeof body.url === "string" ? body.url : cur.url,
    repo: typeof body.repo === "string" ? body.repo : cur.repo,
    status: body.status === "arsip" ? "arsip" : "aktif",
    urutan: typeof body.urutan === "number" ? body.urutan : cur.urutan,
  };
  writeProyek(list);
  return NextResponse.json({ ok: true, proyek: list[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = readProyek().filter((p) => p.id !== id);
  writeProyek(list);
  return NextResponse.json({ ok: true });
}
