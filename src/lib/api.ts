import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  "";

export async function fetchApi(url: string, options: RequestInit = {}) {
  const response = await fetch(
    `${API_URL}/api${url.startsWith("/") ? url : "/" + url}`,
    {
      ...options,
      credentials: "include",
    },
  );

  return response;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetchApi(url, {
    ...options,
  });

  return response;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
    });
  }
  return socket;
}
