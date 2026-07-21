import type { Context, Next } from "hono";
import type { Env, DbUser } from "../types";
import { extractUserToken, hashSecret, toUser } from "../utils";

export interface UserContext {
  user: DbUser;
}

const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export function sessionExpiresAt(from = Date.now()): string {
  return new Date(from + SESSION_TTL_MS).toISOString();
}

export async function createUserSession(env: Env, userId: string): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
  const tokenHash = await hashSecret(token);
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO user_sessions (token_hash, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?)`
  )
    .bind(tokenHash, userId, createdAt, sessionExpiresAt())
    .run();
  return token;
}

export async function resolveUserFromToken(
  env: Env,
  token: string
): Promise<DbUser | null> {
  const tokenHash = await hashSecret(token);
  const row = await env.DB.prepare(
    `SELECT u.id, u.handle, u.display_name, u.password_hash, u.password_salt, u.created_at
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`
  )
    .bind(tokenHash, new Date().toISOString())
    .first<DbUser>();
  return row ?? null;
}

export async function optionalUser(c: Context<{ Bindings: Env }>, next: Next) {
  const token = extractUserToken(c.req.header("Authorization"));
  if (token) {
    const user = await resolveUserFromToken(c.env, token);
    if (user) {
      c.set("user", user);
    }
  }
  await next();
}

export async function requireUser(c: Context<{ Bindings: Env }>, next: Next) {
  const token = extractUserToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Authentication required", code: "AUTH_REQUIRED" }, 401);
  }
  const user = await resolveUserFromToken(c.env, token);
  if (!user) {
    return c.json({ error: "Invalid or expired session", code: "AUTH_INVALID" }, 401);
  }
  c.set("user", user);
  await next();
}

export function getUser(c: Context): DbUser {
  return c.get("user") as DbUser;
}

export function userResponse(user: DbUser) {
  return toUser(user);
}
