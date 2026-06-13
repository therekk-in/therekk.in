import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, posts, communities, users } from "@/db/schema";
import { eq, sql, ilike, or, and, desc, ne } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() || "";
    const type = url.searchParams.get("type") || "all";
    const sort = url.searchParams.get("sort") || "relevance";
    const category = url.searchParams.get("category");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "24"), 50);

    const result: any = {
      videos: [],
      posts: [],
      communities: [],
      users: [],
    };

    if (!q && !category) {
      return NextResponse.json(result);
    }

    if (type === "all" || type === "videos") {
      let vq: any = db
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
        .$dynamic();
      const conds: any[] = [];
      if (q) conds.push(or(ilike(videos.title, `%${q}%`), ilike(videos.description, `%${q}%`)));
      if (category) conds.push(eq(videos.category, category));
      if (conds.length > 0) vq = vq.where(and(...conds));
      const orderBy =
        sort === "views"
          ? desc(videos.viewsCount)
          : sort === "likes"
            ? desc(videos.likesCount)
            : desc(videos.createdAt);
      result.videos = await vq.orderBy(orderBy).limit(limit);
    }

    if (type === "all" || type === "posts") {
      let pq: any = db
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
          communityName: sql<string>`(SELECT name FROM communities WHERE id = ${posts.communityId})`,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .$dynamic();
      const conds: any[] = [];
      if (q) conds.push(or(ilike(posts.title, `%${q}%`), ilike(posts.content, `%${q}%`)));
      if (conds.length > 0) pq = pq.where(and(...conds));
      const orderBy =
        sort === "top"
          ? desc(sql`${posts.upvotes} - ${posts.downvotes}`)
          : sort === "comments"
            ? desc(posts.commentsCount)
            : desc(posts.createdAt);
      result.posts = await pq.orderBy(orderBy).limit(limit);
    }

    if (type === "all" || type === "communities") {
      let cq: any = db
        .select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          profilePicture: communities.profilePicture,
          membersCount: communities.membersCount,
          category: communities.category,
        })
        .from(communities)
        .$dynamic();
      const conds: any[] = [];
      if (q)
        conds.push(
          or(
            ilike(communities.name, `%${q}%`),
            ilike(communities.description, `%${q}%`)
          )
        );
      if (conds.length > 0) cq = cq.where(and(...conds));
      result.communities = await cq
        .orderBy(desc(communities.membersCount))
        .limit(limit);
    }

    if (type === "all" || type === "users") {
      let uq: any = db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profilePicture: users.profilePicture,
          bio: users.bio,
          isVerified: users.isVerified,
          followersCount: users.followersCount,
        })
        .from(users)
        .$dynamic();
      if (q) {
        uq = uq.where(
          or(ilike(users.username, `%${q}%`), ilike(users.displayName, `%${q}%`))
        );
      }
      result.users = await uq.orderBy(desc(users.followersCount)).limit(limit);
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("Search error:", e);
    return NextResponse.json(
      { videos: [], posts: [], communities: [], users: [] },
      { status: 500 }
    );
  }
}
