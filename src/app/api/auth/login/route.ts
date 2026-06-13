import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, identifier))
      .limit(1);
    let u = userRows[0];
    if (!u) {
      const un = await db
        .select()
        .from(users)
        .where(eq(users.username, identifier))
        .limit(1);
      u = un[0];
    }
    if (!u) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    if (u.isBanned) {
      return NextResponse.json(
        { error: "This account has been banned" },
        { status: 403 }
      );
    }
    if (!verifyPassword(password, u.passwordHash ?? "")) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createSession(u.id);
    const res = NextResponse.json({
      user: {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        isAdmin: u.isAdmin,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
