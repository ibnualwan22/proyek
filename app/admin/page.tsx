"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KESULITAN_DESKRIPSI,
  KESULITAN_LABEL,
  PRIORITAS_LABEL,
  STATUS_LABEL,
  type Fitur,
  type Kesulitan,
  type Prioritas,
  type Proyek,
  type StatusFitur,
} from "@/lib/labels";

const PRIORITAS_KEYS = Object.keys(PRIORITAS_LABEL) as Prioritas[];
const STATUS_KEYS = Object.keys(STATUS_LABEL) as StatusFitur[];
const KESULITAN_KEYS = Object.keys(KESULITAN_LABEL) as Kesulitan[];

const inputCls = "w-full border rounded px-3 py-1.5 text-sm";
const btnPrimary = "bg-blue-700 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-800";
const btnGhost = "text-sm px-3 py-1.5 rounded border hover:bg-slate-100";

async function api(path: string, method = "GET", body?: unknown) {
  const r = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (r.status === 401) throw new Error("UNAUTH");
  return r.json();
}

function ProyekForm({
  awal,
  onBatal,
  onSimpan,
}: {
  awal?: Partial<Proyek>;
  onBatal: () => void;
  onSimpan: (d: Partial<Proyek>) => void;
}) {
  const [nama, setNama] = useState(awal?.nama || "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi || "");
  const [url, setUrl] = useState(awal?.url || "");
  const [repo, setRepo] = useState(awal?.repo || "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSimpan({ nama, deskripsi, url, repo });
      }}
      className="bg-white border rounded-lg p-4 space-y-2"
    >
      <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama web/project *" required className={inputCls} />
      <input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat" className={inputCls} />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (https://...)" className={inputCls} />
      <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="Repo (owner/nama)" className={inputCls} />
      <div className="flex gap-2">
        <button className={btnPrimary}>Simpan</button>
        <button type="button" onClick={onBatal} className={btnGhost}>Batal</button>
      </div>
    </form>
  );
}

function FiturForm({
  awal,
  onBatal,
  onSimpan,
}: {
  awal?: Partial<Fitur>;
  onBatal: () => void;
  onSimpan: (d: Partial<Fitur>) => void;
}) {
  const [judul, setJudul] = useState(awal?.judul || "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi || "");
  const [prioritas, setPrioritas] = useState<Prioritas>(awal?.prioritas || "sedang");
  const [status, setStatus] = useState<StatusFitur>(awal?.status || "backlog");
  const [kesulitan, setKesulitan] = useState<Kesulitan>(awal?.kesulitan || "sedang");
  const [fokusMinggu, setFokusMinggu] = useState(!!awal?.fokus_minggu);
  const [fokusBulan, setFokusBulan] = useState(!!awal?.fokus_bulan);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSimpan({ judul, deskripsi, prioritas, status, kesulitan, fokus_minggu: fokusMinggu, fokus_bulan: fokusBulan });
      }}
      className="bg-white border rounded-lg p-4 space-y-2"
    >
      <input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul fitur/jobdesk *" required className={inputCls} />
      <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi" rows={2} className={inputCls} />
      <div className="grid grid-cols-3 gap-2">
        <select value={prioritas} onChange={(e) => setPrioritas(e.target.value as Prioritas)} className={inputCls}>
          {PRIORITAS_KEYS.map((p) => (
            <option key={p} value={p}>{PRIORITAS_LABEL[p]}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFitur)} className={inputCls}>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select value={kesulitan} onChange={(e) => setKesulitan(e.target.value as Kesulitan)} className={inputCls} title="Tingkat kesulitan">
          {KESULITAN_KEYS.map((k) => (
            <option key={k} value={k}>{KESULITAN_LABEL[k]} ({KESULITAN_DESKRIPSI[k]})</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={fokusMinggu} onChange={(e) => setFokusMinggu(e.target.checked)} />
          Fokus minggu ini
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={fokusBulan} onChange={(e) => setFokusBulan(e.target.checked)} />
          Fokus bulan ini
        </label>
      </div>
      <div className="flex gap-2">
        <button className={btnPrimary}>Simpan</button>
        <button type="button" onClick={onBatal} className={btnGhost}>Batal</button>
      </div>
    </form>
  );
}

export default function Admin() {
  const router = useRouter();
  const [tab, setTab] = useState<"proyek" | "moderasi">("proyek");
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [proyekAktif, setProyekAktif] = useState<string>("");
  const [fiturList, setFiturList] = useState<Fitur[]>([]);
  const [showProyekForm, setShowProyekForm] = useState(false);
  const [editProyekId, setEditProyekId] = useState<string | null>(null);
  const [showFiturForm, setShowFiturForm] = useState(false);
  const [editFiturId, setEditFiturId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [komentar, setKomentar] = useState<any[]>([]);
  const [usulan, setUsulan] = useState<any[]>([]);

  function keLogin() {
    router.push("/login");
  }

  async function muatProyek() {
    try {
      const j = await api("/api/proyek");
      setProyekList(j.proyek);
      if (j.proyek.length > 0 && !proyekAktif) setProyekAktif(j.proyek[0].id);
    } catch (e) {
      if ((e as Error).message === "UNAUTH") keLogin();
    }
  }

  async function muatFitur(pid: string) {
    try {
      const j = await api(`/api/fitur?proyek_id=${pid}`);
      setFiturList(j.fitur);
    } catch (e) {
      if ((e as Error).message === "UNAUTH") keLogin();
    }
  }

  async function muatModerasi() {
    try {
      const [jk, ju] = await Promise.all([api("/api/komentar"), api("/api/usulan")]);
      setKomentar(jk.komentar);
      setUsulan(ju.usulan);
    } catch (e) {
      if ((e as Error).message === "UNAUTH") keLogin();
    }
  }

  useEffect(() => {
    muatProyek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (proyekAktif) muatFitur(proyekAktif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyekAktif]);

  useEffect(() => {
    if (tab === "moderasi") muatModerasi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab ]);

  async function simpanProyek(d: Partial<Proyek>) {
    if (editProyekId) await api(`/api/proyek/${editProyekId}`, "PUT", d);
    else await api("/api/proyek", "POST", d);
    setShowProyekForm(false);
    setEditProyekId(null);
    muatProyek();
  }

  async function arsipProyek(p: Proyek) {
    if (!confirm(`Arsipkan "${p.nama}"?`)) return;
    await api(`/api/proyek/${p.id}`, "PUT", { status: "arsip" });
    muatProyek();
  }

  async function hapusProyek(p: Proyek) {
    if (!confirm(`Hapus permanen "${p.nama}" beserta semua fiturnya?`)) return;
    await api(`/api/proyek/${p.id}`, "DELETE");
    setProyekAktif("");
    muatProyek();
  }

  async function simpanFitur(d: Partial<Fitur>) {
    if (editFiturId) await api(`/api/fitur/${editFiturId}`, "PUT", d);
    else await api("/api/fitur", "POST", { ...d, proyek_id: proyekAktif });
    setShowFiturForm(false);
    setEditFiturId(null);
    muatFitur(proyekAktif);
  }

  async function hapusFitur(f: Fitur) {
    if (!confirm(`Hapus "${f.judul}"?`)) return;
    await api(`/api/fitur/${f.id}`, "DELETE");
    muatFitur(proyekAktif);
  }

  async function toggleFokus(f: Fitur, field: "fokus_minggu" | "fokus_bulan") {
    await api(`/api/fitur/${f.id}`, "PUT", { [field]: !f[field] });
    muatFitur(proyekAktif);
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = fiturList.map((f) => f.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ...ids.splice(from, 1));
    api("/api/fitur/reorder", "POST", { proyek_id: proyekAktif, ids }).then(() => muatFitur(proyekAktif));
    setDragId(null);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  const proyek = proyekList.find((p) => p.id === proyekAktif);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Project GW — Admin</h1>
        <button onClick={logout} className={btnGhost}>Keluar</button>
      </header>

      <div className="inline-flex bg-white border rounded-full p-1 mb-6">
        {(["proyek", "moderasi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium ${tab === t ? "bg-blue-700 text-white" : "text-slate-600"}`}
          >
            {t === "proyek" ? "Proyek & Fitur" : "Moderasi"}
          </button>
        ))}
      </div>

      {tab === "proyek" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">Proyek</h2>
              <button onClick={() => { setEditProyekId(null); setShowProyekForm(true); }} className={btnPrimary}>+ Proyek</button>
            </div>
            {showProyekForm && !editProyekId && (
              <ProyekForm onBatal={() => setShowProyekForm(false)} onSimpan={simpanProyek} />
            )}
            <div className="space-y-2 mt-2">
              {proyekList.map((p) => (
                <div
                  key={p.id}
                  className={`border rounded-lg p-3 ${p.id === proyekAktif ? "border-blue-600 bg-blue-50" : "bg-white"}`}
                >
                  {editProyekId === p.id ? (
                    <ProyekForm awal={p} onBatal={() => setEditProyekId(null)} onSimpan={simpanProyek} />
                  ) : (
                    <>
                      <button onClick={() => setProyekAktif(p.id)} className="font-medium text-left w-full">
                        {p.nama} {p.status === "arsip" && <span className="text-xs text-slate-400">(arsip)</span>}
                      </button>
                      <div className="flex gap-2 mt-1 text-xs">
                        <button onClick={() => setEditProyekId(p.id)} className="text-blue-700 hover:underline">Edit</button>
                        {p.status === "aktif" ? (
                          <button onClick={() => arsipProyek(p)} className="text-orange-700 hover:underline">Arsipkan</button>
                        ) : (
                          <button onClick={() => api(`/api/proyek/${p.id}`, "PUT", { status: "aktif" }).then(muatProyek)} className="text-green-700 hover:underline">Aktifkan</button>
                        )}
                        <button onClick={() => hapusProyek(p)} className="text-red-700 hover:underline">Hapus</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">Fitur — {proyek?.nama || "-"}</h2>
              {proyek && (
                <button onClick={() => { setEditFiturId(null); setShowFiturForm(true); }} className={btnPrimary}>+ Fitur</button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-2">Seret kartu untuk mengubah urutan prioritas.</p>
            {showFiturForm && !editFiturId && (
              <div className="mb-2">
                <FiturForm onBatal={() => setShowFiturForm(false)} onSimpan={simpanFitur} />
              </div>
            )}
            <div className="space-y-2">
              {fiturList.map((f, i) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={() => setDragId(f.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(f.id)}
                  className={`bg-white border rounded-lg p-3 ${dragId === f.id ? "opacity-40" : ""}`}
                >
                  {editFiturId === f.id ? (
                    <FiturForm awal={f} onBatal={() => setEditFiturId(null)} onSimpan={simpanFitur} />
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="cursor-grab text-slate-300 select-none" title="Seret untuk ubah urutan">⠿</span>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-slate-400 font-mono">#{i + 1}</span>
                            <span className="font-medium">{f.judul}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border">{PRIORITAS_LABEL[f.prioritas]}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border">{STATUS_LABEL[f.status]}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border" title={`Estimasi: ${KESULITAN_DESKRIPSI[f.kesulitan]}`}>
                              {KESULITAN_LABEL[f.kesulitan]}
                            </span>
                            <button
                              onClick={() => toggleFokus(f, "fokus_minggu")}
                              title="Tampil di 'Minggu ini'"
                              className={`px-2 py-0.5 rounded-full border ${f.fokus_minggu ? "bg-green-100 text-green-800 border-green-300" : "text-slate-400"}`}
                            >
                              Minggu ini
                            </button>
                            <button
                              onClick={() => toggleFokus(f, "fokus_bulan")}
                              title="Tampil di 'Bulan ini'"
                              className={`px-2 py-0.5 rounded-full border ${f.fokus_bulan ? "bg-green-100 text-green-800 border-green-300" : "text-slate-400"}`}
                            >
                              Bulan ini
                            </button>
                          </div>
                          {f.deskripsi && <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{f.deskripsi}</p>}
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                          <button onClick={() => setEditFiturId(f.id)} className="text-blue-700 hover:underline">Edit</button>
                          <button onClick={() => hapusFitur(f)} className="text-red-700 hover:underline">Hapus</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {proyek && fiturList.length === 0 && (
                <p className="text-sm text-slate-400">Belum ada fitur. Tambahkan yang pertama.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "moderasi" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-bold mb-2">Komentar ({komentar.length})</h2>
            <div className="space-y-2">
              {komentar.map((k: any) => (
                <div key={k.id} className="bg-white border rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{k.nama}</span>
                    <button
                      onClick={() => api(`/api/komentar/${k.id}`, "DELETE").then(muatModerasi)}
                      className="text-red-700 hover:underline text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                  <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{k.isi}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(k.created_at).toLocaleString("id-ID")}</p>
                </div>
              ))}
              {komentar.length === 0 && <p className="text-sm text-slate-400">Belum ada komentar.</p>}
            </div>
          </div>
          <div>
            <h2 className="font-bold mb-2">Usulan Prioritas ({usulan.length})</h2>
            <div className="space-y-2">
              {usulan.map((u: any) => (
                <div key={u.id} className="bg-white border rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{u.nama}</span>
                    <button
                      onClick={() => api(`/api/usulan/${u.id}`, "DELETE").then(muatModerasi)}
                      className="text-red-700 hover:underline text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                  <p className="mt-0.5">
                    <span className="text-slate-500">Fitur:</span> {u.judul_fitur} <span className="text-slate-400">({u.nama_proyek})</span>
                  </p>
                  <p className="mt-0.5">
                    <span className="text-slate-500">Usulan:</span>{" "}
                    <span className="font-medium">{PRIORITAS_LABEL[u.prioritas as Prioritas]}</span>
                    {u.target && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        Target: {u.target === "minggu" ? "Minggu ini" : "Bulan ini"}
                      </span>
                    )}
                  </p>
                  {u.alasan && <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{u.alasan}</p>}
                  <p className="text-xs text-slate-400 mt-1">{new Date(u.created_at).toLocaleString("id-ID")}</p>
                </div>
              ))}
              {usulan.length === 0 && <p className="text-sm text-slate-400">Belum ada usulan.</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
