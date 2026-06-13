"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function AdminPostActions({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (!confirm("Delete this post?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={del}
      disabled={busy}
      className="px-3 py-1.5 rounded-full border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
    >
      Delete
    </button>
  );
}
