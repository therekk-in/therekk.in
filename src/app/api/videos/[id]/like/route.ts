import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, likes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const existing = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, user.id),
          eq(likes.contentType, "video"),
          eq(likes.contentId, id)
        )
      )
      .limit(1);
    if (existing.length > 0) {
      await db.delete(likes).where(eq(likes.id, existing[0].id));
      await db
        .update(videos)
        .set({ likesCount: sql`GREATEST(${videos.likesCount} - 1, 0)` })
        .where(eq(videos.id, id));
      return NextResponse.json({ liked: false });
    } else {
      await db.insert(likes).values({
        userId: user.id,
        contentType: "video",
        contentId: id,
      });
      await db
        .update(videos)
        .set({ likesCount: sql`${videos.likesCount} + 1` })
        .where(eq(videos.id, id));
      return NextResponse.json({ liked: true });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
