import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
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
    const { action } = body;
    if (action === "feature") {
      await db
        .update(videos)
        .set({ isFeatured: true })
        .where(eq(videos.id, id));
    } else if (action === "unfeature") {
      await db
        .update(videos)
        .set({ isFeatured: false })
        .where(eq(videos.id, id));
    } else if (action === "delete") {
      await db.delete(videos).where(eq(videos.id, id));
    } else {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
