// Editor.tsx
import { useAuth } from "@/context/use-auth";
import { getSocket } from "@/lib/api";
import type { User } from "@/lib/auth";
import useRoomStore, { type FileTree } from "@/store/room.store";
import MonacoEditor, { loader, type Monaco } from "@monaco-editor/react";
import { CheckCircle2, File, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type { editor } from "monaco-editor";
import { cn, getLanguage } from "@/lib/utils";
import setupJavaLanguage from "@/monaco-language/setupJavaLanguage";
import setupPythonLanguage from "@/monaco-language/setupPythonLanguage";
import setupCppLanguage from "@/monaco-language/setupCppLanguage";

export default function Editor() {
  const activeFile = useRoomStore((state) => state.activeFile);
  const setActiveFile = useRoomStore((state) => state.setActiveFile);
  const setActiveItem = useRoomStore((state) => state.setActiveItem);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const { isContributor, user } = useAuth();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"saving" | "saved">("saved");
  const languageSetupDone = useRef(false);
  const socket = getSocket();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const fileIdRef = useRef<string | null>(null);

  loader.config({
    paths: {
      vs: "/monaco-editor/min/vs",
    },
  });

  const syncYTextToEditor = useCallback(() => {
    if (!yTextRef.current || !editorRef.current || isContributor(user as User))
      return;
    const model = editorRef.current.getModel();
    if (!model) return;
    const yContent = yTextRef.current.toString();
    if (model.getValue() !== yContent) {
      model.setValue(yContent);
    }
  }, [isContributor, user]);

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (!languageSetupDone.current) {
      try {
        setupJavaLanguage(monaco);
        setupPythonLanguage(monaco);
        setupCppLanguage(monaco);
        languageSetupDone.current = true;
      } catch (err) {
        console.error("Error setting up languages:", err);
      }
    }

    editor.focus();
  };

  useEffect(() => {
    socket.on("saveSuccess", () => setStatus("saved"));
    socket.on("saveError", () => {
      setStatus("saving");
      toast.error("Failed to save file");
    });

    return () => {
      socket.off("saveSuccess");
      socket.off("saveError");
    };
  }, [socket]);

  useEffect(() => {
    if (!activeFile || !activeRoom) return;

    const fileId = activeFile.path.replaceAll(/[\\/]/g, "_");
    fileIdRef.current = fileId;

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      yDocRef.current = null;
    }

    socket.emit(
      "joinFile",
      { roomId: activeRoom.id, file: activeFile },
      ({
        success,
        content: initialContent,
        state,
      }: {
        success: boolean;
        content: string;
        state: number[];
      }) => {
        if (!success) {
          toast.error("Failed to join file");
          return;
        }

        // Initialize Y.Doc & Y.Text
        const yDoc = new Y.Doc();
        const yText = yDoc.getText("monaco");
        yDocRef.current = yDoc;
        yTextRef.current = yText;

        // Apply server state or fallback to content
        if (state?.length > 0) {
          Y.applyUpdate(yDoc, new Uint8Array(state));
        } else if (initialContent) {
          yText.insert(0, initialContent);
        }

        setContent(yText.toString());

        if (editorRef.current && isContributor(user as User)) {
          bindingRef.current = new MonacoBinding(
            yText,
            editorRef.current.getModel()!,
            new Set([editorRef.current]),
            null,
          );
        }

        const handleYjsUpdate = ({ update }: { update: number[] }) => {
          if (!yDocRef.current) return;
          Y.applyUpdate(yDocRef.current, new Uint8Array(update));
        };

        socket.on("yjs-update", handleYjsUpdate);

        const handleLocalYUpdate = (update: Uint8Array, origin: unknown) => {
          if (!isContributor(user as User) || origin === socket) return;

          setStatus("saving");
          socket.emit("yjs-update", {
            fileId,
            filePath: activeFile.path,
            update: Array.from(update),
          });
        };

        yDoc.on("update", handleLocalYUpdate);

        if (!isContributor(user as User)) {
          const observer = () => {
            syncYTextToEditor();
          };
          yText.observe(observer);
          syncYTextToEditor();

          return () => {
            yText.unobserve(observer);
          };
        }
      },
    );

    const handleSaveFile = async () => {
      if (!activeFile || !activeRoom) return;
      console.log("Saving file");
      setStatus("saving");
      socket.emit("save-file", fileId, activeFile.path, () => {
        setStatus("saved");
        console.log("File saved successfully");
      });
    };

    document.addEventListener("keydown", (event) => {
      if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleSaveFile();
      }
    });

    return () => {
      document.removeEventListener("keydown", handleSaveFile);
      if (activeFile && activeRoom && fileIdRef.current) {
        socket.emit("leaveFile", {
          roomId: activeRoom.id,
          file: activeFile,
        });
      }

      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (yDocRef.current) {
        yDocRef.current.destroy();
        yDocRef.current = null;
      }

      yTextRef.current = null;
      fileIdRef.current = null;
      setContent("");
    };
  }, [activeFile, activeRoom, isContributor, user, socket, syncYTextToEditor]);

  useEffect(() => {
    const handleRemovedFile = (file: FileTree) => {
      if (file.path === activeFile?.path) {
        setActiveFile(null);
        setActiveItem(null);
        toast.info("File was deleted");
      } else if (activeFile?.path.startsWith(file.path + "\\") && activeFile) {
        setActiveFile(null);
        toast.info("Parent folder was deleted");
      }
    };

    const handleRenamedFile = ({
      oldPath,
      newPath,
    }: {
      oldPath: string;
      newPath: string;
    }) => {
      if (oldPath === activeFile?.path && activeFile) {
        setActiveFile({
          ...activeFile,
          path: newPath,
          name: newPath.split(/[\\/]/).pop() || "",
        });
        toast.info("File was renamed");
      } else if (activeFile?.path.startsWith(oldPath) && activeFile) {
        setActiveFile({
          ...activeFile,
          path: activeFile.path.replace(oldPath, newPath),
        });
        toast.info("Folder structure updated");
      }
    };

    const handleSaveFailed = ({ filePath }: { filePath: string }) => {
      if (filePath === activeFile?.path) {
        toast.error("Failed to save file");
      }
    };

    socket.on("removedFile", handleRemovedFile);
    socket.on("renamedFile", handleRenamedFile);
    socket.on("saveFailed", handleSaveFailed);

    return () => {
      socket.off("removedFile", handleRemovedFile);
      socket.off("renamedFile", handleRenamedFile);
      socket.off("saveFailed", handleSaveFailed);
    };
  }, [socket, activeFile, setActiveFile, setActiveItem]);

  return (
    <div className="w-full h-full">
      {activeFile && (
        <div className="flex justify-between px-4 items-center pt-1 pb-2 border-b">
          <div className="flex text-sm items-center gap-2 text-muted-foreground group select-none">
            <File className="w-3 h-3 text-blue-500" />
            <span>{activeFile.name}</span>
            <button
              onClick={() => setActiveFile(null)}
              className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 hover:bg-card cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {isContributor(user) && (
            <div
              className={cn(
                "flex items-center opacity-80 text-sm",
                status === "saving" ? "text-blue-500" : "text-green-500",
              )}
            >
              {status === "saving" ? (
                <div className="flex items-center gap-1.5 text-blue-500 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-green-500 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "text-center text-muted-foreground w-full h-full items-center justify-center font-mono",
          !activeFile ? "flex" : "hidden",
        )}
      >
        <File className="mr-2 w-6 h-6" /> No file selected
      </div>
      <MonacoEditor
        value={content}
        language={getLanguage(activeFile?.name || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          readOnly: !isContributor(user as User),
          automaticLayout: true,
        }}
        onMount={handleEditorDidMount}
        className={!activeFile ? "hidden" : ""}
      />
    </div>
  );
}
