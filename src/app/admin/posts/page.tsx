import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { timeAgo, formatNumber } from "@/lib/utils";
import AdminPostActions from "./AdminPostActions";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      upvotes: posts.upvotes,
      commentsCount: posts.commentsCount,
      createdAt: posts.createdAt,
      userName: users.displayName,
      userUsername: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Manage posts</h1>
      <p className="text-sm text-app-muted mt-1">{rows.length} recent posts</p>
      <div className="mt-6 space-y-2">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap gap-3 items-center justify-between p-3 rounded-2xl border border-app bg-card"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{p.title}</p>
              <p className="text-xs text-app-muted truncate">{p.content}</p>
              <p className="text-xs text-app-muted mt-1">
                {p.userName} · {formatNumber(p.upvotes)} upvotes ·{" "}
                {timeAgo(p.createdAt)}
              </p>
            </div>
            <AdminPostActions id={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
