"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { formatNumber } from "@/lib/utils";

export default function FollowButton({
  username,
  initialFollowers,
}: {
  username: string;
  initialFollowers: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(initialFollowers ?? 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}/status`)
      .then((r) => r.json())
      .then((d) => setFollowing(!!d.following))
      .catch(() => {});
  }, [username]);

  const onClick = async () => {
    setLoading(true);
    const was = following;
    setFollowing(!was);
    setCount((n) => n + (was ? -1 : 1));
    try {
      const r = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      const d = await r.json();
      setFollowing(!!d.following);
      router.refresh();
    } catch {
      setFollowing(was);
      setCount((n) => n + (was ? 1 : -1));
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
        following ? "bg-app-muted text-app border border-app" : "btn-primary"
      }`}
    >
      {following ? "Following" : "Follow"} · {formatNumber(count)}
    </button>
  );
}
