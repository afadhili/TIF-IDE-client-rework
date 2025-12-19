import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { WebglAddon } from "@xterm/addon-webgl";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import "@xterm/xterm/css/xterm.css";
import { getSocket } from "@/lib/api";
import { ResizableHandle, ResizablePanel } from "./ui/resizable";
import {
  BrushCleaning,
  ChevronUp,
  Loader2,
  Play,
  RefreshCw,
  TerminalIcon,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import useRoomStore from "@/store/room.store";
import { useAuth } from "@/context/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Kbd } from "./ui/kbd";

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socket = getSocket();
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const activeFile = useRoomStore((state) => state.activeFile);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const { user, isContributor } = useAuth();
  const isInitializedRef = useRef(false);

  const handleClearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      socket.emit("terminal-input", "clear\n");
    }
  };

  const handleRefreshTerminal = useCallback(() => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    toast.dismiss("terminal-error");

    setTerminalKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [isRefreshing]);

  const handleRunFile = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    if (activeFile && activeFile.type === "file" && activeRoom && user) {
      xtermRef.current?.focus();
      socket.emit("run-file", activeFile, activeRoom.id, user.id);
    } else {
      toast.info("Please select a file first.", {
        id: "select-file",
      });
    }
    setTimeout(() => {
      setIsRunning(false);
    }, 1000);
  }, [activeFile, activeRoom, user, socket, isRunning]);

  const handleToggleTerminal = () => {
    setIsOpen(!isOpen);
    setTimeout(() => {
      xtermRef.current.focus();
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (event.ctrlKey && event.altKey && event.key === "n") {
        event.preventDefault();
        handleRunFile();
      }

      if (event.ctrlKey && event.shiftKey && event.key === "R") {
        event.preventDefault();
        handleRefreshTerminal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRunFile, handleRefreshTerminal]);

  useEffect(() => {
    if (!terminalRef.current || !activeRoom || !user) return;

    const sessionKey = `${activeRoom.id}-${user.id}`;

    let isMounted = true;
    const cleanupTerminal = () => {
      socket.off("terminal-output");
      socket.off("terminal-exit");
      socket.off("terminal-error");

      socket.emit("leave-terminal", { roomId: activeRoom.id, userId: user.id });

      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }

      fitAddonRef.current = null;
      isInitializedRef.current = false;
    };

    const initTerminal = async () => {
      try {
        if (!isMounted) return;

        const term = new XTerm({
          allowProposedApi: true,
          cursorBlink: true,
          fontFamily:
            "'Fira Code', 'Cascadia Code', 'Monaco', 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.2,
          letterSpacing: 0.5,
          convertEol: true,
          rows: 30,
          cols: 80,
          disableStdin: false,
        });

        xtermRef.current = term;

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        const webLinksAddon = new WebLinksAddon();
        const unicode11Addon = new Unicode11Addon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.loadAddon(unicode11Addon);
        term.unicode.activeVersion = "11";

        try {
          const webglAddon = new WebglAddon();
          term.loadAddon(webglAddon);
        } catch (e) {
          console.warn("WebGL addon failed, falling back to canvas rendering");
          console.error(e);
        }

        term.open(terminalRef.current);

        const performFit = () => {
          try {
            if (fitAddonRef.current && xtermRef.current) {
              fitAddonRef.current.fit();
              const { cols, rows } = xtermRef.current;
              socket.emit("resize-terminal", {
                cols,
                rows,
                roomId: activeRoom.id,
                userId: user.id,
              });
            }
          } catch (err) {
            console.warn("Fit error:", err);
          }
        };

        const handleTerminalOutput = (data: string) => {
          if (xtermRef.current) {
            xtermRef.current.write(data);
          }
        };

        const handleTerminalExit = ({ exitCode }: { exitCode: number }) => {
          console.log(
            `Terminal exited for user ${user.id} with code:`,
            exitCode,
          );
          if (xtermRef.current) {
            xtermRef.current.write(
              `\r\nTerminal session ended (exit code: ${exitCode})\r\n`,
            );
          }
        };

        const handleTerminalError = ({ error }: { error: string }) => {
          console.error(`Terminal error for user ${user.id}:`, error);
          handleRefreshTerminal();
        };

        socket.emit("init-terminal", {
          roomId: activeRoom.id,
          userId: user.id,
          sessionKey: sessionKey,
        });

        socket.on("terminal-output", handleTerminalOutput);
        socket.on("terminal-exit", handleTerminalExit);
        socket.on("terminal-error", handleTerminalError);

        term.onData((data) => {
          if (!isContributor(user))
            return xtermRef.current.write(
              "\n⚠️  Currently on read only mode. You can only run file.",
            );

          socket.emit("terminal-input", {
            data: data,
            roomId: activeRoom.id,
            userId: user.id,
            sessionKey: sessionKey,
          });
        });

        setTimeout(performFit, 100);

        resizeObserverRef.current = new ResizeObserver(() => {
          setTimeout(performFit, 10);
        });

        if (containerRef.current) {
          resizeObserverRef.current.observe(containerRef.current);
        }

        isInitializedRef.current = true;
      } catch (error) {
        console.error("Error initializing terminal:", error);
        toast.error("Failed to initialize terminal. Try refreshing.");
      }
    };

    initTerminal();

    return () => {
      isMounted = false;
      cleanupTerminal();
    };
  }, [socket, activeRoom, user, terminalKey, isContributor]);

  useEffect(() => {
    if (
      !isOpen ||
      !fitAddonRef.current ||
      !xtermRef.current ||
      !user ||
      !activeRoom
    )
      return;

    const performFit = () => {
      try {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
          const { cols, rows } = xtermRef.current;
          socket.emit("resize-terminal", {
            cols,
            rows,
            roomId: activeRoom.id,
            userId: user.id,
          });
        }
      } catch (err) {
        console.warn("Fit error:", err);
      }
    };

    setTimeout(performFit, 100);
  }, [isOpen, socket, activeRoom, user]);

  if (!activeRoom || !user) return null;

  return (
    <>
      <ResizableHandle className={isOpen ? "" : "hidden"} />
      <div className="flex items-center justify-between px-4 py-1 border">
        <div className="flex items-center gap-1">
          <div className="bg-red-500 h-2 w-2 rounded-full border "></div>
          <div className="bg-yellow-500 h-2 w-2 rounded-full border"></div>
          <div className="bg-green-500 h-2 w-2 rounded-full border"></div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center select-none text-muted-foreground ml-4"
          >
            <TerminalIcon className="mr-2 w-4 h-4" />{" "}
            {activeFile?.type === "file" ? activeFile.name : "Terminal"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild className="bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTerminal}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Refresh Terminal <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>R</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild className="bg-background">
              <Button variant="outline" size="sm" onClick={handleClearTerminal}>
                <BrushCleaning className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Terminal</TooltipContent>
          </Tooltip>
          {activeFile && (
            <Tooltip>
              <TooltipTrigger asChild className="bg-background">
                <Button
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  onClick={handleRunFile}
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Run File <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>N</Kbd>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild className="bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleTerminal}
              >
                {isOpen ? <X /> : <ChevronUp />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isOpen ? "Close Terminal " : "Open Terminal "}
              <Kbd>Ctrl</Kbd> + <Kbd>`</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <ResizablePanel
        maxSize={!isOpen ? 0 : 100}
        minSize={isOpen ? 20 : 0}
        defaultSize={Number(localStorage.getItem("terminal-size") || 25)}
        onResize={(size) => {
          localStorage.setItem("terminal-size", String(size));
        }}
        id="terminal-panel"
      >
        <div
          ref={containerRef}
          className={cn(
            "flex-1 w-full h-full terminal-container overflow-hidden bg-[#0a0a0a]",
            !isOpen && "hidden",
          )}
        >
          <div ref={terminalRef} className="w-full h-full px-2" />
        </div>
      </ResizablePanel>
    </>
  );
}
