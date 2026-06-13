import { db } from "@/db";
import { communities, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { timeAgo, formatNumber } from "@/lib/utils";
import AdminCommunityActions from "./AdminCommunityActions";

export const dynamic = "force-dynamic";

export default async function AdminCommunitiesPage() {
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      membersCount: communities.membersCount,
      isBanned: communities.isBanned,
      createdAt: communities.createdAt,
      userName: users.displayName,
    })
    .from(communities)
    .leftJoin(users, eq(communities.moderatorId, users.id))
    .orderBy(desc(communities.membersCount))
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Manage communities</h1>
      <p className="text-sm text-app-muted mt-1">{rows.length} communities</p>
      <div className="mt-6 space-y-2">
        {rows.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap gap-3 items-center justify-between p-3 rounded-2xl border border-app bg-card"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">c/{c.name}</p>
              <p className="text-xs text-app-muted truncate">
                {c.description || "No description"}
              </p>
              <p className="text-xs text-app-muted mt-1">
                {formatNumber(c.membersCount)} members · {c.userName} ·{" "}
                {timeAgo(c.createdAt)}
                {c.isBanned && (
                  <span className="ml-2 text-red-500 font-semibold">
                    Banned
                  </span>
                )}
              </p>
            </div>
            <AdminCommunityActions id={c.id} isBanned={c.isBanned} />
          </div>
        ))}
      </div>
    </div>
  );
}
