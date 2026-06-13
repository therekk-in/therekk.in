import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ensureArray, isValidUsername } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const {
      title,
      description,
      category,
      tags,
      thumbnailUrl,
      telegramFileId,
      videoUrl,
      communityId,
      subtitleUrl,
    } = body;

    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }
    if (!telegramFileId && !videoUrl) {
      return NextResponse.json(
        { error: "Video is required" },
        { status: 400 }
      );
    }

    const v = await db
      .insert(videos)
      .values({
        userId: user.id,
        title,
        description: description || "",
        category: category || "",
        tags: ensureArray<string>(tags),
        thumbnailUrl: thumbnailUrl || "",
        telegramFileId: telegramFileId || "",
        videoUrl: videoUrl || "",
        communityId: communityId || null,
        subtitleUrl: subtitleUrl || "",
      })
      .returning();

    return NextResponse.json({ video: v[0] });
  } catch (e) {
    console.error("Video create error:", e);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "24"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const category = url.searchParams.get("category");
    const userId = url.searchParams.get("userId");

    let query = db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        viewsCount: videos.viewsCount,
        likesCount: videos.likesCount,
        createdAt: videos.createdAt,
        category: videos.category,
        userId: videos.userId,
        userName: users.displayName,
        userUsername: users.username,
        userPicture: users.profilePicture,
        userVerified: users.isVerified,
      })
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .$dynamic();

    if (category) {
      query = query.where(eq(videos.category, category));
    }
    if (userId) {
      query = query.where(eq(videos.userId, userId));
    }

    const result = await query
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ videos: result });
  } catch (e) {
    console.error("Video list error:", e);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
