"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Invalid credentials");
      toast.success("Welcome, admin");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-xl">
        <Link
          href="/"
          className="flex items-center gap-2 justify-center mb-6"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-black">
            TX
          </div>
          <span className="text-2xl font-black">
            <span className="text-primary">THERE</span>KK
          </span>
        </Link>
        <h1 className="text-2xl font-black text-center">Admin login</h1>
        <p className="text-sm text-app-muted text-center mt-1 mb-6">
          Restricted area
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Admin username
            </label>
            <input
              type="text"
              value={u}
              onChange={(e) => setU(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Admin password
            </label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full btn-primary font-semibold transition disabled:opacity-60"
          >
            {loading ? "Authenticating…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-app-muted">
          Default: admin / therekk-admin
        </p>
      </div>
    </div>
  );
}
