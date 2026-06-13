"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function AdminCommunityActions({
  id,
  isBanned,
}: {
  id: string;
  isBanned: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const action = async (act: "ban" | "delete") => {
    if (act === "delete" && !confirm("Delete this community?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/communities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act }),
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
    <div className="flex gap-2">
      <button
        onClick={() => action("ban")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full border border-app text-xs font-semibold hover:bg-app-muted"
      >
        {isBanned ? "Unban" : "Ban"}
      </button>
      <button
        onClick={() => action("delete")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
      >
        Delete
      </button>
    </div>
  );
}
