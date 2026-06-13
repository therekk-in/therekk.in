"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function AdminUserActions({
  id,
  isBanned,
  isVerified,
}: {
  id: string;
  isBanned: boolean;
  isVerified: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async (action: "ban" | "verify" | "delete") => {
    if (action === "delete" && !confirm("Permanently delete this user?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) throw new Error();
      toast.success("Updated");
      router.refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-1 justify-end flex-wrap">
      <button
        onClick={() => toggle("verify")}
        disabled={busy}
        className="px-2.5 py-1 rounded-full border border-app text-xs font-semibold hover:bg-app-muted"
      >
        {isVerified ? "Unverify" : "Verify"}
      </button>
      <button
        onClick={() => toggle("ban")}
        disabled={busy}
        className="px-2.5 py-1 rounded-full border border-app text-xs font-semibold hover:bg-app-muted"
      >
        {isBanned ? "Unban" : "Ban"}
      </button>
      <button
        onClick={() => toggle("delete")}
        disabled={busy}
        className="px-2.5 py-1 rounded-full border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
      >
        Delete
      </button>
    </div>
  );
}
