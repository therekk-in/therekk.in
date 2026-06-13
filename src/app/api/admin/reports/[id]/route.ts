import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, videos, posts, comments, communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await ctx.params;
    const body = await req.json();
    const { action, contentType, contentId } = body;

    if (action === "resolve" || action === "dismiss") {
      await db
        .update(reports)
        .set({ status: action === "resolve" ? "resolved" : "dismissed" })
        .where(eq(reports.id, id));
    } else if (action === "deleteContent") {
      if (contentType === "video")
        await db.delete(videos).where(eq(videos.id, contentId));
      else if (contentType === "post")
        await db.delete(posts).where(eq(posts.id, contentId));
      else if (contentType === "comment")
        await db.delete(comments).where(eq(comments.id, contentId));
      else if (contentType === "community")
        await db.delete(communities).where(eq(communities.id, contentId));
      await db
        .update(reports)
        .set({ status: "resolved" })
        .where(eq(reports.id, id));
    } else {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
