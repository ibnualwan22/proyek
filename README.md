# My Project GW

Web monitoring prioritas pengembangan project. Satu halaman admin untuk mengatur
prioritas tiap jobdesk, satu halaman publik untuk melihat prioritas minggu/bulan ini.

## Fitur

- **Halaman publik** (`/`): toggle "Minggu ini" / "Bulan ini", fitur **dikelompokkan per
  prioritas** (Mendesak/Tinggi/Sedang/Rendah) lintas project, tiap fitur berlabel nama
  project + badge kesulitan (Mudah=hitungan hari, Sedang=±1 minggu, Sulit=berminggu-minggu),
  bagian "Sudah selesai" yang collapsed (expand untuk melihat), komentar dan usulan
  prioritas per fitur (tanpa login).
- **Halaman admin** (`/admin`, login password + opsi "Ingat saya" 30 hari): CRUD project,
  CRUD fitur, drag-and-drop urutan prioritas, label prioritas, tingkat kesulitan,
  status (Backlog/Dikerjakan/Testing/Selesai/Tertunda), centang fokus minggu/bulan,
  moderasi komentar & usulan prioritas, arsip project.

## Menjalankan lokal

```bash
npm install
DASHBOARD_PASSWORD=rahasia DATA_DIR=./data npm run dev
# atau production:
npm run build
DASHBOARD_PASSWORD=rahasia DATA_DIR=./data npm start -- --port 3102
```

## Struktur data

JSON di `DATA_DIR` (default `./data`, di production `/home/hatch/.my-project-gw/data`):

- `proyek.json` — `{ proyek: [{ id, nama, deskripsi, url, repo, status, urutan }] }`
- `fitur.json` — `{ fitur: [{ id, proyek_id, judul, deskripsi, prioritas, status, kesulitan, urutan, fokus_minggu, fokus_bulan }] }`
- `komentar.json`, `usulan.json`

## Deploy (VPS + VM)

- Service systemd: `my-project-gw.service` (VM port 3102)
- Tunnel: `my-project-gw-tunnel.service` (VPS 127.0.0.1:15435 → VM 3102)
- Nginx: `proyek.markazarabiyah.site` → `http://127.0.0.1:15435` + Let's Encrypt
- Tercakup `muse-watchdog.sh` (cek tiap 5 menit + pulih setelah VM replacement)
