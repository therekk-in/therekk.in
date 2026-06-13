import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { interests, displayName, username, bio } = body;
    const updates: any = {};
    if (Array.isArray(interests)) updates.interests = interests;
    if (displayName) updates.displayName = displayName;
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    await db.update(users).set(updates).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Onboarding error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
