import { Hono } from "hono";
import type { Context } from "hono";
import type { Env, DbUser } from "../types";
import {
  generateId,
  generatePasswordSalt,
  hashPassword,
  hashSecret,
  extractUserToken,
  normalizeHandle,
  nowIso,
  toUser,
  validateHandle,
  verifyPassword,
} from "../utils";
import {
  createUserSession,
  getUser,
  requireUser,
  userResponse,
} from "../middleware/userAuth";

type Variables = { user: DbUser };

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

async function readJson<T>(c: Context): Promise<T | Response> {
  try {
    return await c.req.json<T>();
  } catch {
    return c.json({ error: "Invalid request body", code: "INVALID_BODY" }, 400);
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /unique|UNIQUE constraint/i.test(message);
}

auth.get("/handles/:handle/available", async (c) => {
  const handle = normalizeHandle(c.req.param("handle"));
  const validation = validateHandle(handle);
  if (validation) {
    return c.json({ available: false, error: validation });
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE handle = ? COLLATE NOCASE")
    .bind(handle)
    .first<{ id: string }>();

  return c.json({ available: !existing, handle });
});

auth.post("/register", async (c) => {
  const body = await readJson<{ handle?: string; password?: string }>(c);
  if (body instanceof Response) return body;

  const handle = normalizeHandle(body.handle ?? "");
  const password = body.password ?? "";

  const validation = validateHandle(handle);
  if (validation) {
    return c.json({ error: validation, code: "INVALID_HANDLE" }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters", code: "WEAK_PASSWORD" }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE handle = ? COLLATE NOCASE")
    .bind(handle)
    .first<{ id: string }>();
  if (existing) {
    return c.json({ error: "That handle is already taken", code: "HANDLE_TAKEN" }, 409);
  }

  const id = generateId();
  const salt = generatePasswordSalt();
  const passwordHash = await hashPassword(password, salt);
  const createdAt = nowIso();

  try {
    await c.env.DB.prepare(
      `INSERT INTO users (id, handle, display_name, password_hash, password_salt, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(id, handle, handle, passwordHash, salt, createdAt)
      .run();
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json({ error: "That handle is already taken", code: "HANDLE_TAKEN" }, 409);
    }
    throw err;
  }

  const user: DbUser = {
    id,
    handle,
    display_name: handle,
    password_hash: passwordHash,
    password_salt: salt,
    created_at: createdAt,
  };

  const userToken = await createUserSession(c.env, id);
  return c.json({ user: toUser(user), userToken }, 201);
});

auth.post("/login", async (c) => {
  const body = await readJson<{ handle?: string; password?: string }>(c);
  if (body instanceof Response) return body;

  const handle = normalizeHandle(body.handle ?? "");
  const password = body.password ?? "";

  if (!handle || !password) {
    return c.json({ error: "Handle and password are required", code: "MISSING_CREDENTIALS" }, 400);
  }

  const handleValidation = validateHandle(handle);
  if (handleValidation) {
    return c.json({ error: handleValidation, code: "INVALID_HANDLE" }, 400);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, handle, display_name, password_hash, password_salt, created_at FROM users WHERE handle = ? COLLATE NOCASE"
  )
    .bind(handle)
    .first<DbUser>();

  if (!user || !(await verifyPassword(password, user.password_salt, user.password_hash))) {
    return c.json({ error: "Invalid handle or password", code: "INVALID_CREDENTIALS" }, 401);
  }

  const userToken = await createUserSession(c.env, user.id);
  return c.json({ user: toUser(user), userToken });
});

auth.get("/me", requireUser, (c) => {
  return c.json({ user: userResponse(getUser(c)) });
});

auth.patch("/me", requireUser, async (c) => {
  const body = await c.req.json<{ displayName?: string }>();
  const displayName = body.displayName?.trim();

  if (!displayName) {
    return c.json({ error: "Display name is required" }, 400);
  }

  const user = getUser(c);
  await c.env.DB.prepare("UPDATE users SET display_name = ? WHERE id = ?")
    .bind(displayName, user.id)
    .run();

  return c.json({
    user: userResponse({ ...user, display_name: displayName }),
  });
});

auth.post("/logout", async (c) => {
  const token = extractUserToken(c.req.header("Authorization"));
  if (token) {
    const tokenHash = await hashSecret(token);
    await c.env.DB.prepare("DELETE FROM user_sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
  return c.json({ success: true });
});

export default auth;
