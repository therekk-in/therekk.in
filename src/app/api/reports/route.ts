import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { contentType, contentId, reason, details } = body;
    if (!contentType || !contentId || !reason)
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    await db.insert(reports).values({
      reporterId: user.id,
      contentType,
      contentId,
      reason,
      details: details || "",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
