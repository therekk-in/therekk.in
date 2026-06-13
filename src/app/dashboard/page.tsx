import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { videos, posts, follows, comments, notifications } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { formatNumber, timeAgo } from "@/lib/utils";
import { VideoCard } from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const userVideos = await db
    .select()
    .from(videos)
    .where(eq(videos.userId, user.id))
    .orderBy(desc(videos.createdAt));

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt))
    .limit(5);

  const totalViews = userVideos.reduce((s, v) => s + v.viewsCount, 0);
  const totalLikes = userVideos.reduce((s, v) => s + v.likesCount, 0);

  const recentComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      contentType: comments.contentType,
      contentId: comments.contentId,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .orderBy(desc(comments.createdAt))
    .limit(10);

  const recentNotifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(10);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Creator dashboard</h1>
          <p className="text-sm text-app-muted mt-1">
            Welcome back, {user.displayName}
          </p>
        </div>
        <Link
          href="/upload"
          className="h-11 px-5 rounded-full btn-primary font-semibold grid place-items-center"
        >
          + Upload video
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total views" value={formatNumber(totalViews)} icon="👁️" />
        <StatCard
          label="Total likes"
          value={formatNumber(totalLikes)}
          icon="❤️"
        />
        <StatCard
          label="Followers"
          value={formatNumber(user.followersCount)}
          icon="👥"
        />
        <StatCard
          label="Videos"
          value={formatNumber(userVideos.length)}
          icon="🎬"
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <h2 className="text-xl font-bold mb-3">Your videos</h2>
          {userVideos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-app bg-app-soft p-8 text-center">
              <p className="font-semibold">No videos yet</p>
              <p className="text-sm text-app-muted mt-1">
                Upload your first repair video to get started
              </p>
              <Link
                href="/upload"
                className="mt-4 inline-block btn-primary h-10 leading-10 px-5 rounded-full font-semibold"
              >
                Upload video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userVideos.map((v) => (
                <VideoCard
                  key={v.id}
                  v={{
                    id: v.id,
                    title: v.title,
                    thumbnailUrl: v.thumbnailUrl,
                    viewsCount: v.viewsCount,
                    likesCount: v.likesCount,
                    createdAt: v.createdAt,
                    category: v.category ?? "",
                    userId: v.userId,
                    userName: user.displayName,
                    userUsername: user.username,
                    userPicture: user.profilePicture,
                    userVerified: user.isVerified,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-app bg-card p-5">
            <h3 className="font-bold mb-3">Recent activity</h3>
            {recentNotifs.length === 0 ? (
              <p className="text-sm text-app-muted">No activity yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentNotifs.slice(0, 6).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-app-muted"
                  >
                    <span className="text-base">🔔</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{n.message}</p>
                      <p className="text-xs text-app-muted">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-app bg-card p-5">
            <h3 className="font-bold mb-3">Your recent posts</h3>
            {userPosts.length === 0 ? (
              <p className="text-sm text-app-muted">No posts yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {userPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/post/${p.id}`}
                      className="block p-2 rounded-lg hover:bg-app-muted"
                    >
                      <p className="font-medium line-clamp-2">{p.title}</p>
                      <p className="text-xs text-app-muted mt-1">
                        {formatNumber(p.upvotes - p.downvotes)} upvotes ·{" "}
                        {timeAgo(p.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-app bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-app-muted uppercase tracking-wider">
          {label}
        </p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
