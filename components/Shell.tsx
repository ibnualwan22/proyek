"use client";

import { useState, type ReactNode } from "react";

// Kerangka halaman: sidebar navigasi + area konten. Sidebar sengaja tampil di
// semua halaman (termasuk login) supaya navigasi publik tetap terjangkau;
// tidak ada logika pathname di sini agar tidak ada risiko hydration mismatch.
export default function Shell({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bar atas mobile: brand + tombol menu (sticky, tidak menumpuk konten). */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b px-4 py-2 flex items-center justify-between">
        <span className="font-bold">My Project GW</span>
        <button
          onClick={() => setOpen(true)}
          className="text-sm px-3 py-1.5 rounded border hover:bg-slate-100"
        >
          Menu
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold">My Project GW</span>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 px-2 py-1 text-sm"
              >
                Tutup
              </button>
            </div>
            <div onClick={() => setOpen(false)}>{nav}</div>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r overflow-y-auto">
        {nav}
      </aside>

      <div className="md:pl-64">{children}</div>
    </>
  );
}
