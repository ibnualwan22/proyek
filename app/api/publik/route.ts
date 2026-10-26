import { NextRequest, NextResponse } from "next/server";
import { readProyek, readFitur, readKomentar, readUsulan, type Prioritas } from "@/lib/data";

const URUTAN_PRIORITAS: Prioritas[] = ["mendesak", "tinggi", "sedang", "rendah"];

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get("periode");
  const periode = p === "bulan" ? "bulan" : p === "minggu" ? "minggu" : "semua";
  const flag = periode === "bulan" ? "fokus_bulan" : periode === "minggu" ? "fokus_minggu" : null;

  const proyek = readProyek()
    .filter((p) => p.status === "aktif")
    .sort((a, b) => a.urutan - b.urutan);
  const urutanProyek = new Map(proyek.map((p) => [p.id, p.urutan]));
  const namaProyek = new Map(proyek.map((p) => [p.id, p.nama]));

  const semuaFitur = readFitur().filter((f) => urutanProyek.has(f.proyek_id));
  const fitur = flag ? semuaFitur.filter((f) => f[flag]) : semuaFitur;
  const komentar = readKomentar();
  const usulan = readUsulan();

  const perkaya = (f: (typeof fitur)[number]) => ({
    ...f,
    nama_proyek: namaProyek.get(f.proyek_id) || "?",
    jml_komentar: komentar.filter((k) => k.fitur_id === f.id).length,
    jml_usulan: usulan.filter((u) => u.fitur_id === f.id).length,
  });

  const byUrutan = (a: (typeof fitur)[number], b: (typeof fitur)[number]) =>
    (urutanProyek.get(a.proyek_id) || 0) - (urutanProyek.get(b.proyek_id) || 0) || a.urutan - b.urutan;

  const grup = URUTAN_PRIORITAS.map((prioritas) => ({
    prioritas,
    fitur: fitur
      .filter((f) => f.prioritas === prioritas && f.status !== "selesai")
      .sort(byUrutan)
      .map(perkaya),
  })).filter((g) => g.fitur.length > 0);

  const selesai = fitur
    .filter((f) => f.status === "selesai")
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map(perkaya);

  // Project aktif yang belum punya fitur sama sekali.
  const adaFitur = new Set(semuaFitur.map((f) => f.proyek_id));
  const proyek_kosong = proyek
    .filter((p) => !adaFitur.has(p.id))
    .map((p) => ({ id: p.id, nama: p.nama, deskripsi: p.deskripsi, url: p.url }));

  return NextResponse.json({ ok: true, periode, grup, selesai, proyek_kosong });
}
