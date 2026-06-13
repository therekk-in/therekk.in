import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ username: string }> }
) {
  try {
    const user = await getSessionUser();
    const { username } = await ctx.params;
    const target = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (target.length === 0)
      return NextResponse.json({ following: false });
    if (!user) return NextResponse.json({ following: false });
    const f = await db
      .select()
      .from(follows)
      .where(
        and(eq(follows.followerId, user.id), eq(follows.followingId, target[0].id))
      )
      .limit(1);
    return NextResponse.json({ following: f.length > 0 });
  } catch {
    return NextResponse.json({ following: false });
  }
}
