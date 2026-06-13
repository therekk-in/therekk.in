"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function ReportActions({
  id,
  contentType,
  contentId,
  status,
}: {
  id: string;
  contentType: string;
  contentId: string;
  status: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const doAction = async (action: "resolve" | "dismiss" | "deleteContent") => {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, contentType, contentId }),
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

  if (status !== "pending") {
    return null;
  }

  return (
    <div className="mt-3 flex gap-2 flex-wrap">
      <button
        onClick={() => doAction("resolve")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20"
      >
        Resolve
      </button>
      <button
        onClick={() => doAction("dismiss")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full bg-app-muted text-app-muted text-xs font-semibold hover:bg-app"
      >
        Dismiss
      </button>
      <button
        onClick={() => doAction("deleteContent")}
        disabled={busy}
        className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20"
      >
        Delete content
      </button>
    </div>
  );
}
