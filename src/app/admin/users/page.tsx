import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { timeAgo, formatNumber } from "@/lib/utils";
import AdminUserActions from "./AdminUserActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const rows = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Manage users</h1>
      <p className="text-sm text-app-muted mt-1">{rows.length} users</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-app">
        <table className="w-full text-sm">
          <thead className="bg-app-muted text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">
                Followers
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr
                key={u.id}
                className="border-t border-app hover:bg-app-muted/50"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold">{u.displayName}</p>
                  <p className="text-xs text-app-muted">@{u.username}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-app-muted">
                  {u.email}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {formatNumber(u.followersCount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        Admin
                      </span>
                    )}
                    {u.isVerified && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
                        Verified
                      </span>
                    )}
                    {u.isBanned && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">
                        Banned
                      </span>
                    )}
                    {!u.isAdmin && !u.isVerified && !u.isBanned && (
                      <span className="text-xs text-app-muted">Active</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-app-muted text-xs">
                  {timeAgo(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserActions
                    id={u.id}
                    isBanned={u.isBanned}
                    isVerified={u.isVerified}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
