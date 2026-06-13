import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedItems, videos, posts, users, communities } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ videos: [], posts: [] });
    const url = new URL(req.url);
    const watchLater = url.searchParams.get("watchLater") === "true";
    const wantPosts = url.searchParams.get("posts") === "true";

    if (wantPosts) {
      const saved = await db
        .select()
        .from(savedItems)
        .where(
          and(
            eq(savedItems.userId, user.id),
            eq(savedItems.contentType, "post")
          )
        )
        .orderBy(desc(savedItems.createdAt));
      const postIds = saved.map((s) => s.contentId);
      if (postIds.length === 0) return NextResponse.json({ posts: [] });
      const p = await db
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
          communityId: posts.communityId,
          communityName: communities.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(communities, eq(posts.communityId, communities.id))
        .orderBy(desc(posts.createdAt));
      return NextResponse.json({
        posts: p.filter((x) => postIds.includes(x.id)),
      });
    }

    const saved = await db
      .select()
      .from(savedItems)
      .where(
        and(
          eq(savedItems.userId, user.id),
          eq(savedItems.contentType, "video"),
          watchLater
            ? eq(savedItems.isWatchLater, true)
            : eq(savedItems.isWatchLater, false)
        )
      )
      .orderBy(desc(savedItems.createdAt));
    const videoIds = saved.map((s) => s.contentId);
    if (videoIds.length === 0) return NextResponse.json({ videos: [] });
    const v = await db
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
      })
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .orderBy(desc(videos.createdAt));
    return NextResponse.json({
      videos: v.filter((x) => videoIds.includes(x.id)),
    });
  } catch (e) {
    return NextResponse.json({ videos: [], posts: [] });
  }
}
