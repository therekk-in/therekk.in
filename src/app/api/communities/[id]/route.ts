import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communities, communityMembers } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const rows = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ community: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const c = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
    if (c.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existing = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.userId, user.id),
          eq(communityMembers.communityId, id)
        )
      )
      .limit(1);
    if (existing.length > 0) {
      await db.delete(communityMembers).where(eq(communityMembers.id, existing[0].id));
      await db
        .update(communities)
        .set({ membersCount: sql`GREATEST(${communities.membersCount} - 1, 1)` })
        .where(eq(communities.id, id));
      return NextResponse.json({ joined: false });
    } else {
      await db.insert(communityMembers).values({ userId: user.id, communityId: id });
      await db
        .update(communities)
        .set({ membersCount: sql`${communities.membersCount} + 1` })
        .where(eq(communities.id, id));
      return NextResponse.json({ joined: true });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
