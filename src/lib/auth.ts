import type { Room } from "@/store/room.store";
import { fetchApi } from "./api";

export type Contributor = {
  roomId: string;
  userId: number;
};

export interface User {
  id: number;
  nim: string;
  name: string;
  role: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  lastOnline: string;
  rooms: Room[];
  status: "active" | "offline";
  contributors: Contributor[];
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuthData(token: string, user: User): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function isAuthenticated(): Promise<boolean> {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetchApi("/users/verify", {
    headers,
  });
  if (res.status === 401) return false;
  return true;
}
