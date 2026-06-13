"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { formatNumber } from "@/lib/utils";

export default function PostVote({
  postId,
  initialUpvotes,
  initialDownvotes,
  isLoggedIn,
}: {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [up, setUp] = useState(initialUpvotes);
  const [down, setDown] = useState(initialDownvotes);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const cast = async (type: "up" | "down") => {
    if (!isLoggedIn) {
      toast.info("Please log in to vote");
      router.push("/auth/login");
      return;
    }
    const was = vote;
    let newVote: "up" | "down" | null = type;
    if (was === type) newVote = null;
    setVote(newVote);
    let du = 0,
      dd = 0;
    if (was === "up") du = -1;
    if (was === "down") dd = -1;
    if (newVote === "up") du += 1;
    if (newVote === "down") dd += 1;
    setUp((n) => Math.max(0, n + du));
    setDown((n) => Math.max(0, n + dd));
    try {
      const r = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setVote(d.vote);
    } catch {
      toast.error("Vote failed");
    }
  };

  const score = up - down;

  return (
    <div className="flex flex-col items-center gap-1 sticky top-20 self-start">
      <button
        onClick={() => cast("up")}
        className={`h-10 w-10 grid place-items-center rounded-full transition ${
          vote === "up"
            ? "text-primary bg-primary/10"
            : "text-app-muted hover:bg-app-muted"
        }`}
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill={vote === "up" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <span className="text-lg font-bold">{formatNumber(score)}</span>
      <button
        onClick={() => cast("down")}
        className={`h-10 w-10 grid place-items-center rounded-full transition ${
          vote === "down"
            ? "text-blue-500 bg-blue-500/10"
            : "text-app-muted hover:bg-app-muted"
        }`}
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill={vote === "down" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}
