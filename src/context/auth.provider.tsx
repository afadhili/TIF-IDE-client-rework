import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getUser, getToken, isAuthenticated, clearAuthData } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { AuthContext } from "./auth.context";
import useRoomStore from "@/store/room.store";
import { fetchWithAuth, getSocket } from "@/lib/api";
import { toast } from "sonner";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUser());
  const [authenticated, setAuthenticated] = useState<boolean>(!!getToken());
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const [loading, setLoading] = useState(true);
  const socket = getSocket();

  async function refreshAuth() {
    setLoading(true);
    const status = await isAuthenticated();
    setAuthenticated(status);
    setUser(getUser());
    setLoading(false);
  }

  async function logout() {
    const res = await fetchWithAuth("users/logout", {
      method: "POST",
    });
    if (!res.ok) return toast.error("Logout failed!");
    clearAuthData();
    setAuthenticated(false);
    setUser(null);
    toast.success("Logout success!");
  }

  function isAdmin(user: User): boolean {
    return user?.role === "admin";
  }

  function isOwner(user: User): boolean {
    return user?.id === activeRoom?.user?.id;
  }

  function isContributor(user: User): boolean {
    if (user?.role === "admin") return true;
    if (activeRoom?.user?.id === user?.id) return true;
    if (
      activeRoom?.contributors.some(
        (contributor) => contributor.userId === user?.id,
      )
    )
      return true;
    return false;
  }

  useEffect(() => {
    socket.emit("init", { user: user });
  }, [socket, user]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const status = await isAuthenticated();
      if (!mounted) return;

      setAuthenticated(status);
      const user = getUser();
      setUser(user);
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated,
        refreshAuth,
        logout,
        isContributor,
        isAdmin,
        isOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
