"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

export default function AnnouncementsPage() {
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [audience, setAudience] = useState<"all" | "email">("all");

  const onSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, audience }),
      });
      if (!r.ok) throw new Error();
      toast.success("Announcement sent");
      setMessage("");
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Announcements</h1>
      <p className="text-sm text-app-muted mt-1">
        Send a message to all users
      </p>

      <div className="mt-6 max-w-2xl rounded-2xl border border-app bg-card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-app-muted border border-transparent focus:border-primary focus:bg-app outline-none transition resize-none"
            placeholder="Important update from the THEREKK team…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Audience</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setAudience("all")}
              className={`px-4 h-10 rounded-full text-sm font-semibold border transition ${
                audience === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-app"
              }`}
            >
              In-app + Email
            </button>
            <button
              onClick={() => setAudience("email")}
              className={`px-4 h-10 rounded-full text-sm font-semibold border transition ${
                audience === "email"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-app"
              }`}
            >
              Email only
            </button>
          </div>
        </div>
        <button
          onClick={onSend}
          disabled={sending}
          className="h-11 px-6 rounded-full btn-primary font-semibold transition disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send announcement"}
        </button>
      </div>
    </div>
  );
}
