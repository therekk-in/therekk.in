import { db } from "@/db";
import { reports, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";
import ReportActions from "./ReportActions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const rows = await db
    .select({
      id: reports.id,
      contentType: reports.contentType,
      contentId: reports.contentId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: users.displayName,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt))
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">Reports</h1>
      <p className="text-sm text-app-muted mt-1">{rows.length} reports</p>

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-app bg-app-soft p-10 text-center">
            <p className="font-semibold">All clear</p>
            <p className="text-sm text-app-muted mt-1">No reports to review</p>
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl border border-app bg-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    <span className="capitalize">{r.contentType}</span> ·{" "}
                    {r.reason}
                  </p>
                  <p className="text-xs text-app-muted">
                    Reported by {r.reporterName || "User"} ·{" "}
                    {timeAgo(r.createdAt)}
                  </p>
                  {r.details && (
                    <p className="text-sm text-app-muted mt-1 italic">
                      "{r.details}"
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    r.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : r.status === "resolved"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-app-muted text-app-muted"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <ReportActions
                id={r.id}
                contentType={r.contentType}
                contentId={r.contentId}
                status={r.status}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
