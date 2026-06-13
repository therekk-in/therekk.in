import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, users, communities } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ensureArray } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const {
      title,
      content,
      images,
      videoUrl,
      linkUrl,
      tags,
      communityId,
    } = body;
    if (!title || title.length < 3)
      return NextResponse.json({ error: "Title too short" }, { status: 400 });
    const p = await db
      .insert(posts)
      .values({
        userId: user.id,
        title,
        content: content || "",
        images: ensureArray<string>(images),
        videoUrl: videoUrl || "",
        linkUrl: linkUrl || "",
        tags: ensureArray<string>(tags),
        communityId: communityId || null,
      })
      .returning();
    return NextResponse.json({ post: p[0] });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "24"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const userId = url.searchParams.get("userId");
    const communityId = url.searchParams.get("communityId");
    const sort = url.searchParams.get("sort") || "latest";

    const orderBy =
      sort === "top"
        ? desc(sql`${posts.upvotes} - ${posts.downvotes}`)
        : sort === "comments"
          ? desc(posts.commentsCount)
          : desc(posts.createdAt);

    let q: any = db
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
      .$dynamic();

    if (userId) q = q.where(eq(posts.userId, userId));
    if (communityId) q = q.where(eq(posts.communityId, communityId));

    const result = await q.orderBy(orderBy).limit(limit).offset(offset);
    return NextResponse.json({ posts: result });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
