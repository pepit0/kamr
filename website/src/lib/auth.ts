import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@kamr/shared";
import {
  loginFailureMessage,
  normalizeHandleInput,
  USER_SESSION_KEY,
  validateHandleForAccount,
} from "@kamr/shared";
import { api, ApiError } from "./api";

export type { User };

export function getUserToken(): string | null {
  try {
    return localStorage.getItem(USER_SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveUserToken(token: string): void {
  localStorage.setItem(USER_SESSION_KEY, token);
}

export function clearUserToken(): void {
  localStorage.removeItem(USER_SESSION_KEY);
}

export function userAuthHeader(): Record<string, string> {
  const token = getUserToken();
  return token ? { Authorization: `User ${token}` } : {};
}

export async function getAccount(): Promise<User | null> {
  const token = getUserToken();
  if (!token) return null;
  try {
    const result = await api.getMe();
    return result.user;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 0)) {
      clearUserToken();
    }
    return null;
  }
}

export async function register(body: RegisterRequest): Promise<User> {
  const result = await api.register(body);
  saveUserToken(result.userToken);
  return result.user;
}

export async function login(body: LoginRequest): Promise<User> {
  const result = await api.login(body);
  saveUserToken(result.userToken);
  return result.user;
}

export async function logout(): Promise<void> {
  try {
    await api.logout();
  } finally {
    clearUserToken();
  }
}

export function handleInitials(handle: string): string {
  return handle.slice(0, 2).toUpperCase();
}

export { normalizeHandleInput, validateHandleForAccount };

export async function resolveLoginError(handle: string, err: unknown): Promise<string> {
  if (!(err instanceof ApiError)) {
    return "Could not sign in";
  }
  if (err.code !== "INVALID_CREDENTIALS") {
    return err.message;
  }
  const { normalized, error } = validateHandleForAccount(handle);
  if (error) return error;
  try {
    const availability = await api.checkHandleAvailable(normalized);
    return loginFailureMessage(availability);
  } catch {
    return err.message;
  }
}
