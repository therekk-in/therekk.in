import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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
      .from(savedItems)
      .where(
        and(
          eq(savedItems.userId, user.id),
          eq(savedItems.contentType, "video"),
          eq(savedItems.contentId, id)
        )
      )
      .limit(1);
    if (existing.length > 0) {
      await db.delete(savedItems).where(eq(savedItems.id, existing[0].id));
      return NextResponse.json({ saved: false });
    } else {
      await db.insert(savedItems).values({
        userId: user.id,
        contentType: "video",
        contentId: id,
      });
      return NextResponse.json({ saved: true });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
