"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function JoinButton({
  id,
  initialJoined,
}: {
  id: string;
  initialJoined: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [joined, setJoined] = useState(initialJoined);
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/communities/${id}`, { method: "POST" });
      const d = await r.json();
      setJoined(d.joined);
      toast.success(d.joined ? "Joined community" : "Left community");
      router.refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`h-10 px-5 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
        joined
          ? "bg-app-muted text-app border border-app"
          : "btn-primary"
      }`}
    >
      {joined ? "Joined" : "Join"}
    </button>
  );
}
