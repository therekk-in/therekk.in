import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communities } from "@/db/schema";
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
    if (action === "ban")
      await db
        .update(communities)
        .set({ isBanned: true })
        .where(eq(communities.id, id));
    else if (action === "unban")
      await db
        .update(communities)
        .set({ isBanned: false })
        .where(eq(communities.id, id));
    else if (action === "delete")
      await db.delete(communities).where(eq(communities.id, id));
    else return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
