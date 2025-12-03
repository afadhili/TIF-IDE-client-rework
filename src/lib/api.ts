import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

const APIPORT = import.meta.env.VITE_API_PORT || 3000;
export const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:${APIPORT}`;

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
