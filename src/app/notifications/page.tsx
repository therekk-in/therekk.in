"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/auth/login");
          return;
        }
        fetch("/api/notifications")
          .then((r) => r.json())
          .then((d) => {
            setItems(d.notifications || []);
            setLoading(false);
            // Mark all as read
            fetch("/api/notifications", { method: "PATCH" });
          });
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-black">Notifications</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-app bg-app-soft p-10 text-center">
          <div className="text-5xl mb-3">🔔</div>
          <p className="font-semibold">No notifications yet</p>
          <p className="text-sm text-app-muted mt-1">
            We'll let you know when something interesting happens.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border p-4 ${
                n.isRead
                  ? "border-app bg-card"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              {n.link ? (
                <Link
                  href={n.link}
                  className="block hover:text-primary"
                >
                  <p className="font-semibold text-sm">{n.message}</p>
                  <p className="text-xs text-app-muted mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </Link>
              ) : (
                <>
                  <p className="font-semibold text-sm">{n.message}</p>
                  <p className="text-xs text-app-muted mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
