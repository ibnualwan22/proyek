// Konstanta & tipe bersama — file ini AMAN diimpor komponen client (tanpa 'fs').

export type Prioritas = "mendesak" | "tinggi" | "sedang" | "rendah";
export type StatusFitur = "backlog" | "dikerjakan" | "testing" | "selesai" | "tertunda";
export type Kesulitan = "mudah" | "sedang" | "sulit";
export type TargetPeriode = "minggu" | "bulan" | "";

export interface Proyek {
  id: string;
  nama: string;
  deskripsi: string;
  url: string;
  repo: string;
  status: "aktif" | "arsip";
  urutan: number;
  created_at: string;
}

export interface Fitur {
  id: string;
  proyek_id: string;
  judul: string;
  deskripsi: string;
  prioritas: Prioritas;
  status: StatusFitur;
  kesulitan: Kesulitan;
  urutan: number;
  fokus_minggu: boolean;
  fokus_bulan: boolean;
  created_at: string;
  updated_at: string;
}

export interface Komentar {
  id: string;
  fitur_id: string;
  nama: string;
  isi: string;
  created_at: string;
}

export interface Usulan {
  id: string;
  fitur_id: string;
  nama: string;
  prioritas: Prioritas;
  target: TargetPeriode;
  alasan: string;
  created_at: string;
}

// Jejak pekerjaan yang sudah dikerjakan (rekap). Judul ditulis gaya pesan
// commit GitHub; TANPA link repo/commit di mana pun (keputusan user).
export interface Riwayat {
  id: string;
  proyek_id: string;
  judul: string;
  tanggal: string; // YYYY-MM-DD
  sumber: "github" | "manual";
  sha?: string; // kunci dedup impor GitHub; tidak pernah dirender sebagai link
}

// Slug URL untuk halaman per proyek, diturunkan dari nama:
// "E-Markaz" -> "e-markaz", "E-maliyah" -> "e-maliyah".
export function slugProyek(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PRIORITAS_LABEL: Record<Prioritas, string> = {
  mendesak: "Mendesak",
  tinggi: "Tinggi",
  sedang: "Sedang",
  rendah: "Rendah",
};

export const STATUS_LABEL: Record<StatusFitur, string> = {
  backlog: "Backlog",
  dikerjakan: "Dikerjakan",
  testing: "Testing",
  selesai: "Selesai",
  tertunda: "Tertunda",
};

export const KESULITAN_LABEL: Record<Kesulitan, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export const KESULITAN_DESKRIPSI: Record<Kesulitan, string> = {
  mudah: "hitungan hari",
  sedang: "± 1 minggu",
  sulit: "berminggu-minggu",
};

export const TARGET_LABEL: Record<Exclude<TargetPeriode, "">, string> = {
  minggu: "Minggu ini",
  bulan: "Bulan ini",
};
