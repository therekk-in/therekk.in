import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { users, videos, posts, communities, communityMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VideoCard";
import { VideoCard } from "@/components/VideoCard";
import { PostCard } from "@/components/PostCard";
import FollowButton from "./FollowButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const current = await getSessionUser();

  const u = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (u.length === 0) notFound();
  const user = u[0];

  if (user.isPrivate && current?.id !== user.id && !current?.isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="text-6xl mb-3">🔒</div>
        <h1 className="text-2xl font-black">This profile is private</h1>
        <p className="text-app-muted mt-2">
          Follow this user to see their content.
        </p>
      </div>
    );
  }

  const social = (user.socialLinks as any) || {};

  const userVideos = await db
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
      userPicture: users.profilePicture,
      userVerified: users.isVerified,
    })
    .from(videos)
    .leftJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.userId, user.id))
    .orderBy(desc(videos.createdAt))
    .limit(24);

  const userPosts = await db
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
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt))
    .limit(24);

  const userCommunities = await db
    .select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      profilePicture: communities.profilePicture,
      membersCount: communities.membersCount,
      category: communities.category,
    })
    .from(communities)
    .innerJoin(
      communityMembers,
      eq(communityMembers.communityId, communities.id)
    )
    .where(eq(communityMembers.userId, user.id))
    .limit(20);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="rounded-2xl border border-app bg-card overflow-hidden">
        <div className="h-32 sm:h-44 bg-gradient-to-br from-primary/80 to-secondary" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-16 sm:-mt-20">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-card bg-app-muted grid place-items-center text-4xl shrink-0 shadow-lg overflow-hidden">
              {user.profilePicture?.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePicture}
                  alt={user.displayName}
                  className="h-full w-full object-cover"
                />
              ) : user.profilePicture ? (
                <span className="text-5xl">{user.profilePicture}</span>
              ) : (
                <span>{user.displayName[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black">
                  {user.displayName}
                </h1>
                {user.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-app-muted">@{user.username}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span>
                  <span className="font-bold">
                    {formatNumber(user.followersCount)}
                  </span>{" "}
                  <span className="text-app-muted">followers</span>
                </span>
                <span>
                  <span className="font-bold">
                    {formatNumber(user.followingCount)}
                  </span>{" "}
                  <span className="text-app-muted">following</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {current && current.id !== user.id && (
                <FollowButton
                  username={user.username}
                  initialFollowers={user.followersCount}
                />
              )}
              {current?.id === user.id && (
                <Link
                  href="/settings"
                  className="h-10 px-5 rounded-full border border-app hover:bg-app-muted text-sm font-semibold grid place-items-center"
                >
                  Edit profile
                </Link>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-sm max-w-2xl">{user.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {user.showEmail && current && (
              <span className="text-app-muted">📧 {user.email}</span>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Instagram
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Twitter
              </a>
            )}
            {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                YouTube
              </a>
            )}
            {social.website && (
              <a
                href={social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      <ProfileTabs
        videos={userVideos}
        posts={userPosts}
        communities={userCommunities}
      />
    </div>
  );
}

function ProfileTabs({
  videos,
  posts,
  communities,
}: {
  videos: any[];
  posts: any[];
  communities: any[];
}) {
  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-app overflow-x-auto scrollbar-hide">
        <a
          href="#videos"
          className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary whitespace-nowrap"
        >
          Videos ({videos.length})
        </a>
        <a
          href="#posts"
          className="px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent hover:border-app-muted whitespace-nowrap"
        >
          Posts ({posts.length})
        </a>
        <a
          href="#communities"
          className="px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent hover:border-app-muted whitespace-nowrap"
        >
          Communities ({communities.length})
        </a>
      </div>

      <section id="videos" className="mt-6 scroll-mt-20">
        {videos.length === 0 ? (
          <p className="text-center text-app-muted py-12">No videos yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>

      <section id="posts" className="mt-10 scroll-mt-20">
        {posts.length === 0 ? (
          <p className="text-center text-app-muted py-12">No posts yet</p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <PostCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section id="communities" className="mt-10 scroll-mt-20">
        {communities.length === 0 ? (
          <p className="text-center text-app-muted py-12">No communities yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {communities.map((c) => (
              <Link
                key={c.id}
                href={`/community/${c.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-app bg-card hover:border-primary/40 transition"
              >
                <div className="h-12 w-12 rounded-full bg-app-muted grid place-items-center text-xl shrink-0">
                  {c.profilePicture?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.profilePicture}
                      alt={c.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : c.profilePicture ? (
                    <span>{c.profilePicture}</span>
                  ) : (
                    <span>👥</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">c/{c.name}</p>
                  <p className="text-xs text-app-muted">
                    {formatNumber(c.membersCount)} members
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
