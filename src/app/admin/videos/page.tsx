import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { timeAgo, formatNumber } from "@/lib/utils";
import AdminVideoActions from "./AdminVideoActions";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const rows = await db
    .select({
      id: videos.id,
      title: videos.title,
      viewsCount: videos.viewsCount,
      likesCount: videos.likesCount,
      isFeatured: videos.isFeatured,
      createdAt: videos.createdAt,
      userName: users.displayName,
      userUsername: users.username,
    })
    .from(videos)
    .leftJoin(users, eq(videos.userId, users.id))
    .orderBy(desc(videos.createdAt))
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Manage videos</h1>
      <p className="text-sm text-app-muted mt-1">{rows.length} recent videos</p>

      <div className="mt-6 space-y-2">
        {rows.map((v) => (
          <div
            key={v.id}
            className="flex flex-wrap gap-3 items-center justify-between p-3 rounded-2xl border border-app bg-card"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{v.title}</p>
              <p className="text-xs text-app-muted">
                {v.userName} · {formatNumber(v.viewsCount)} views ·{" "}
                {timeAgo(v.createdAt)}
                {v.isFeatured && (
                  <span className="ml-2 text-primary font-semibold">
                    ⭐ Featured
                  </span>
                )}
              </p>
            </div>
            <AdminVideoActions id={v.id} isFeatured={v.isFeatured} />
          </div>
        ))}
      </div>
    </div>
  );
}
