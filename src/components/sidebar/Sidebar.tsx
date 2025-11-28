import useRoomStore from "@/store/room.store";
import ActiveUsers from "./ActiveUsers";
import FileTree from "./FileTree";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useCallback, useEffect } from "react";

export default function Sidebar() {
  const sidebarOpen = useRoomStore((state) => state.sidebarOpen);
  const setSidebarOpen = useRoomStore((state) => state.setSidebarOpen);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && event.ctrlKey) {
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);

  return (
    <ResizablePanel
      defaultSize={20}
      minSize={sidebarOpen ? 10 : 0}
      maxSize={sidebarOpen ? 70 : 0}
      id="sidebar-panel"
    >
      <div className="h-[calc(100vh-37px)] bg-background">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={75} minSize={20} id="file-tree-panel">
            <div className="p-2 h-full">
              <FileTree />
            </div>
          </ResizablePanel>
          <ActiveUsers />
        </ResizablePanelGroup>
      </div>
    </ResizablePanel>
  );
}
