import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@kamr/shared";
import { USER_SESSION_KEY } from "@kamr/shared";
import { api, ApiError } from "./api";

export type { User };

export async function getUserToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(USER_SESSION_KEY);
  } catch {
    return null;
  }
}

export async function saveUserToken(token: string): Promise<void> {
  await AsyncStorage.setItem(USER_SESSION_KEY, token);
}

export async function clearUserToken(): Promise<void> {
  await AsyncStorage.removeItem(USER_SESSION_KEY);
}

export async function getAccount(): Promise<User | null> {
  const token = await getUserToken();
  if (!token) return null;
  try {
    const result = await api.getMe();
    return result.user;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 0)) {
      await clearUserToken();
    }
    return null;
  }
}

export async function register(body: RegisterRequest): Promise<User> {
  const result = await api.register(body);
  await saveUserToken(result.userToken);
  return result.user;
}

export async function login(body: LoginRequest): Promise<User> {
  const result = await api.login(body);
  await saveUserToken(result.userToken);
  return result.user;
}

export async function logout(): Promise<void> {
  try {
    await api.logout();
  } finally {
    await clearUserToken();
  }
}

export function handleInitials(handle: string): string {
  return handle.slice(0, 2).toUpperCase();
}

export function normalizeHandleInput(handle: string): string {
  return handle.trim().toLowerCase().replace(/^@/, "");
}
