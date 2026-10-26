import { NextRequest, NextResponse } from "next/server";
import { readFitur, writeFitur } from "@/lib/data";

// Body: { proyek_id: string, ids: string[] } — urutan baru dari atas ke bawah.
export async function POST(req: NextRequest) {
  const { proyek_id, ids } = (await req.json().catch(() => ({}))) as {
    proyek_id?: string;
    ids?: string[];
  };
  if (!proyek_id || !Array.isArray(ids)) {
    return NextResponse.json({ ok: false, error: "Data tidak valid" }, { status: 400 });
  }
  const list = readFitur();
  const order = new Map(ids.map((id, i) => [id, i + 1]));
  for (const f of list) {
    if (f.proyek_id === proyek_id && order.has(f.id)) f.urutan = order.get(f.id)!;
  }
  writeFitur(list);
  return NextResponse.json({ ok: true });
}
