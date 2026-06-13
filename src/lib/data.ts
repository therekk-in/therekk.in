import { db } from "@/db";
import {
  users,
  videos,
  posts,
  communities,
  comments,
  notifications,
  reports,
  savedItems,
  follows,
  votes,
  likes,
  communityMembers,
} from "@/db/schema";
import { desc, eq, sql, and, or, ilike, inArray } from "drizzle-orm";

export async function getCurrentUser() {
  return null;
}

export async function getHomepageData(currentUserId?: string) {
  let trendingVideos: any[] = [];
  let trendingPosts: any[] = [];
  let popularCommunities: any[] = [];

  try {
    trendingVideos = await db
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
      .orderBy(desc(videos.viewsCount))
      .limit(24);

    trendingPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        userId: posts.userId,
        userName: users.displayName,
        userUsername: users.username,
        userPicture: users.profilePicture,
        userVerified: users.isVerified,
        communityId: posts.communityId,
        communityName: communities.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .orderBy(desc(posts.upvotes), desc(posts.createdAt))
      .limit(24);

    popularCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        profilePicture: communities.profilePicture,
        membersCount: communities.membersCount,
        category: communities.category,
      })
      .from(communities)
      .orderBy(desc(communities.membersCount))
      .limit(10);
  } catch (e) {
    console.error("Homepage data error:", e);
  }

  return { trendingVideos, trendingPosts, popularCommunities };
}

export async function getPersonalizedFeed(userId: string) {
  const u = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const interests = (u[0]?.interests as string[]) || [];

  let feedVideos: any[] = [];
  let feedPosts: any[] = [];

  try {
    if (interests.length > 0) {
      feedVideos = await db
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
        .where(inArray(videos.category, interests))
        .orderBy(desc(videos.createdAt))
        .limit(24);
    }

    if (feedVideos.length === 0) {
      feedVideos = await db
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
        .orderBy(desc(videos.createdAt))
        .limit(24);
    }

    if (interests.length > 0) {
      feedPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          upvotes: posts.upvotes,
          downvotes: posts.downvotes,
          commentsCount: posts.commentsCount,
          createdAt: posts.createdAt,
          userId: posts.userId,
          userName: users.displayName,
          userUsername: users.username,
          userPicture: posts.id,
          userVerified: users.isVerified,
          communityId: posts.communityId,
          communityName: communities.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(communities, eq(posts.communityId, communities.id))
        .where(inArray(posts.id, []))
        .orderBy(desc(posts.createdAt))
        .limit(24);
    }

    if (feedPosts.length === 0) {
      feedPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          upvotes: posts.upvotes,
          downvotes: posts.downvotes,
          commentsCount: posts.commentsCount,
          createdAt: posts.createdAt,
          userId: posts.userId,
          userName: users.displayName,
          userUsername: users.username,
          userPicture: users.id,
          userVerified: users.isVerified,
          communityId: posts.communityId,
          communityName: communities.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(communities, eq(posts.communityId, communities.id))
        .orderBy(desc(posts.createdAt))
        .limit(24);
    }
  } catch (e) {
    console.error("Feed data error:", e);
  }

  return { feedVideos, feedPosts };
}
