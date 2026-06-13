import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, votes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].userId !== user.id && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const updates: any = {};
    if ("title" in body) updates.title = body.title;
    if ("content" in body) {
      const history = (rows[0].editHistory as any[]) || [];
      history.push({ content: rows[0].content, editedAt: new Date().toISOString() });
      updates.editHistory = history;
      updates.content = body.content;
    }
    if ("tags" in body) updates.tags = body.tags;
    if ("communityId" in body) updates.communityId = body.communityId;
    await db.update(posts).set(updates).where(eq(posts.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].userId !== user.id && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.delete(posts).where(eq(posts.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
