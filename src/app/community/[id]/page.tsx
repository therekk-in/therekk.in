import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { communities, posts, users, communityMembers } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { formatNumber, timeAgo } from "@/lib/utils";
import JoinButton from "./JoinButton";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const rows = await db
    .select({ c: communities, mod: users })
    .from(communities)
    .leftJoin(users, eq(communities.moderatorId, users.id))
    .where(eq(communities.id, id))
    .limit(1);

  if (rows.length === 0 || !rows[0].c) notFound();
  const c = rows[0].c;
  const mod = rows[0].mod;

  let joined = false;
  if (user) {
    const m = await db
      .select()
      .from(communityMembers)
      .where(
        sql`${communityMembers.userId} = ${user.id} AND ${communityMembers.communityId} = ${id}`
      )
      .limit(1);
    joined = m.length > 0;
  }

  const communityPosts = await db
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
    .where(eq(posts.communityId, id))
    .orderBy(desc(posts.createdAt))
    .limit(30);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <div className="rounded-2xl overflow-hidden border border-app bg-card">
        <div className="h-32 sm:h-40 bg-gradient-to-br from-primary to-secondary" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-card bg-app-muted grid place-items-center text-4xl shrink-0 shadow-lg">
              {c.profilePicture?.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.profilePicture}
                  alt={c.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : c.profilePicture ? (
                <span>{c.profilePicture}</span>
              ) : (
                <span>👥</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black">c/{c.name}</h1>
              <p className="text-sm text-app-muted mt-1">
                {formatNumber(c.membersCount)} members
                {c.category && (
                  <>
                    {" "}· <span className="text-primary">{c.category}</span>
                  </>
                )}
              </p>
              {mod && (
                <p className="text-xs text-app-muted mt-1">
                  Moderated by u/{mod.username}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {user ? (
                <JoinButton id={c.id} initialJoined={joined} />
              ) : (
                <Link
                  href="/auth/login"
                  className="h-10 px-5 rounded-full btn-primary text-sm font-semibold grid place-items-center"
                >
                  Join
                </Link>
              )}
              {user && (
                <Link
                  href={`/create-post?communityId=${c.id}`}
                  className="h-10 px-4 rounded-full border border-app hover:bg-app-muted text-sm font-semibold grid place-items-center"
                >
                  + Post
                </Link>
              )}
            </div>
          </div>

          {c.description && (
            <p className="mt-4 text-sm text-app-muted max-w-2xl">
              {c.description}
            </p>
          )}

          {((c.rules as string[]) || []).length > 0 && (
            <details className="mt-4 rounded-xl border border-app bg-app-muted p-4">
              <summary className="cursor-pointer font-semibold text-sm">
                Community rules ({((c.rules as string[]) || []).length})
              </summary>
              <ol className="mt-2 space-y-1 text-sm list-decimal list-inside text-app-muted">
                {((c.rules as string[]) || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            </details>
          )}
        </div>
      </div>

      <h2 className="mt-8 text-xl font-bold">Posts</h2>
      {communityPosts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-app bg-app-soft p-8 text-center">
          <div className="text-4xl mb-2">📝</div>
          <p className="font-semibold">No posts yet</p>
          <p className="text-sm text-app-muted mt-1">
            Be the first to start a discussion.
          </p>
          {user && (
            <Link
              href={`/create-post?communityId=${c.id}`}
              className="mt-4 inline-block btn-primary h-10 leading-10 px-5 rounded-full font-semibold"
            >
              Create post
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {communityPosts.map((p) => (
            <PostListItem key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostListItem({ p }: { p: any }) {
  return (
    <Link
      href={`/post/${p.id}`}
      className="block rounded-2xl border border-app bg-card p-4 hover:border-primary/40 transition"
    >
      <div className="flex gap-3">
        <div className="hidden sm:flex flex-col items-center justify-start min-w-[3rem]">
          <span className="text-sm font-bold">
            {formatNumber(p.upvotes - p.downvotes)}
          </span>
          <span className="text-xs text-app-muted">upvotes</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary">
            {p.title}
          </h3>
          <p className="mt-1 text-sm text-app-muted line-clamp-2">{p.content}</p>
          <div className="mt-2 text-xs text-app-muted">
            u/{p.userUsername} · {timeAgo(p.createdAt)} ·{" "}
            {formatNumber(p.commentsCount)} comments
          </div>
        </div>
      </div>
    </Link>
  );
}
