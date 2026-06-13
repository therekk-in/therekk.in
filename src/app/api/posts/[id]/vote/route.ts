import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, votes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const body = await req.json();
    const { voteType } = body;
    if (voteType !== "up" && voteType !== "down")
      return NextResponse.json({ error: "Bad vote" }, { status: 400 });

    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, user.id), eq(votes.postId, id)))
      .limit(1);

    const old = existing[0]?.voteType;

    if (existing.length > 0) {
      if (old === voteType) {
        // Remove vote
        await db.delete(votes).where(eq(votes.id, existing[0].id));
        const field = old === "up" ? posts.upvotes : posts.downvotes;
        await db
          .update(posts)
          .set({ [old === "up" ? "upvotes" : "downvotes"]: sql`GREATEST(${field} - 1, 0)` })
          .where(eq(posts.id, id));
        return NextResponse.json({ vote: null });
      } else {
        // Switch vote
        await db
          .update(votes)
          .set({ voteType })
          .where(eq(votes.id, existing[0].id));
        const inc = voteType === "up" ? posts.upvotes : posts.downvotes;
        const dec = old === "up" ? posts.upvotes : posts.downvotes;
        await db
          .update(posts)
          .set({
            [voteType === "up" ? "upvotes" : "downvotes"]: sql`${inc} + 1`,
            [old === "up" ? "upvotes" : "downvotes"]: sql`GREATEST(${dec} - 1, 0)`,
          })
          .where(eq(posts.id, id));
        return NextResponse.json({ vote: voteType });
      }
    } else {
      await db.insert(votes).values({
        userId: user.id,
        postId: id,
        voteType,
      });
      const field = voteType === "up" ? posts.upvotes : posts.downvotes;
      await db
        .update(posts)
        .set({ [voteType === "up" ? "upvotes" : "downvotes"]: sql`${field} + 1` })
        .where(eq(posts.id, id));
      return NextResponse.json({ vote: voteType });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
