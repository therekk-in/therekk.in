import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { likes, savedItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ liked: false, saved: false });
    const { id } = await ctx.params;
    const liked = await db
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
    const saved = await db
      .select()
      .from(savedItems)
      .where(
        and(
          eq(savedItems.userId, user.id),
          eq(savedItems.contentType, "video"),
          eq(savedItems.contentId, id)
        )
      )
      .limit(1);
    return NextResponse.json({
      liked: liked.length > 0,
      saved: saved.length > 0,
    });
  } catch (e) {
    return NextResponse.json({ liked: false, saved: false });
  }
}
