import useRoomStore from "@/store/room.store";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useEffect } from "react";
import { useAuth } from "@/context/use-auth";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserPlus, UserX } from "lucide-react";
import type { User } from "@/lib/auth";
import { getSocket } from "@/lib/api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { ResizableHandle, ResizablePanel } from "../ui/resizable";

export default function ActiveUsers() {
  const { user: currentUser, isAdmin, isOwner } = useAuth();
  const activeUsers = useRoomStore((state) => state.activeUsers);
  const setActiveUsers = useRoomStore((state) => state.setActiveUsers);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const socket = getSocket();

  const isContributor = (user: User): boolean => {
    if (user?.role === "admin") return true;
    if (activeRoom?.user?.id === user?.id) return true;

    const userInRoom = activeUsers.find((u) => u.id === user.id);
    if (
      userInRoom &&
      userInRoom.contributors &&
      userInRoom.contributors.length > 0
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    socket.on("accessGranted", (roomId: string) => {
      toast.success(`Access granted to room ${roomId}`);
    });

    socket.on("accessRevoked", (roomId: string) => {
      toast.error(`Access revoked from room ${roomId}`);
    });

    return () => {
      socket.off("accessGranted");
      socket.off("accessRevoked");
    };
  }, [setActiveUsers, socket]);

  const addContributor = (user: User) => {
    if (!currentUser) return;
    if (isAdmin(currentUser) || isOwner(currentUser)) {
      socket.emit(
        "giveAccess",
        { room: activeRoom, userId: user.id },
        ({ success, error }: { success: boolean; error?: string }) => {
          if (success) {
            toast.success(`User added as contributor`);
          } else {
            toast.error(error ? error : `Failed to add user as contributor`);
          }
        },
      );
    }
  };

  const removeContributor = (user: User) => {
    if (!currentUser) return;
    if ((isAdmin(currentUser) || isOwner(currentUser)) && isContributor(user)) {
      socket.emit(
        "removeAccess",
        { room: activeRoom, userId: user.id },
        ({ success, error }: { success: boolean; error?: string }) => {
          if (success) {
            toast.success(`User removed as contributor`);
          } else {
            toast.error(error || `Failed to remove user as contributor`);
          }
        },
      );
    }
  };

  return (
    <>
      <ResizableHandle />
      <div className="flex px-4 border-b items-center justify-between gap-2 select-none">
        <h2 className="py-2 font-mono text-muted-foreground font-semibold">
          Active Users
        </h2>

        <Badge variant="secondary" className="animate-pulse">
          {activeUsers.length}
        </Badge>
      </div>
      <ResizablePanel id="active-users-panel">
        <div className="p-2 h-full">
          <div className="overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-2 scrollbar-hidden">
            {activeUsers.map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild className="w-full">
                  <div
                    className={cn(
                      "flex items-center overflow-hidden justify-between gap-2 px-2 py-1 rounded-md select-none cursor-pointer hover:bg-secondary group",
                      user.id === currentUser?.id && "bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <Avatar>
                        <AvatarFallback
                          className={`h-8 w-8 bg-primary/30 text-primary`}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-mono truncate">
                          {user.name.slice(0, 15)}
                        </span>
                        <span className="text-muted-foreground text-sm truncate">
                          {user.nim} |{" "}
                          {isContributor(user) ? "Contributor" : "Viewer"}
                        </span>
                      </div>
                    </div>

                    {!isAdmin(user) && !isOwner(user) && (
                      <>
                        {(isAdmin(currentUser as User) ||
                          isOwner(currentUser as User)) &&
                          user.id !== currentUser?.id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ">
                              {isContributor(user) ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeContributor(user)}
                                  title="Remove from contributors"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => addContributor(user)}
                                  title="Add to contributors"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {user.name} / {user.nim}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </ResizablePanel>
    </>
  );
}
