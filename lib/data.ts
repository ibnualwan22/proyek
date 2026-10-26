import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Fitur, Komentar, Kesulitan, Prioritas, Proyek, StatusFitur, TargetPeriode, Usulan } from "./labels";
export type { Fitur, Komentar, Kesulitan, Prioritas, Proyek, StatusFitur, TargetPeriode, Usulan };

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

function nowISO(): string {
  return new Date().toISOString();
}

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

function readFile<T>(name: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath(name))) return fallback;
    return JSON.parse(fs.readFileSync(filePath(name), "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeFile(name: string, data: unknown): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = filePath(name) + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath(name));
}

function seedIfEmpty(): void {
  const existing = readFile<{ proyek: Proyek[] }>("proyek", { proyek: [] });
  if (existing.proyek.length > 0) return;
  const seed: Proyek[] = [
    { id: randomUUID(), nama: "Siakad", deskripsi: "Sistem informasi akademik Markaz Arabiyah", url: "https://siakad.markazarabiyah.site", repo: "ibnualwan22/siakad-markaz-v2", status: "aktif", urutan: 1, created_at: nowISO() },
    { id: randomUUID(), nama: "PPDB", deskripsi: "Penerimaan santri baru", url: "", repo: "ibnualwan22/ppdb_markaz", status: "aktif", urutan: 2, created_at: nowISO() },
    { id: randomUUID(), nama: "E-Markaz", deskripsi: "Portal pengajar", url: "https://e-markaz-omega.vercel.app", repo: "ibnualwan22/e-markaz", status: "aktif", urutan: 3, created_at: nowISO() },
    { id: randomUUID(), nama: "Dashboard Keuangan", deskripsi: "Pencatat keuangan pribadi", url: "https://keuangan.markazarabiyah.site", repo: "", status: "aktif", urutan: 4, created_at: nowISO() },
  ];
  writeFile("proyek", { proyek: seed });
  writeFile("fitur", { fitur: [] });
  writeFile("komentar", { komentar: [] });
  writeFile("usulan", { usulan: [] });
}

export function readProyek(): Proyek[] {
  seedIfEmpty();
  return readFile<{ proyek: Proyek[] }>("proyek", { proyek: [] }).proyek;
}
export function writeProyek(list: Proyek[]): void {
  seedIfEmpty();
  writeFile("proyek", { proyek: list });
}
const KESULITAN_VALID: Kesulitan[] = ["mudah", "sedang", "sulit"];

export function readFitur(): Fitur[] {
  seedIfEmpty();
  const raw = readFile<{ fitur: Fitur[] }>("fitur", { fitur: [] }).fitur;
  // Normalisasi: data lama mungkin belum punya field kesulitan.
  return raw.map((f) => ({
    ...f,
    kesulitan: KESULITAN_VALID.includes(f.kesulitan) ? f.kesulitan : ("sedang" as Kesulitan),
  }));
}
export function writeFitur(list: Fitur[]): void {
  writeFile("fitur", { fitur: list });
}
export function readKomentar(): Komentar[] {
  seedIfEmpty();
  return readFile<{ komentar: Komentar[] }>("komentar", { komentar: [] }).komentar;
}
export function writeKomentar(list: Komentar[]): void {
  writeFile("komentar", { komentar: list });
}
export function readUsulan(): Usulan[] {
  seedIfEmpty();
  return readFile<{ usulan: Usulan[] }>("usulan", { usulan: [] }).usulan;
}
export function writeUsulan(list: Usulan[]): void {
  writeFile("usulan", { usulan: list });
}

export function newId(): string {
  return randomUUID().slice(0, 8);
}
export { nowISO };
