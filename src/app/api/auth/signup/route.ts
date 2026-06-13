import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession, hashPassword, SESSION_COOKIE } from "@/lib/auth";
import { isValidEmail, isValidUsername } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, displayName } = body;

    if (!email || !password || !username || !displayName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters, alphanumeric or underscores only",
        },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email or username already in use" },
        { status: 409 }
      );
    }

    const isFirstUser = (await db.select().from(users).limit(1)).length === 0;

    const newUser = await db
      .insert(users)
      .values({
        email,
        username,
        displayName,
        passwordHash: hashPassword(password),
        authProvider: "email",
        isAdmin: isFirstUser,
      })
      .returning();

    const token = await createSession(newUser[0].id);

    const res = NextResponse.json({
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        displayName: newUser[0].displayName,
        email: newUser[0].email,
        isAdmin: newUser[0].isAdmin,
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
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
