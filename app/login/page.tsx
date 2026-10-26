"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, remember }),
    });
    if (r.ok) router.push("/admin");
    else setError("Password salah.");
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-center mb-6">My Project GW — Admin</h1>
      <form onSubmit={submit} className="bg-white border rounded-xl p-6 space-y-3 shadow-sm">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password admin"
          autoFocus
          className="w-full border rounded px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Ingat saya (30 hari)
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800">
          Masuk
        </button>
      </form>
    </main>
  );
}
