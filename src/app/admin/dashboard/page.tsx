import { db } from "@/db";
import { users, videos, posts, communities, reports } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { formatNumber, timeAgo } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [usersCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(users);
  const [videosCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(videos);
  const [postsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(posts);
  const [communitiesCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(communities);
  const [reportsCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(reports)
    .where(sql`status = 'pending'`);

  const recentReports = await db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(8);

  const recentUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(6);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Admin dashboard</h1>
      <p className="text-sm text-app-muted mt-1">Platform overview</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile label="Users" value={formatNumber(usersCount?.c || 0)} />
        <StatTile label="Videos" value={formatNumber(videosCount?.c || 0)} />
        <StatTile label="Posts" value={formatNumber(postsCount?.c || 0)} />
        <StatTile
          label="Communities"
          value={formatNumber(communitiesCount?.c || 0)}
        />
        <StatTile
          label="Pending reports"
          value={formatNumber(reportsCount?.c || 0)}
          highlight={!!reportsCount?.c}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-app bg-card p-5">
          <h2 className="font-bold text-lg mb-3">Recent reports</h2>
          {recentReports.length === 0 ? (
            <p className="text-sm text-app-muted">No reports yet</p>
          ) : (
            <ul className="space-y-2">
              {recentReports.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-app-muted text-sm"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {r.contentType} · {r.reason}
                    </p>
                    <p className="text-xs text-app-muted">
                      {timeAgo(r.createdAt)} · {r.status}
                    </p>
                  </div>
                  <Link
                    href="/admin/reports"
                    className="text-xs text-primary font-semibold"
                  >
                    Review →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-app bg-card p-5">
          <h2 className="font-bold text-lg mb-3">Newest users</h2>
          <ul className="space-y-2">
            {recentUsers.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-app-muted"
              >
                <div className="h-8 w-8 rounded-full bg-app-muted grid place-items-center text-sm font-bold shrink-0">
                  {u.profilePicture ? (
                    <span>{u.profilePicture}</span>
                  ) : (
                    <span>{u.displayName[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {u.displayName}
                  </p>
                  <p className="text-xs text-app-muted">@{u.username}</p>
                </div>
                <p className="text-xs text-app-muted">{timeAgo(u.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-primary bg-primary/5"
          : "border-app bg-card"
      }`}
    >
      <p className="text-xs text-app-muted uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
