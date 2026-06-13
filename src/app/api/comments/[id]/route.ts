import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, videos, posts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const body = await req.json();
    const rows = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].userId !== user.id && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db
      .update(comments)
      .set({ text: body.text })
      .where(eq(comments.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const rows = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const c = rows[0];
    if (c.userId !== user.id && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.delete(comments).where(eq(comments.id, id));
    if (c.contentType === "video") {
      await db
        .update(videos)
        .set({ commentsCount: sql`GREATEST(${videos.commentsCount} - 1, 0)` })
        .where(eq(videos.id, c.contentId));
    } else if (c.contentType === "post") {
      await db
        .update(posts)
        .set({ commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)` })
        .where(eq(posts.id, c.contentId));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
