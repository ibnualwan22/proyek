import { NextRequest, NextResponse } from "next/server";
import { readFitur, writeFitur, nowISO, type Kesulitan, type Prioritas, type StatusFitur } from "@/lib/data";

const PRIORITAS: Prioritas[] = ["mendesak", "tinggi", "sedang", "rendah"];
const STATUS: StatusFitur[] = ["backlog", "dikerjakan", "testing", "selesai", "tertunda"];
const KESULITAN: Kesulitan[] = ["mudah", "sedang", "sulit"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const list = readFitur();
  const idx = list.findIndex((f) => f.id === id);
  if (idx < 0) return NextResponse.json({ ok: false, error: "Tidak ditemukan" }, { status: 404 });
  const cur = list[idx];
  list[idx] = {
    ...cur,
    judul: typeof body.judul === "string" && body.judul.trim() ? body.judul.trim() : cur.judul,
    deskripsi: typeof body.deskripsi === "string" ? body.deskripsi : cur.deskripsi,
    prioritas: PRIORITAS.includes(body.prioritas as Prioritas) ? (body.prioritas as Prioritas) : cur.prioritas,
    status: STATUS.includes(body.status as StatusFitur) ? (body.status as StatusFitur) : cur.status,
    kesulitan: KESULITAN.includes(body.kesulitan as Kesulitan) ? (body.kesulitan as Kesulitan) : cur.kesulitan,
    fokus_minggu: typeof body.fokus_minggu === "boolean" ? body.fokus_minggu : cur.fokus_minggu,
    fokus_bulan: typeof body.fokus_bulan === "boolean" ? body.fokus_bulan : cur.fokus_bulan,
    updated_at: nowISO(),
  };
  writeFitur(list);
  return NextResponse.json({ ok: true, fitur: list[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  writeFitur(readFitur().filter((f) => f.id !== id));
  return NextResponse.json({ ok: true });
}
