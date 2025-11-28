import Editor from "@/components/Editor";
import Loading from "@/components/Loading";
import RoomHeader from "@/components/RoomHeader";
import Sidebar from "@/components/sidebar/Sidebar";
import Terminal from "@/components/Terminal";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAuth } from "@/context/use-auth";
import { fetchWithAuth, getSocket } from "@/lib/api";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";
import useRoomStore from "@/store/room.store";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function Room() {
  const { loading, authenticated, user } = useAuth();
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const activeFile = useRoomStore((state) => state.activeFile);
  const setActiveRoom = useRoomStore((state) => state.setActiveRoom);
  const setActiveUsers = useRoomStore((state) => state.setActiveUsers);
  const sidebarOpen = useRoomStore((state) => state.sidebarOpen);
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    document.title =
      "TIF-IDE | " +
      activeRoom?.name +
      (activeFile ? " - " + activeFile.name : "");
  }, [activeRoom, activeFile]);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("joinRoom", { roomId, user }, (users: User[]) => {
      setActiveUsers(users);
    });

    socket.on("activeUsers", (users: User[]) => {
      setActiveUsers(users);
    });

    socket.on("roomJoined", ({ users }) => {
      setActiveUsers(users);
    });

    socket.on("roomLeft", ({ users }) => {
      setActiveUsers(users);
    });

    return () => {
      socket.emit("leaveRoom", { roomId, user });
      socket.off("activeUsers");
      socket.off("roomJoined");
      socket.off("roomLeft");
    };
  }, [roomId, user, setActiveUsers]);

  useEffect(() => {
    if (!authenticated) {
      navigate("/");
      return;
    }

    const checkRoom = async () => {
      const res = await fetchWithAuth(`/rooms/check/${roomId}`);
      if (!res.ok) {
        navigate("/rooms");
        return;
      }
      const data = await res.json();
      setActiveRoom(data.room);
    };

    checkRoom();

    const socket = getSocket();

    socket.on("roomDeleted", () => {
      toast("This room has been deleted by the owner");
      navigate("/rooms");
    });

    socket.on("roomUpdated", (room) => {
      setActiveRoom(room);
    });

    return () => {
      socket.off("roomDeleted");
      socket.off("roomUpdated");
      setActiveRoom(null);
    };
  }, [authenticated, navigate, roomId, setActiveRoom]);

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <RoomHeader />
      <ResizablePanelGroup direction="horizontal" className="border w-full">
        <Sidebar />
        <ResizableHandle className={cn(!sidebarOpen && "hidden")} />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <Editor />
            </ResizablePanel>
            <Terminal />
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
