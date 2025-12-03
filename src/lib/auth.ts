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
  try {
    const res = await fetchWithAuth("/users/me");
    if (!res.ok) return null;

    const userStr = await res.json();
    if (!userStr || !userStr.user) return null;

    return userStr.user;
  } catch (error) {
    console.error("getUser error:", error);
    return null;
  }
}
