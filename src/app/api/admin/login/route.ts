import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return NextResponse.json({ error: "Required" }, { status: 400 });

    // Try env-var admin first
    const envUser = process.env.ADMIN_USERNAME || "admin";
    const envPass = process.env.ADMIN_PASSWORD || "therekk-admin";
    if (username === envUser && password === envPass) {
      // Find or create admin user
      let adminRow = (
        await db.select().from(users).where(eq(users.username, "admin")).limit(1)
      )[0];
      if (!adminRow) {
        const r = await db
          .insert(users)
          .values({
            email: "admin@therekk.local",
            username: "admin",
            displayName: "Admin",
            passwordHash: "", // env-var auth path
            authProvider: "admin",
            isAdmin: true,
          })
          .returning();
        adminRow = r[0];
      }
      const token = await createSession(adminRow.id);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    // Try user-table admin
    const u = (
      await db.select().from(users).where(eq(users.username, username)).limit(1)
    )[0];
    if (u && u.isAdmin && verifyPassword(password, u.passwordHash ?? "")) {
      const token = await createSession(u.id);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
