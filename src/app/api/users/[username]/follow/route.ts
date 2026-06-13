import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ username: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { username } = await ctx.params;
    if (username === user.username)
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    const target = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (target.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const tid = target[0].id;
    const existing = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, user.id), eq(follows.followingId, tid)))
      .limit(1);
    if (existing.length > 0) {
      await db.delete(follows).where(eq(follows.id, existing[0].id));
      await db
        .update(users)
        .set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` })
        .where(eq(users.id, tid));
      await db
        .update(users)
        .set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` })
        .where(eq(users.id, user.id));
      return NextResponse.json({ following: false });
    } else {
      await db.insert(follows).values({ followerId: user.id, followingId: tid });
      await db
        .update(users)
        .set({ followersCount: sql`${users.followersCount} + 1` })
        .where(eq(users.id, tid));
      await db
        .update(users)
        .set({ followingCount: sql`${users.followingCount} + 1` })
        .where(eq(users.id, user.id));
      return NextResponse.json({ following: true });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
