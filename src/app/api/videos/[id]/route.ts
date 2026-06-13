import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ video: rows[0] });
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
    const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].userId !== user.id && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const updates: any = {};
    for (const k of [
      "title",
      "description",
      "thumbnailUrl",
      "category",
      "tags",
      "commentsEnabled",
    ]) {
      if (k in body) updates[k] = body[k];
    }
    await db.update(videos).set(updates).where(eq(videos.id, id));
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
    const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].userId !== user.id && !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.delete(videos).where(eq(videos.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
