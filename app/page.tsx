"use client";

import { useEffect, useState } from "react";
import {
  KESULITAN_DESKRIPSI,
  KESULITAN_LABEL,
  PRIORITAS_LABEL,
  STATUS_LABEL,
  TARGET_LABEL,
  type Kesulitan,
  type Prioritas,
  type TargetPeriode,
} from "@/lib/labels";

interface FiturPublik {
  id: string;
  judul: string;
  deskripsi: string;
  prioritas: Prioritas;
  status: keyof typeof STATUS_LABEL;
  kesulitan: Kesulitan;
  nama_proyek: string;
  jml_komentar: number;
  jml_usulan: number;
  updated_at: string;
}

interface GrupPrioritas {
  prioritas: Prioritas;
  fitur: FiturPublik[];
}

interface ProyekKosong {
  id: string;
  nama: string;
  deskripsi: string;
  url: string;
}

const WARNA_GRUP: Record<string, string> = {
  mendesak: "border-red-400 bg-red-50",
  tinggi: "border-orange-400 bg-orange-50",
  sedang: "border-yellow-400 bg-yellow-50",
  rendah: "border-slate-300 bg-slate-50",
};

const WARNA_JUDUL_GRUP: Record<string, string> = {
  mendesak: "text-red-800",
  tinggi: "text-orange-800",
  sedang: "text-yellow-800",
  rendah: "text-slate-700",
};

const WARNA_STATUS: Record<string, string> = {
  backlog: "bg-slate-100 text-slate-600",
  dikerjakan: "bg-blue-100 text-blue-800",
  testing: "bg-purple-100 text-purple-800",
  selesai: "bg-green-100 text-green-800",
  tertunda: "bg-orange-100 text-orange-800",
};

const WARNA_KESULITAN: Record<string, string> = {
  mudah: "bg-green-100 text-green-800 border-green-300",
  sedang: "bg-yellow-100 text-yellow-800 border-yellow-300",
  sulit: "bg-red-100 text-red-800 border-red-300",
};

function Badge({ className, children, title }: { className: string; children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className={`text-xs px-2 py-0.5 rounded-full border ${className}`}>
      {children}
    </span>
  );
}

function FiturCard({ fitur }: { fitur: FiturPublik }) {
  const [tab, setTab] = useState<"komentar" | "usulan" | null>(null);
  const [komentar, setKomentar] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [isi, setIsi] = useState("");
  const [prioritas, setPrioritas] = useState<Prioritas>("tinggi");
  const [target, setTarget] = useState<TargetPeriode>("");
  const [alasan, setAlasan] = useState("");
  const [pesan, setPesan] = useState("");

  async function muatKomentar() {
    const r = await fetch(`/api/komentar?fitur_id=${fitur.id}`);
    const j = await r.json();
    if (j.ok) setKomentar(j.komentar);
  }

  function buka(t: "komentar" | "usulan") {
    if (tab === t) {
      setTab(null);
      return;
    }
    setTab(t);
    setPesan("");
    if (t === "komentar") muatKomentar();
  }

  async function kirimKomentar(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");
    const r = await fetch("/api/komentar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fitur_id: fitur.id, nama, isi }),
    });
    const j = await r.json();
    if (j.ok) {
      setIsi("");
      setPesan("Komentar terkirim.");
      muatKomentar();
    } else setPesan(j.error || "Gagal mengirim.");
  }

  async function kirimUsulan(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");
    const r = await fetch("/api/usulan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fitur_id: fitur.id, nama, prioritas, target, alasan }),
    });
    const j = await r.json();
    if (j.ok) {
      setAlasan("");
      setTarget("");
      setPesan("Usulan prioritas terkirim. Terima kasih!");
    } else setPesan(j.error || "Gagal mengirim.");
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{fitur.judul}</span>
        <Badge className="bg-slate-100 text-slate-700 border-slate-300">{fitur.nama_proyek}</Badge>
        <Badge
          className={WARNA_KESULITAN[fitur.kesulitan] || ""}
          title={`Estimasi: ${KESULITAN_DESKRIPSI[fitur.kesulitan]}`}
        >
          {KESULITAN_LABEL[fitur.kesulitan]} · {KESULITAN_DESKRIPSI[fitur.kesulitan]}
        </Badge>
        <Badge className={WARNA_STATUS[fitur.status] || ""}>{STATUS_LABEL[fitur.status]}</Badge>
      </div>
      {fitur.deskripsi && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{fitur.deskripsi}</p>}
      <div className="flex gap-3 mt-2 text-sm">
        <button onClick={() => buka("komentar")} className="text-blue-700 hover:underline">
          💬 Komentar ({fitur.jml_komentar})
        </button>
        <button onClick={() => buka("usulan")} className="text-blue-700 hover:underline">
          📌 Usulkan prioritas ({fitur.jml_usulan})
        </button>
      </div>

      {tab === "komentar" && (
        <div className="mt-3 border-t pt-3">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {komentar.length === 0 && <p className="text-sm text-slate-400">Belum ada komentar.</p>}
            {komentar.map((k) => (
              <div key={k.id} className="text-sm bg-slate-50 rounded p-2">
                <span className="font-medium">{k.nama}</span>{" "}
                <span className="text-slate-400 text-xs">{new Date(k.created_at).toLocaleString("id-ID")}</span>
                <p className="mt-0.5 whitespace-pre-wrap">{k.isi}</p>
              </div>
            ))}
          </div>
          <form onSubmit={kirimKomentar} className="mt-3 space-y-2">
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama (opsional)"
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
            <textarea
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Tulis komentar..."
              required
              rows={2}
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
            <button className="bg-blue-700 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-800">
              Kirim komentar
            </button>
          </form>
        </div>
      )}

      {tab === "usulan" && (
        <div className="mt-3 border-t pt-3">
          <form onSubmit={kirimUsulan} className="space-y-2">
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama (opsional)"
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
            <select
              value={prioritas}
              onChange={(e) => setPrioritas(e.target.value as Prioritas)}
              className="w-full border rounded px-3 py-1.5 text-sm"
            >
              {(Object.keys(PRIORITAS_LABEL) as Prioritas[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITAS_LABEL[p]}
                </option>
              ))}
            </select>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as TargetPeriode)}
              className="w-full border rounded px-3 py-1.5 text-sm"
            >
              <option value="">Target: tidak spesifik</option>
              <option value="minggu">{TARGET_LABEL.minggu}</option>
              <option value="bulan">{TARGET_LABEL.bulan}</option>
            </select>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Alasan (opsional)"
              rows={2}
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
            <button className="bg-blue-700 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-800">
              Kirim usulan
            </button>
          </form>
        </div>
      )}
      {pesan && <p className="text-sm text-green-700 mt-2">{pesan}</p>}
    </div>
  );
}

export default function HalamanPublik() {
  const [periode, setPeriode] = useState<"semua" | "minggu" | "bulan">("semua");
  const [grup, setGrup] = useState<GrupPrioritas[]>([]);
  const [selesai, setSelesai] = useState<FiturPublik[]>([]);
  const [proyekKosong, setProyekKosong] = useState<ProyekKosong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/publik?periode=${periode}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setGrup(j.grup);
          setSelesai(j.selesai);
          setProyekKosong(j.proyek_kosong || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [periode]);

  // Dashboard = yang sedang dikerjakan: pisahkan dari grup prioritas agar
  // tampil di seksi sendiri di atas antrean.
  const dikerjakan = grup.flatMap((g) =>
    g.fitur.filter((f) => f.status === "dikerjakan" || f.status === "testing")
  );
  const sisaGrup = grup
    .map((g) => ({
      ...g,
      fitur: g.fitur.filter((f) => f.status !== "dikerjakan" && f.status !== "testing"),
    }))
    .filter((g) => g.fitur.length > 0);
  const kosong =
    dikerjakan.length === 0 &&
    sisaGrup.length === 0 &&
    selesai.length === 0 &&
    proyekKosong.length === 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">My Project GW</h1>
        <p className="text-slate-500 mt-1">Prioritas pengembangan project</p>
        <div className="inline-flex bg-white border rounded-full p-1 mt-4">
          {(["semua", "minggu", "bulan"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium ${
                periode === p ? "bg-blue-700 text-white" : "text-slate-600"
              }`}
            >
              {p === "semua" ? "Semua" : p === "minggu" ? "Minggu ini" : "Bulan ini"}
            </button>
          ))}
        </div>
      </header>

      {loading && <p className="text-center text-slate-400">Memuat...</p>}

      {!loading && kosong && (
        <p className="text-center text-slate-400">Belum ada prioritas untuk periode ini.</p>
      )}

      <div className="space-y-6">
        {!loading && (
          <section className="border-2 rounded-xl p-4 border-blue-400 bg-blue-50">
            <h2 className="text-xl font-bold mb-3 text-blue-800">
              🔨 Sedang dikerjakan ({dikerjakan.length})
            </h2>
            {dikerjakan.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada pekerjaan yang ditandai sedang dikerjakan untuk periode ini.
              </p>
            ) : (
              <div className="space-y-3">
                {dikerjakan.map((f) => (
                  <FiturCard key={f.id} fitur={f} />
                ))}
              </div>
            )}
          </section>
        )}

        {sisaGrup.map((g) => (
          <section key={g.prioritas} className={`border-2 rounded-xl p-4 ${WARNA_GRUP[g.prioritas]}`}>
            <h2 className={`text-xl font-bold mb-3 ${WARNA_JUDUL_GRUP[g.prioritas]}`}>
              {PRIORITAS_LABEL[g.prioritas]} ({g.fitur.length})
            </h2>
            <div className="space-y-3">
              {g.fitur.map((f) => (
                <FiturCard key={f.id} fitur={f} />
              ))}
            </div>
          </section>
        ))}

        {selesai.length > 0 && (
          <details className="border rounded-xl p-4 bg-white">
            <summary className="cursor-pointer text-green-700 font-medium">
              ✅ Sudah selesai ({selesai.length}) — klik untuk melihat
            </summary>
            <div className="space-y-3 mt-3">
              {selesai.map((f) => (
                <FiturCard key={f.id} fitur={f} />
              ))}
            </div>
          </details>
        )}

        {periode === "semua" && proyekKosong.length > 0 && (
          <section className="border border-dashed rounded-xl p-4 bg-white">
            <h2 className="font-bold text-slate-500 mb-2">
              📋 Belum ada fitur terdaftar ({proyekKosong.length})
            </h2>
            <ul className="space-y-1 text-sm">
              {proyekKosong.map((p) => (
                <li key={p.id} className="text-slate-600">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                      {p.nama} ↗
                    </a>
                  ) : (
                    <span className="font-medium">{p.nama}</span>
                  )}
                  {p.deskripsi && <span className="text-slate-400"> — {p.deskripsi}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="text-center text-xs text-slate-400 mt-10">
        My Project GW — monitoring pengembangan
      </footer>
    </main>
  );
}
