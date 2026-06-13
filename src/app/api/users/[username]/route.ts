import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, videos, posts, follows, communities, communityMembers } from "@/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await ctx.params;
    const current = await getSessionUser();
    const u = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (u.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const target = u[0];
    if (target.isPrivate && current?.id !== target.id && !current?.isAdmin)
      return NextResponse.json({ user: { ...target, isPrivate: true } });

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
        userPicture: users.profilePicture,
        userVerified: users.isVerified,
      })
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.userId, target.id))
      .orderBy(desc(videos.createdAt))
      .limit(24);

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
        userPicture: users.profilePicture,
        userVerified: users.isVerified,
        communityId: posts.communityId,
        communityName: communities.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(eq(posts.userId, target.id))
      .orderBy(desc(posts.createdAt))
      .limit(24);

    const c = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        profilePicture: communities.profilePicture,
        membersCount: communities.membersCount,
        category: communities.category,
      })
      .from(communities)
      .innerJoin(communityMembers, eq(communityMembers.communityId, communities.id))
      .where(eq(communityMembers.userId, target.id))
      .limit(20);

    return NextResponse.json({
      user: target,
      videos: v,
      posts: p,
      communities: c,
    });
  } catch (e) {
    console.error("User profile error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ username: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { username } = await ctx.params;
    if (username !== user.username && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const updates: any = {};
    for (const k of [
      "displayName",
      "bio",
      "profilePicture",
      "isPrivate",
      "showEmail",
      "socialLinks",
      "interests",
      "notificationSettings",
    ]) {
      if (k in body) updates[k] = body[k];
    }
    if (body.username && body.username !== user.username) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(body.username))
        return NextResponse.json({ error: "Invalid username" }, { status: 400 });
      const exists = await db
        .select()
        .from(users)
        .where(eq(users.username, body.username))
        .limit(1);
      if (exists.length > 0)
        return NextResponse.json({ error: "Username taken" }, { status: 409 });
      updates.username = body.username;
    }
    await db.update(users).set(updates).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
