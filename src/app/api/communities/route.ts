import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communities, communityMembers, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ensureArray, slugify, isValidUsername } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, description, rules, category, profilePicture } = body;
    if (!name || name.length < 3 || name.length > 30)
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    if (!/^[a-zA-Z0-9_]+$/.test(name))
      return NextResponse.json(
        { error: "Name can only contain letters, numbers, underscores" },
        { status: 400 }
      );
    const existing = await db
      .select()
      .from(communities)
      .where(eq(communities.name, name))
      .limit(1);
    if (existing.length > 0)
      return NextResponse.json({ error: "Name taken" }, { status: 409 });
    const c = await db
      .insert(communities)
      .values({
        name,
        description: description || "",
        rules: ensureArray<string>(rules),
        category: category || "",
        profilePicture: profilePicture || "",
        moderatorId: user.id,
      })
      .returning();
    await db.insert(communityMembers).values({
      userId: user.id,
      communityId: c[0].id,
    });
    return NextResponse.json({ community: c[0] });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const sort = url.searchParams.get("sort") || "members";
    const orderBy =
      sort === "latest" ? desc(communities.createdAt) : desc(communities.membersCount);
    const result = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        profilePicture: communities.profilePicture,
        membersCount: communities.membersCount,
        category: communities.category,
        moderatorId: communities.moderatorId,
        createdAt: communities.createdAt,
        moderatorName: users.displayName,
        moderatorUsername: users.username,
      })
      .from(communities)
      .leftJoin(users, eq(communities.moderatorId, users.id))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    return NextResponse.json({ communities: result });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
