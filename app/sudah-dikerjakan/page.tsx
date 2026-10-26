import Link from "next/link";
import { readProyek, readRiwayat } from "@/lib/data";
import { slugProyek } from "@/lib/labels";

const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function fmtTanggal(t: string): string {
  const [y, m, d] = t.split("-");
  return `${parseInt(d, 10)} ${BULAN_ID[parseInt(m, 10) - 1] || m} ${y}`;
}

// Rekap pekerjaan yang sudah dikerjakan. Judul ditulis gaya pesan commit
// GitHub; TANPA link repo/commit (keputusan user). Halaman ini publik.
export default async function SudahDikerjakan({
  searchParams,
}: {
  searchParams: Promise<{ proyek?: string }>;
}) {
  const sp = await searchParams;
  const proyek = readProyek()
    .filter((p) => p.status === "aktif")
    .sort((a, b) => a.urutan - b.urutan);
  const namaProyek = new Map(proyek.map((p) => [p.id, p.nama]));
  const filterSlug = sp.proyek || "";
  const aktif = proyek.find((p) => slugProyek(p.nama) === filterSlug);

  let items = readRiwayat()
    .filter((r) => namaProyek.has(r.proyek_id))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.judul.localeCompare(b.judul));
  if (aktif) items = items.filter((r) => r.proyek_id === aktif.id);

  // Dikelompokkan PER HARI (bukan per bulan); entri tiap hari tetap tampil
  // lengkap di dalam seksinya, terbaru dulu.
  const grup = new Map<string, typeof items>();
  for (const it of items) {
    const k = it.tanggal;
    if (!grup.has(k)) grup.set(k, []);
    grup.get(k)!.push(it);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Sudah dikerjakan</h1>
        <p className="text-slate-500 mt-1">
          Rekap pekerjaan ({items.length} entri)
          {aktif ? ` — ${aktif.nama}` : ""}
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <Link
            href="/sudah-dikerjakan"
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              !aktif ? "bg-blue-700 text-white" : "bg-white text-slate-600"
            }`}
          >
            Semua
          </Link>
          {proyek.map((p) => (
            <Link
              key={p.id}
              href={`/sudah-dikerjakan?proyek=${slugProyek(p.nama)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                aktif?.id === p.id ? "bg-blue-700 text-white" : "bg-white text-slate-600"
              }`}
            >
              {p.nama}
            </Link>
          ))}
        </div>
      </header>

      {items.length === 0 && (
        <p className="text-center text-slate-400">Belum ada rekap pekerjaan.</p>
      )}

      <div className="space-y-6">
        {[...grup.entries()].map(([hari, list]) => (
          <section key={hari} className="border rounded-xl p-4 bg-white">
            <h2 className="text-xl font-bold mb-3">
              {fmtTanggal(hari)} ({list.length})
            </h2>
            <ul className="space-y-2">
              {list.map((it) => (
                <li key={it.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                  <span className="font-medium">{it.judul}</span>
                  <span className="text-slate-400"> — </span>
                  <span className="text-slate-600">{namaProyek.get(it.proyek_id)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="text-center text-xs text-slate-400 mt-10">
        My Project GW — monitoring pengembangan
      </footer>
    </main>
  );
}
