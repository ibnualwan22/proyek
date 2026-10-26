import { NextRequest, NextResponse } from "next/server";
import { readFitur, writeFitur, newId, nowISO, type Fitur, type Kesulitan, type Prioritas, type StatusFitur } from "@/lib/data";

const PRIORITAS: Prioritas[] = ["mendesak", "tinggi", "sedang", "rendah"];
const STATUS: StatusFitur[] = ["backlog", "dikerjakan", "testing", "selesai", "tertunda"];
const KESULITAN: Kesulitan[] = ["mudah", "sedang", "sulit"];

export async function GET(req: NextRequest) {
  const proyek_id = req.nextUrl.searchParams.get("proyek_id");
  let list = readFitur();
  if (proyek_id) list = list.filter((f) => f.proyek_id === proyek_id);
  list.sort((a, b) => a.urutan - b.urutan);
  return NextResponse.json({ ok: true, fitur: list });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Fitur>;
  if (!body.proyek_id || !body.judul || !String(body.judul).trim()) {
    return NextResponse.json({ ok: false, error: "Proyek dan judul wajib diisi" }, { status: 400 });
  }
  const list = readFitur();
  const count = list.filter((f) => f.proyek_id === body.proyek_id).length;
  const item: Fitur = {
    id: newId(),
    proyek_id: String(body.proyek_id),
    judul: String(body.judul).trim(),
    deskripsi: String(body.deskripsi || ""),
    prioritas: PRIORITAS.includes(body.prioritas as Prioritas) ? (body.prioritas as Prioritas) : "sedang",
    status: STATUS.includes(body.status as StatusFitur) ? (body.status as StatusFitur) : "backlog",
    kesulitan: KESULITAN.includes(body.kesulitan as Kesulitan) ? (body.kesulitan as Kesulitan) : "sedang",
    urutan: count + 1,
    fokus_minggu: !!body.fokus_minggu,
    fokus_bulan: !!body.fokus_bulan,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  list.push(item);
  writeFitur(list);
  return NextResponse.json({ ok: true, fitur: item });
}
