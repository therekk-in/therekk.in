"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNumber, timeAgo } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";
import { useToast } from "@/components/ToastProvider";

type Tab = "videos" | "posts" | "watch-later";

export default function SavedPage() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("videos");
  const [videos, setVideos] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [later, setLater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/auth/login");
          return;
        }
        loadAll();
      });
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [v, p, l] = await Promise.all([
        fetch("/api/saved?videos=true").then((r) => r.json()),
        fetch("/api/saved?posts=true").then((r) => r.json()),
        fetch("/api/saved?watchLater=true").then((r) => r.json()),
      ]);
      setVideos(v.videos || []);
      setPosts(p.posts || []);
      setLater(l.videos || []);
    } catch (e) {
      toast.error("Failed to load saved items");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-black">Saved & Bookmarks</h1>

      <div className="mt-6 flex gap-2 border-b border-app overflow-x-auto">
        <TabBtn active={tab === "videos"} onClick={() => setTab("videos")}>
          Videos ({videos.length})
        </TabBtn>
        <TabBtn active={tab === "posts"} onClick={() => setTab("posts")}>
          Posts ({posts.length})
        </TabBtn>
        <TabBtn
          active={tab === "watch-later"}
          onClick={() => setTab("watch-later")}
        >
          Watch later ({later.length})
        </TabBtn>
      </div>

      <div className="mt-6">
        {tab === "videos" && (
          <>
            {videos.length === 0 ? (
              <EmptyState
                icon="🔖"
                title="No saved videos"
                desc="Bookmark videos to watch them later."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((v) => (
                  <VideoGridCard key={v.id} v={v} />
                ))}
              </div>
            )}
          </>
        )}
        {tab === "posts" && (
          <>
            {posts.length === 0 ? (
              <EmptyState
                icon="📌"
                title="No saved posts"
                desc="Save posts to revisit them anytime."
              />
            ) : (
              <div className="space-y-3">
                {posts.map((p) => (
                  <PostListCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </>
        )}
        {tab === "watch-later" && (
          <>
            {later.length === 0 ? (
              <EmptyState
                icon="⏰"
                title="No videos in Watch Later"
                desc="Add videos to your watch later queue."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {later.map((v) => (
                  <VideoGridCard key={v.id} v={v} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-app-muted hover:text-app"
      }`}
    >
      {children}
    </button>
  );
}

function VideoGridCard({ v }: { v: any }) {
  return (
    <Link
      href={`/video/${v.id}`}
      className="block group rounded-2xl overflow-hidden bg-card border border-app hover:border-primary/40 transition"
    >
      <div className="relative aspect-video bg-app-muted">
        {v.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.thumbnailUrl}
            alt={v.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-4xl">
            🎬
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
          {v.title}
        </h3>
        <p className="text-xs text-app-muted mt-1">
          {formatNumber(v.viewsCount)} views · {timeAgo(v.createdAt)}
        </p>
      </div>
    </Link>
  );
}

function PostListCard({ p }: { p: any }) {
  return (
    <Link
      href={`/post/${p.id}`}
      className="block rounded-2xl border border-app bg-card p-4 hover:border-primary/40 transition"
    >
      <h3 className="font-semibold line-clamp-2">{p.title}</h3>
      <p className="text-xs text-app-muted mt-1">
        {p.communityName && `c/${p.communityName} · `}
        u/{p.userUsername} · {timeAgo(p.createdAt)}
      </p>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-app bg-app-soft p-12 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-app-muted mt-1">{desc}</p>
    </div>
  );
}
