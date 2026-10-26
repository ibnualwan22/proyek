// Impor riwayat kerja dari commit GitHub (branch main) sejak 2026-10-01.
// Tiap commit non-merge menjadi satu entri riwayat: judul = pesan commit,
// tanggal = tanggal commit. TANPA link repo/commit (keputusan user).
// Idempotent: entri dikenali dari sha, commit yang sudah ada dilewati.
//
// Pemakaian:
//   DATA_DIR=/home/hatch/.my-project-gw/data node scripts/import-riwayat.mjs
//
// Catatan: memakai clone dangkal (--shallow-since) ke /tmp, bukan GitHub API,
// supaya tidak bergantung pada token/rate limit.

import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const SINCE = "2026-10-01";

const REPOS = [
  { repo: "ibnualwan22/siakad-markaz-v2", nama: "Siakad" },
  { repo: "ibnualwan22/ppdb_markaz", nama: "PPDB" },
  { repo: "ibnualwan22/slip-digital", nama: "E-maliyah" },
  { repo: "ibnualwan22/e-markaz", nama: "E-Markaz" },
  { repo: "ibnualwan22/mediator-markaz", nama: "Mediator" },
  { repo: "ibnualwan22/markaz-connections", nama: "Bawwabah" },
];

function readJson(name, fallback) {
  const p = path.join(DATA_DIR, `${name}.json`);
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const p = path.join(DATA_DIR, `${name}.json`);
  const tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
}

function run(args, opts = {}) {
  return execFileSync(args[0], args.slice(1), { encoding: "utf-8", ...opts });
}

const proyek = readJson("proyek", { proyek: [] }).proyek;
const idByNama = new Map(proyek.map((p) => [p.nama, p.id]));
const lama = readJson("riwayat", { riwayat: [] }).riwayat;
const shaAda = new Set(lama.map((r) => r.sha).filter(Boolean));

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gw-import-"));
let baru = 0;
const perRepo = {};

try {
  for (const { repo, nama } of REPOS) {
    const proyekId = idByNama.get(nama);
    if (!proyekId) {
      console.log(`LEWAT ${repo}: proyek "${nama}" tidak ada di proyek.json`);
      continue;
    }
    const dir = path.join(tmpRoot, repo.split("/")[1]);
    try {
      run(["git", "clone", "--quiet", "--single-branch", "--branch", "main",
        `--shallow-since=${SINCE}`, `https://github.com/${repo}.git`, dir]);
      const out = run(["git", "-C", dir, "log", "--no-merges", `--since=${SINCE}`,
        "--format=%H%x1f%ad%x1f%s%x1e", "--date=short", "main"]);
      let n = 0;
      for (const rec of out.split("\x1e")) {
        const line = rec.replace(/^\n+/, "").trim();
        if (!line) continue;
        const [sha, tanggal, judul] = line.split("\x1f");
        if (!sha || !tanggal || !judul) continue;
        if (shaAda.has(sha)) continue;
        lama.push({
          id: `r-${sha.slice(0, 12)}`,
          proyek_id: proyekId,
          judul: judul.trim(),
          tanggal,
          sumber: "github",
          sha,
        });
        shaAda.add(sha);
        n++;
      }
      perRepo[repo] = n;
      baru += n;
    } catch (e) {
      console.log(`GAGAL ${repo}: ${String(e.message).split("\n")[0]}`);
      perRepo[repo] = -1;
    }
  }
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

lama.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.judul.localeCompare(b.judul));
writeJsonAtomic("riwayat", { riwayat: lama });
console.log("Per repo (entri baru):", JSON.stringify(perRepo));
console.log(`Selesai: ${baru} entri baru, total ${lama.length} entri riwayat.`);
