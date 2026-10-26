import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import SidebarNav from "@/components/SidebarNav";

export const metadata: Metadata = {
  title: "My Project GW",
  description: "Monitoring prioritas pengembangan project",
};

// Data (daftar proyek di sidebar, riwayat kerja) dibaca per request, bukan
// dibekukan saat build — supaya tulisan baru langsung tampil tanpa rebuild.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-slate-100 text-slate-900 min-h-screen">
        <Shell nav={<SidebarNav />}>{children}</Shell>
      </body>
    </html>
  );
}
