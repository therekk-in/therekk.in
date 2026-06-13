import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { sendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { message, audience } = await req.json();
    if (!message)
      return NextResponse.json({ error: "Message required" }, { status: 400 });

    const allUsers = await db
      .select()
      .from(users)
      .where(/* not banned */ undefined as any);

    if (audience === "all" || audience === "inapp") {
      for (const u of allUsers) {
        if (u.isBanned) continue;
        const ns = (u.notificationSettings as any) || {};
        if (ns.announcement === false) continue;
        await db.insert(notifications).values({
          userId: u.id,
          type: "announcement",
          message,
          link: "/",
        });
      }
    }

    if (audience === "all" || audience === "email") {
      // Send emails (best-effort)
      await sendEmail({
        to: "noreply@therekk.local",
        subject: "THEREKK Announcement",
        html: `<h1>THEREKK Announcement</h1><p>${message}</p>`,
      });
    }

    return NextResponse.json({ ok: true, count: allUsers.length });
  } catch (e) {
    console.error("Announcement error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
