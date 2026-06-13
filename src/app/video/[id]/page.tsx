import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { videos, users, communities } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getTelegramFileUrl } from "@/lib/telegram";
import { timeAgo, formatNumber } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";
import VideoPlayer from "./VideoPlayer";
import CommentSection from "@/components/CommentSection";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const rows = await db
    .select({
      v: videos,
      u: users,
    })
    .from(videos)
    .leftJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.id, id))
    .limit(1);

  if (rows.length === 0 || !rows[0].v) notFound();
  const v = rows[0].v;
  const u = rows[0].u;

  // Increment view count
  await db
    .update(videos)
    .set({ viewsCount: v.viewsCount + 1 })
    .where(eq(videos.id, v.id));

  // Resolve video URL
  let videoSrc = v.videoUrl;
  if (!videoSrc && v.telegramFileId && !v.telegramFileId.startsWith("data:")) {
    try {
      videoSrc = await getTelegramFileUrl(v.telegramFileId);
    } catch {}
  }
  if (!videoSrc) videoSrc = v.telegramFileId; // data URL fallback

  // Community
  let community: { id: string; name: string } | null = null;
  if (v.communityId) {
    const c = await db
      .select()
      .from(communities)
      .where(eq(communities.id, v.communityId))
      .limit(1);
    if (c[0]) community = { id: c[0].id, name: c[0].name };
  }

  // Related videos
  const related = await db
    .select({
      id: videos.id,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      viewsCount: videos.viewsCount,
      likesCount: videos.likesCount,
      createdAt: videos.createdAt,
      category: videos.category,
      userId: videos.userId,
      userName: users.displayName,
      userUsername: users.username,
      userPicture: users.profilePicture ?? "",
      userVerified: users.isVerified ?? false,
    })
    .from(videos)
    .leftJoin(users, eq(videos.userId, users.id))
    .where(ne(videos.id, v.id))
    .orderBy(desc(videos.viewsCount))
    .limit(12);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <VideoPlayer
            id={v.id}
            title={v.title}
            description={v.description ?? ""}
            videoSrc={videoSrc ?? ""}
            subtitleUrl={v.subtitleUrl ?? ""}
            thumbnail={v.thumbnailUrl ?? ""}
            initialLikes={v.likesCount}
            initialViews={v.viewsCount + 1}
            isOwner={!!user && user.id === v.userId}
            commentsEnabled={v.commentsEnabled}
            isLoggedIn={!!user}
            currentUserId={user?.id}
            creator={{
              id: u?.id || "",
              username: u?.username || "",
              displayName: u?.displayName ?? "Unknown",
              profilePicture: u?.profilePicture ?? "",
              isVerified: u?.isVerified ?? false,
              followersCount: u?.followersCount ?? 0,
            }}
            community={community}
          />

          <div className="lg:hidden">
            <AdSlot label="Sponsored" />
          </div>

          <CommentSection
            contentType="video"
            contentId={v.id}
            commentsEnabled={v.commentsEnabled}
            currentUserId={user?.id}
          />
        </div>

        <aside className="space-y-4">
          <h3 className="font-bold text-lg">Related videos</h3>
          {related.length === 0 ? (
            <p className="text-sm text-app-muted">No related videos yet</p>
          ) : (
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/video/${r.id}`}
                  className="flex gap-3 group"
                >
                  <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-app-muted shrink-0">
                    {r.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.thumbnailUrl}
                        alt={r.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-2xl">
                        🎬
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary">
                      {r.title}
                    </h4>
                    <p className="text-xs text-app-muted mt-1 truncate">
                      {r.userName}
                      {r.userVerified && <VerifiedBadge />}
                    </p>
                    <p className="text-xs text-app-muted">
                      {formatNumber(r.viewsCount)} views · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="hidden lg:block">
            <AdSlot label="Sponsored" />
          </div>
        </aside>
      </div>
    </div>
  );
}
