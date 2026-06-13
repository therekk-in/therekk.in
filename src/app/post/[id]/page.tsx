import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { posts, users, communities } from "@/db/schema";
import { eq, desc, ne } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { timeAgo, formatNumber } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";
import PostVote from "./PostVote";
import CommentSection from "@/components/CommentSection";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const rows = await db
    .select({ p: posts, u: users, c: communities })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(communities, eq(posts.communityId, communities.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (rows.length === 0 || !rows[0].p) notFound();
  const p = rows[0].p;
  const u = rows[0].u;
  const c = rows[0].c;

  const related = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      upvotes: posts.upvotes,
      downvotes: posts.downvotes,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      userId: posts.userId,
      userName: users.displayName,
      userUsername: users.username,
      userPicture: users.profilePicture,
      userVerified: users.isVerified,
      communityId: posts.communityId,
      communityName: communities.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(communities, eq(posts.communityId, communities.id))
    .where(ne(posts.id, p.id))
    .orderBy(desc(posts.createdAt))
    .limit(8);

  const images = (p.images as string[]) || [];
  const tags = (p.tags as string[]) || [];
  const editHistory = (p.editHistory as any[]) || [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <article>
          <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-card border border-app">
            <PostVote
              postId={p.id}
              initialUpvotes={p.upvotes}
              initialDownvotes={p.downvotes}
              isLoggedIn={!!user}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs text-app-muted flex-wrap">
                {c && (
                  <>
                    <Link
                      href={`/community/${c.id}`}
                      className="font-bold text-app hover:text-primary"
                    >
                      c/{c.name}
                    </Link>
                    <span>·</span>
                  </>
                )}
                <span>Posted by</span>
                <Link
                  href={`/profile/${u?.username || ""}`}
                  className="hover:text-primary font-medium"
                >
                  u/{u?.username}
                </Link>
                {u?.isVerified && <VerifiedBadge />}
                <span>·</span>
                <span>{timeAgo(p.createdAt)}</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black leading-tight">
                {p.title}
              </h1>
              {p.content && (
                <p className="mt-4 text-base whitespace-pre-wrap leading-relaxed">
                  {p.content}
                </p>
              )}

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-full rounded-xl border border-app"
                    />
                  ))}
                </div>
              )}

              {p.linkUrl && (
                <a
                  href={p.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block p-4 rounded-xl border border-app bg-app-muted hover:border-primary transition"
                >
                  <p className="text-xs text-app-muted mb-1">🔗 Link</p>
                  <p className="font-semibold text-primary truncate">
                    {p.linkUrl}
                  </p>
                </a>
              )}

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <Link
                      key={t}
                      href={`/search?q=${encodeURIComponent(t)}`}
                      className="px-2.5 py-1 rounded-full bg-app-muted hover:bg-primary/10 text-xs font-medium transition"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-sm text-app-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {formatNumber(p.commentsCount)} comments
                </span>
                <ShareButton title={p.title} />
                {user?.id === p.userId && (
                  <Link
                    href={`/create-post?id=${p.id}`}
                    className="hover:text-primary"
                  >
                    Edit
                  </Link>
                )}
                {user?.id === p.userId && (
                  <DeletePostButton id={p.id} />
                )}
              </div>

              {editHistory.length > 0 && (
                <p className="mt-3 text-xs text-app-muted">
                  Edited {editHistory.length} time
                  {editHistory.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <CommentSection
              contentType="post"
              contentId={p.id}
              commentsEnabled={true}
              currentUserId={user?.id}
            />
          </div>
        </article>

        <aside className="space-y-4">
          {c && (
            <div className="rounded-2xl border border-app bg-card p-5">
              <h3 className="font-bold mb-3">About c/{c.name}</h3>
              <p className="text-sm text-app-muted">
                {c.description || "No description yet."}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-app-muted text-xs">Members</p>
                  <p className="font-bold">{formatNumber(c.membersCount)}</p>
                </div>
              </div>
              <Link
                href={`/community/${c.id}`}
                className="mt-4 block text-center h-9 leading-9 rounded-full btn-primary font-semibold text-sm"
              >
                View community
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-app bg-card p-5">
            <h3 className="font-bold mb-3">More posts</h3>
            <div className="space-y-3">
              {related.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/post/${r.id}`}
                  className="block group"
                >
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary">
                    {r.title}
                  </p>
                  <p className="text-xs text-app-muted mt-1">
                    {formatNumber(r.upvotes - r.downvotes)} upvotes ·{" "}
                    {timeAgo(r.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <AdSlot label="Sponsored" />
        </aside>
      </div>
    </div>
  );
}

function ShareButton({ title }: { title: string }) {
  return (
    <button
      onClick={async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title, url: window.location.href });
            return;
          } catch {}
        }
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
        } catch {}
      }}
      className="hover:text-primary"
    >
      Share
    </button>
  );
}

function DeletePostButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm("Delete this post?")) return;
        const r = await fetch(`/api/posts/${id}`, { method: "DELETE" });
        if (r.ok) window.location.href = "/";
        else alert("Failed to delete");
      }}
      className="hover:text-red-500"
    >
      Delete
    </button>
  );
}
