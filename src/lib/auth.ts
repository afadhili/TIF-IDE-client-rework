import type { Room } from "@/store/room.store";
import { fetchWithAuth } from "./api";

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

export async function getUser(): Promise<User | null> {
  const res = await fetchWithAuth("/users/me");
  const userStr = await res.json();
  if (!userStr) return null;
  try {
    return userStr.user;
  } catch {
    return null;
  }
}
