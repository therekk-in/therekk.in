import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE = "therekk_session";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password + "_therekk_salt").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(sessions).values({ userId, token, expiresAt });
  return token;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sessionRow = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (sessionRow.length === 0) return null;
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionRow[0].userId))
    .limit(1);
  if (userRows.length === 0) return null;
  const u = userRows[0];
  if (u.isBanned) return null;
  return u;
}

export async function getAdminUser() {
  const u = await getSessionUser();
  if (!u || !u.isAdmin) return null;
  return u;
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) throw new Error("Unauthorized");
  return u;
}
