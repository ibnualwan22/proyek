import { notFound } from "next/navigation";
import { readFitur, readProyek, readRiwayat } from "@/lib/data";
import {
  KESULITAN_DESKRIPSI,
  KESULITAN_LABEL,
  PRIORITAS_LABEL,
  STATUS_LABEL,
  slugProyek,
} from "@/lib/labels";

// Halaman per proyek (publik): antrean, yang sedang dikerjakan, fitur yang
// selesai, dan riwayat kerja proyek tersebut. Tanpa link repo (keputusan user).
export default async function ProyekPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proyek = readProyek().find((p) => slugProyek(p.nama) === slug);
  if (!proyek) notFound();

  const fitur = readFitur().filter((f) => f.proyek_id === proyek.id);
  const riwayat = readRiwayat()
    .filter((r) => r.proyek_id === proyek.id)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const dikerjakan = fitur.filter((f) => f.status === "dikerjakan" || f.status === "testing");
  const antrean = fitur.filter(
    (f) => f.status !== "selesai" && f.status !== "dikerjakan" && f.status !== "testing"
  );
  const selesai = fitur.filter((f) => f.status === "selesai");

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{proyek.nama}</h1>
        {proyek.deskripsi && <p className="text-slate-500 mt-1">{proyek.deskripsi}</p>}
        {proyek.url && (
          <a
            href={proyek.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:underline text-sm"
          >
            {proyek.url} ↗
          </a>
        )}
      </header>

      <div className="space-y-6">
        <section className="border-2 rounded-xl p-4 border-blue-400 bg-blue-50">
          <h2 className="text-xl font-bold mb-3 text-blue-800">
            🔨 Sedang dikerjakan ({dikerjakan.length})
          </h2>
          {dikerjakan.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada yang ditandai sedang dikerjakan.</p>
          ) : (
            <ul className="space-y-2">
              {dikerjakan.map((f) => (
                <li key={f.id} className="bg-white border rounded-lg p-3 text-sm">
                  <span className="font-medium">{f.judul}</span>
                  <span className="text-slate-400"> — </span>
                  <span>{STATUS_LABEL[f.status]}</span>
                  <span className="text-slate-400"> · </span>
                  <span>{PRIORITAS_LABEL[f.prioritas]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border rounded-xl p-4 bg-white">
          <h2 className="text-xl font-bold mb-3">Antrean ({antrean.length})</h2>
          {antrean.length === 0 ? (
            <p className="text-sm text-slate-400">Tidak ada antrean.</p>
          ) : (
            <ul className="space-y-2">
              {antrean.map((f) => (
                <li key={f.id} className="border rounded-lg p-3 text-sm">
                  <span className="font-medium">{f.judul}</span>
                  <span className="text-slate-400"> — </span>
                  <span>{PRIORITAS_LABEL[f.prioritas]}</span>
                  <span className="text-slate-400"> · </span>
                  <span>
                    {KESULITAN_LABEL[f.kesulitan]} ({KESULITAN_DESKRIPSI[f.kesulitan]})
                  </span>
                  <span className="text-slate-400"> · </span>
                  <span>{STATUS_LABEL[f.status]}</span>
                  {f.deskripsi && (
                    <p className="text-slate-600 mt-1 whitespace-pre-wrap">{f.deskripsi}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {selesai.length > 0 && (
          <details className="border rounded-xl p-4 bg-white">
            <summary className="cursor-pointer text-green-700 font-medium">
              ✅ Fitur selesai ({selesai.length}) — klik untuk melihat
            </summary>
            <ul className="space-y-2 mt-3">
              {selesai.map((f) => (
                <li key={f.id} className="text-sm">
                  <span className="font-medium">{f.judul}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <section className="border rounded-xl p-4 bg-white">
          <h2 className="text-xl font-bold mb-3">Riwayat kerja ({riwayat.length})</h2>
          {riwayat.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada riwayat kerja.</p>
          ) : (
            <ul className="space-y-2">
              {riwayat.map((r) => (
                <li key={r.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                  <span className="font-medium">{r.judul}</span>
                  <span className="text-slate-400"> · </span>
                  <span className="text-slate-500">{r.tanggal}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
