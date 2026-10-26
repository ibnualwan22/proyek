import { NextRequest, NextResponse } from "next/server";
import { readUsulan, writeUsulan, readFitur, readProyek, newId, nowISO, type Prioritas, type TargetPeriode } from "@/lib/data";

const PRIORITAS: Prioritas[] = ["mendesak", "tinggi", "sedang", "rendah"];
const TARGET: TargetPeriode[] = ["minggu", "bulan", ""];

export async function GET() {
  const fitur = readFitur();
  const proyek = readProyek();
  const list = readUsulan()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((u) => {
      const f = fitur.find((x) => x.id === u.fitur_id);
      const p = proyek.find((x) => x.id === f?.proyek_id);
      return { ...u, judul_fitur: f?.judul || "?", nama_proyek: p?.nama || "?" };
    });
  return NextResponse.json({ ok: true, usulan: list });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    fitur_id?: string;
    nama?: string;
    prioritas?: string;
    target?: string;
    alasan?: string;
  };
  if (!body.fitur_id || !PRIORITAS.includes(body.prioritas as Prioritas)) {
    return NextResponse.json({ ok: false, error: "Data tidak valid" }, { status: 400 });
  }
  const nama = String(body.nama || "Anonim").trim().slice(0, 60) || "Anonim";
  const alasan = String(body.alasan || "").trim().slice(0, 1000);
  const target: TargetPeriode = TARGET.includes(body.target as TargetPeriode)
    ? (body.target as TargetPeriode)
    : "";
  const list = readUsulan();
  const item = {
    id: newId(),
    fitur_id: String(body.fitur_id),
    nama,
    prioritas: body.prioritas as Prioritas,
    target,
    alasan,
    created_at: nowISO(),
  };
  list.push(item);
  writeUsulan(list);
  return NextResponse.json({ ok: true, usulan: item });
}
