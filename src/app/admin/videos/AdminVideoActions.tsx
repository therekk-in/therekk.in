"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function AdminVideoActions({
  id,
  isFeatured,
}: {
  id: string;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async (action: "feature" | "delete") => {
    if (action === "delete" && !confirm("Delete this video?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/videos/${id}`, {
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
    <div className="flex gap-2">
      <button
        onClick={() => toggle("feature")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full border border-app text-xs font-semibold hover:bg-app-muted"
      >
        {isFeatured ? "Unfeature" : "Feature"}
      </button>
      <button
        onClick={() => toggle("delete")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
      >
        Delete
      </button>
    </div>
  );
}
