import Link from "next/link";
import { readProyek } from "@/lib/data";
import { slugProyek } from "@/lib/labels";

// Navigasi sidebar (server component: daftar proyek dibaca dari data).
// Sengaja tanpa penanda aktif (butuh pathname client) — cukup hover.
export default function SidebarNav() {
  const proyek = readProyek()
    .filter((p) => p.status === "aktif")
    .sort((a, b) => a.urutan - b.urutan);

  return (
    <nav className="p-4">
      <Link href="/" className="block font-bold text-lg leading-tight">
        My Project GW
      </Link>
      <p className="text-xs text-slate-400 mb-4 mt-1">Monitoring pengembangan</p>

      <div className="space-y-1 text-sm">
        <Link href="/" className="block px-3 py-2 rounded hover:bg-slate-100 font-medium">
          📊 Dashboard
        </Link>
        <Link
          href="/sudah-dikerjakan"
          className="block px-3 py-2 rounded hover:bg-slate-100 font-medium"
        >
          ✅ Sudah dikerjakan
        </Link>
        <Link href="/admin" className="block px-3 py-2 rounded hover:bg-slate-100 font-medium">
          ⚙️ Admin
        </Link>
      </div>

      <p className="text-xs font-bold text-slate-400 mt-6 mb-2 px-3">PROYEK</p>
      <div className="space-y-1 text-sm">
        {proyek.map((p) => (
          <Link
            key={p.id}
            href={`/proyek/${slugProyek(p.nama)}`}
            className="block px-3 py-2 rounded hover:bg-slate-100"
          >
            {p.nama}
          </Link>
        ))}
      </div>
    </nav>
  );
}
