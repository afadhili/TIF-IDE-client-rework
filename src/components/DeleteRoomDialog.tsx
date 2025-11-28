import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/use-auth";
import { getSocket } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Room = {
  id: string;
  name: string;
  description: string;
  user: {
    id: number;
    nim: string;
    name: string;
  };
};

interface DeleteRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

export function DeleteRoomDialog({
  open,
  onOpenChange,
  room,
}: DeleteRoomDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!room) return;

    setIsDeleting(true);
    try {
      const socket = getSocket();

      socket.emit(
        "deleteRoom",
        { room, user },
        (response: { success: boolean; message: string }) => {
          setIsDeleting(false);
          if (response.success) {
            socket.emit("getRooms", true);
            toast.success("Room deleted successfully!");
            onOpenChange(false);
          } else {
            toast.error(response.message || "Failed to delete room");
          }
        },
      );
    } catch (error) {
      setIsDeleting(false);
      toast.error("An error occurred while deleting the room");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Room</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this room? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p className="font-semibold text-sm">{room?.name}</p>
            {room?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {room?.description}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
