import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============== USERS ==============
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio").default(""),
  profilePicture: text("profile_picture").default(""),
  isVerified: boolean("is_verified").default(false).notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  showEmail: boolean("show_email").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  socialLinks: jsonb("social_links").$type<{
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  }>().default({}),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),
  passwordHash: text("password_hash").default(""),
  authProvider: text("auth_provider").default("email").notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  followingCount: integer("following_count").default(0).notNull(),
  notificationSettings: jsonb("notification_settings")
    .$type<{
      follow?: boolean;
      like?: boolean;
      comment?: boolean;
      community?: boolean;
      announcement?: boolean;
      emailEnabled?: boolean;
    }>()
    .default({
      follow: true,
      like: true,
      comment: true,
      community: true,
      announcement: true,
      emailEnabled: false,
    })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== COMMUNITIES ==============
export const communities = pgTable("communities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description").default(""),
  rules: jsonb("rules").$type<string[]>().default([]).notNull(),
  category: text("category").default(""),
  profilePicture: text("profile_picture").default(""),
  coverPicture: text("cover_picture").default(""),
  moderatorId: uuid("moderator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  membersCount: integer("members_count").default(1).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== VIDEOS ==============
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default(""),
  telegramFileId: text("telegram_file_id").default(""),
  videoUrl: text("video_url").default(""),
  thumbnailUrl: text("thumbnail_url").default(""),
  category: text("category").default(""),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  subtitleUrl: text("subtitle_url").default(""),
  communityId: uuid("community_id").references(() => communities.id, {
    onDelete: "set null",
  }),
  viewsCount: integer("views_count").default(0).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  commentsEnabled: boolean("comments_enabled").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== POSTS ==============
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").default(""),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  videoUrl: text("video_url").default(""),
  linkUrl: text("link_url").default(""),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  communityId: uuid("community_id").references(() => communities.id, {
    onDelete: "set null",
  }),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  editHistory: jsonb("edit_history")
    .$type<{ content: string; editedAt: string }[]>()
    .default([])
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== COMMENTS ==============
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // 'video' | 'post'
  contentId: uuid("content_id").notNull(),
  parentId: uuid("parent_id"),
  text: text("text").notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== NOTIFICATIONS ==============
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== REPORTS ==============
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details").default(""),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== SAVED ITEMS ==============
export const savedItems = pgTable(
  "saved_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentType: text("content_type").notNull(),
    contentId: uuid("content_id").notNull(),
    isWatchLater: boolean("is_watch_later").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("saved_items_user_content_unique").on(
      t.userId,
      t.contentType,
      t.contentId
    ),
  })
);

// ============== FOLLOWS ==============
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("follows_unique").on(t.followerId, t.followingId),
  })
);

// ============== VOTES ==============
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    voteType: text("vote_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("votes_unique").on(t.userId, t.postId),
  })
);

// ============== LIKES ==============
export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentType: text("content_type").notNull(),
    contentId: uuid("content_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("likes_unique").on(t.userId, t.contentType, t.contentId),
  })
);

// ============== COMMUNITY MEMBERS ==============
export const communityMembers = pgTable(
  "community_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    isBanned: boolean("is_banned").default(false).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("community_members_unique").on(t.userId, t.communityId),
  })
);

// ============== CONTACT MESSAGES ==============
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== SESSIONS (simple JWT-like sessions) ==============
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Community = typeof communities.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Report = typeof reports.$inferSelect;
