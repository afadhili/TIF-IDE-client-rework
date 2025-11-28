import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import useRoomStore from "@/store/room.store";
import { useState } from "react";
import { fetchWithAuth, getSocket } from "@/lib/api"; // sesuaikan path kalau beda
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useAuth } from "@/context/use-auth";

function getFilenameFromDisposition(
  disposition: string | null,
  fallback: string,
) {
  if (!disposition) return fallback;
  const fileNameRegex = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i;
  const matches = fileNameRegex.exec(disposition);
  if (matches && matches[1]) {
    try {
      return decodeURIComponent(matches[1]);
    } catch {
      return matches[1];
    }
  }
  return fallback;
}

export default function RoomHeader() {
  const navigate = useNavigate();
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const socket = getSocket();
  const { user } = useAuth();

  const handleDownload = async () => {
    if (!activeRoom) return;
    setLoading(true);

    try {
      const roomId = activeRoom.id;
      const resp = await fetchWithAuth(
        `/rooms/download/${encodeURIComponent(roomId)}`,
        {
          method: "GET",
        },
      );

      if (!resp.ok) {
        let msg = `Status ${resp.status}`;
        try {
          const j = await resp.json().catch(() => null);
          if (j && j.error) msg = j.error;
        } catch {
          console.log("Error parsing response");
        }
        throw new Error(msg);
      }

      const disposition =
        resp.headers.get("Content-Disposition") ||
        resp.headers.get("content-disposition");
      const filename = getFilenameFromDisposition(disposition, `${roomId}.zip`);

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1500);

      setDownloaded(true);
      socket.emit("downloadedRoom", { room: activeRoom, user });
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Download failed: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-card backdrop-blur-md border-b px-6 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate("/rooms")} variant="ghost" size="sm">
            <ArrowLeft /> Back to Rooms
          </Button>
          <p className="text-muted-foreground text-sm space-x-2">
            <span className="text-foreground">{activeRoom?.name}</span> created
            by {activeRoom?.user?.name}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-4 w-0.5 bg-muted-foreground" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleDownload}
                size="sm"
                variant="ghost"
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Downloading...
                  </>
                ) : downloaded ? (
                  <>
                    <CheckCircle />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download />
                    Download Zip
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download room as a zip file.</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
