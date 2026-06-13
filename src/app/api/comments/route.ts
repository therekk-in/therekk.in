import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, videos, posts } from "@/db/schema";
import { and, eq, sql, desc, isNull } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const contentType = url.searchParams.get("contentType");
    const contentId = url.searchParams.get("contentId");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const rows = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        contentType: comments.contentType,
        contentId: comments.contentId,
        parentId: comments.parentId,
        text: comments.text,
        likesCount: comments.likesCount,
        isPinned: comments.isPinned,
        createdAt: comments.createdAt,
        userName: sql<string>`(SELECT display_name FROM users WHERE id = ${comments.userId})`,
        userUsername: sql<string>`(SELECT username FROM users WHERE id = ${comments.userId})`,
        userPicture: sql<string>`COALESCE((SELECT profile_picture FROM users WHERE id = ${comments.userId}), '')`,
        userVerified: sql<boolean>`COALESCE((SELECT is_verified FROM users WHERE id = ${comments.userId}), false)`,
      })
      .from(comments)
      .where(
        and(
          eq(comments.contentType, contentType),
          eq(comments.contentId, contentId)
        )
      )
      .orderBy(desc(comments.isPinned), desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      comments: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      hasMore: rows.length === limit,
    });
  } catch (e) {
    console.error("Comments GET error:", e);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { contentType, contentId, text, parentId } = body;
    if (!contentType || !contentId || !text) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }
    const c = await db
      .insert(comments)
      .values({
        userId: user.id,
        contentType,
        contentId,
        text,
        parentId: parentId || null,
      })
      .returning();

    if (contentType === "video") {
      await db
        .update(videos)
        .set({ commentsCount: sql`${videos.commentsCount} + 1` })
        .where(eq(videos.id, contentId));
    } else if (contentType === "post") {
      await db
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} + 1` })
        .where(eq(posts.id, contentId));
    }

    return NextResponse.json({ comment: c[0] });
  } catch (e) {
    console.error("Comments POST error:", e);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
