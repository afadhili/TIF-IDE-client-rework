import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  File,
  Folder,
  FolderOpen,
  FilePlus2,
  FolderPlus,
  RefreshCcw,
  Trash2Icon,
  EditIcon,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useRoomStore, { type FileTree, type FileType } from "@/store/room.store";
import { getSocket } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { validateFileName, validateFolderName } from "@/lib/validator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/use-auth";
import type { User } from "@/lib/auth";

type FileNodeProps = {
  item: FileTree;
  onSelect?: (item: FileTree | null) => void;
  selectedPath?: string;
  level?: number;
  isAddingFile?: boolean;
  isAddingFolder?: boolean;
  onRemove?: (file: FileTree) => void;
  onRename?: (file: FileTree, newName: string) => void;
  closeAddFile: () => void;
  closeAddFolder: () => void;
  withActions?: boolean;
};

type AddFileProps = {
  close: () => void;
  level?: number;
  parentDir?: string;
  className?: string;
  type: FileType;
};

const INDENT_SIZE = 12;
const PADDING_BASE = 8;
const TOAST_DURATION = 5000;
const DELETE_ACTION_BG = "#b5392b";

const useFileOperations = () => {
  const socket = getSocket();
  const setActiveItem = useRoomStore((state) => state.setActiveItem);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const { user } = useAuth();

  const renameFile = useCallback(
    (file: FileTree, newName: string) => {
      // FIX: Gunakan forward slash untuk Linux/Unix systems
      // Normalize path separator terlebih dahulu
      const normalizedPath = file.path.replace(/\\/g, "/");

      // Split dengan forward slash dan rebuild path
      const pathParts = normalizedPath.split("/");
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join("/");

      console.log(`Rename request: ${file.path} -> ${newPath}`);

      socket.emit(
        "renameFile",
        { roomId: activeRoom?.id, file, newPath },
        user,
        ({ success }: { success: boolean }) => {
          if (success) {
            setActiveItem(null);
            toast.success("File renamed successfully");
          } else {
            toast.error("Failed to rename file");
          }
        },
      );
    },
    [socket, activeRoom, user, setActiveItem],
  );

  const removeFile = useCallback(
    (file: FileTree) => {
      toast.dismiss();
      toast.error("Are you sure you want to delete this file?", {
        description: "This action cannot be undone.",
        duration: TOAST_DURATION,
        action: {
          label: "Delete",
          onClick: () => {
            socket.emit(
              "removeFile",
              { roomId: activeRoom?.id, file },
              user,
              ({ success }: { success: boolean }) => {
                if (success) {
                  setActiveItem(null);
                  toast.success("File deleted successfully");
                } else {
                  toast.error("Failed to delete file");
                }
              },
            );
          },
        },
        closeButton: true,
        actionButtonStyle: {
          backgroundColor: DELETE_ACTION_BG,
          color: "white",
          border: "none",
          borderRadius: "9999px",
          cursor: "pointer",
        },
      });
    },
    [socket, activeRoom, user, setActiveItem],
  );

  const createFile = useCallback(
    (pathName: string, isDir: boolean) => {
      // FIX: Normalize path separator untuk create file juga
      const normalizedPath = pathName.replace(/\\/g, "/");

      socket.emit(
        "createFile",
        {
          roomId: activeRoom?.id,
          pathName: normalizedPath,
          isDir,
        },
        user,
        ({ success }: { success: boolean }) => {
          if (!success) {
            toast.error(`Failed to create ${isDir ? "folder" : "file"}`);
          }
        },
      );
    },
    [socket, activeRoom, user],
  );

  return { renameFile, removeFile, createFile };
};

const useFileEdit = (
  item: FileTree,
  onRename?: (file: FileTree, newName: string) => void,
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [error, setError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const validateName = useCallback(
    (name: string) => {
      return item.type === "directory"
        ? validateFolderName(name)
        : validateFileName(name);
    },
    [item.type],
  );

  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setError(validateName(name));
      setNewName(name);
    },
    [validateName],
  );

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setNewName(item.name);
    setError(null);
  }, [item.name]);

  const handleEditConfirm = useCallback(() => {
    if (error) {
      toast.error(error);
      return;
    }
    setIsEditing(false);
    setError(null);
    onRename?.(item, newName);
  }, [error, item, newName, onRename]);

  const startEditing = useCallback(() => setIsEditing(true), []);

  useEffect(() => {
    if (!isEditing) return;

    editInputRef.current?.focus();

    if (item.type === "directory") {
      editInputRef.current?.select();
    } else {
      const dotIndex = item.name.lastIndexOf(".");
      if (dotIndex <= 0) {
        editInputRef.current?.select();
        return;
      }
      editInputRef.current?.setSelectionRange(0, dotIndex);
    }
  }, [isEditing, item.type, item.name]);

  return {
    isEditing,
    newName,
    error,
    editInputRef,
    handleEditChange,
    handleEditCancel,
    handleEditConfirm,
    startEditing,
  };
};

// Sub-components
const FileIcon = ({
  type,
  isExpanded,
}: {
  type: FileType;
  isExpanded: boolean;
}) => {
  if (type === "directory") {
    return isExpanded ? (
      <FolderOpen className="w-4 h-4 shrink-0 text-blue-500" />
    ) : (
      <Folder className="w-4 h-4 shrink-0 text-blue-500" />
    );
  }
  return <File className="w-4 h-4 shrink-0 text-yellow-600" />;
};

const FileActions = ({
  onEdit,
  onRemove,
}: {
  onEdit: () => void;
  onRemove: () => void;
}) => (
  <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <button
      onClick={onEdit}
      className="rounded-sm p-1 hover:text-blue-500/50 cursor-pointer bg-transparent hover:bg-blue-300/10"
      aria-label="Edit file"
    >
      <EditIcon className="w-4 h-4 shrink-0" />
    </button>
    <button
      className="rounded-sm p-1 hover:text-red-600/50 cursor-pointer bg-transparent hover:bg-red-300/10"
      onClick={onRemove}
      aria-label="Delete file"
    >
      <Trash2Icon className="w-4 h-4 shrink-0" />
    </button>
  </div>
);

const EditableFileName = ({
  isEditing,
  value,
  error,
  inputRef,
  onChange,
  onKeyDown,
  onBlur,
}: {
  isEditing: boolean;
  value: string;
  error: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  displayName: string;
}) => (
  <Tooltip open={error !== null}>
    <TooltipTrigger asChild>
      <input
        value={value}
        className={cn(
          "text-sm truncate focus:outline-none w-full py-0.5",
          !isEditing && "hidden",
        )}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        ref={inputRef}
        aria-label="File name input"
      />
    </TooltipTrigger>
    <TooltipContent className="text-red-500">{error}</TooltipContent>
  </Tooltip>
);

const FileNode = ({
  item,
  onSelect,
  selectedPath,
  level = 0,
  onRemove,
  onRename,
  isAddingFile,
  closeAddFile,
  isAddingFolder,
  closeAddFolder,
  withActions,
}: FileNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = item.type === "directory";
  const isSelected = selectedPath === item.path;

  const {
    isEditing,
    newName,
    error,
    editInputRef,
    handleEditChange,
    handleEditCancel,
    handleEditConfirm,
    startEditing,
  } = useFileEdit(item, onRename);

  const handleToggle = useCallback(() => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    }
  }, [isDirectory, isExpanded]);

  const handleSelect = useCallback(() => {
    if (isDirectory) handleToggle();
    onSelect?.(item);
  }, [isDirectory, handleToggle, onSelect, item]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleEditConfirm();
      } else if (e.key === "Escape") {
        handleEditCancel();
      }
    },
    [handleEditConfirm, handleEditCancel],
  );

  useEffect(() => {
    const expandedInit = () => {
      if (selectedPath === item.path && (isAddingFile || isAddingFolder)) {
        setIsExpanded(true);
      }
    };
    expandedInit();
  }, [isAddingFile, isAddingFolder, selectedPath, item.path]);

  const paddingLeft = level * INDENT_SIZE + PADDING_BASE;

  return (
    <li className="select-none">
      <div
        className={cn(
          "relative flex group items-center gap-1 mx-px py-1 px-2 rounded-sm cursor-pointer hover:bg-secondary transition-colors",
          isSelected && "bg-card",
          error && isEditing && "outline outline-red-500",
        )}
        style={{ paddingLeft }}
        onClick={handleSelect}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <FileIcon type={item.type} isExpanded={isExpanded} />

          <EditableFileName
            isEditing={isEditing}
            value={newName}
            error={error}
            inputRef={editInputRef as React.RefObject<HTMLInputElement>}
            onChange={handleEditChange}
            onKeyDown={handleKeyDown}
            onBlur={handleEditCancel}
            displayName={item.name}
          />

          <span
            className={cn("text-sm truncate w-full", isEditing && "hidden")}
          >
            {item.name}
          </span>

          {!isEditing && withActions && (
            <FileActions
              onEdit={startEditing}
              onRemove={() => onRemove?.(item)}
            />
          )}
          {!isEditing && !withActions && (
            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                className="rounded-sm text-muted-foreground p-1 hover:text-blue-500/50 cursor-pointer bg-transparent hover:bg-blue-300/10"
                title="On read only mode, you can only view the file content."
              >
                <Book className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {(isAddingFile || isAddingFolder) &&
        selectedPath === item.path &&
        !isDirectory && (
          <AddFile
            close={() => {
              closeAddFile();
              closeAddFolder();
            }}
            parentDir={item.path.slice(0, item.path.lastIndexOf("\\"))}
            level={level}
            className="mt-0.5"
            type={isAddingFile ? "file" : "directory"}
          />
        )}

      {isDirectory && isExpanded && (
        <ul className="ml-0">
          {(isAddingFile || isAddingFolder) &&
            selectedPath === item.path &&
            isDirectory && (
              <AddFile
                close={() => {
                  closeAddFolder();
                  closeAddFile();
                }}
                parentDir={item.path}
                level={level + 1}
                className="mt-0.5"
                type={isAddingFile ? "file" : "directory"}
              />
            )}
          {item.children?.map((child) => (
            <FileNode
              key={child.path}
              item={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              level={level + 1}
              onRemove={onRemove}
              onRename={onRename}
              isAddingFile={isAddingFile}
              closeAddFile={closeAddFile}
              isAddingFolder={isAddingFolder}
              closeAddFolder={closeAddFolder}
              withActions={withActions}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const AddFile = ({
  close,
  level = 0,
  parentDir = "",
  className = "",
  type = "file",
}: AddFileProps) => {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const { createFile } = useFileOperations();

  useEffect(() => {
    newFileRef.current?.focus();
  }, []);

  const handleCreateFile = useCallback(() => {
    if (error) {
      toast.error(error);
      return;
    }

    if (!newName.trim()) {
      close();
      return;
    }

    // FIX: Gunakan forward slash, bukan backslash
    const normalizedParentDir = parentDir.replace(/\\/g, "/");
    const normalizedRoomPath = activeRoom?.path.replace(/\\/g, "/");

    const pathName = normalizedParentDir
      ? `${normalizedParentDir}/${newName}`
      : `${normalizedRoomPath}/${newName}`;

    createFile(pathName, type === "directory");
    setNewName("");
    close();
  }, [newName, error, parentDir, activeRoom?.path, type, createFile, close]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setError(
        type === "directory"
          ? validateFolderName(value)
          : validateFileName(value),
      );
      setNewName(value);
    },
    [type],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCreateFile();
      } else if (e.key === "Escape") {
        close();
      }
    },
    [handleCreateFile, close],
  );

  const paddingLeft = level * INDENT_SIZE + PADDING_BASE;

  return (
    <div
      className={cn(
        "bg-card relative flex group items-center gap-1 mx-px py-1 px-2 rounded-sm cursor-pointer hover:bg-secondary transition-colors",
        className,
      )}
      style={{ paddingLeft }}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {type === "file" ? (
          <File className="w-4 h-4 shrink-0 text-yellow-600" />
        ) : (
          <Folder className="w-4 h-4 shrink-0 text-blue-600" />
        )}
        <Tooltip open={error !== null}>
          <TooltipTrigger asChild>
            <input
              value={newName}
              className="text-sm truncate focus:outline-none w-full py-0.5"
              placeholder={`New ${type} name`}
              onChange={handleChange}
              ref={newFileRef}
              onKeyDown={handleKeyDown}
              onBlur={close}
              aria-label={`New ${type} name input`}
            />
          </TooltipTrigger>
          <TooltipContent className="text-red-500">{error}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const FileTreeHeader = ({
  onNewFile,
  onNewFolder,
  onRefresh,
  ...props
}: {
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
} & React.RefAttributes<HTMLDivElement>) => {
  const { user: currentUser, isContributor } = useAuth();

  return (
    <div
      {...props}
      className="sticky top-0 bg-background flex items-center gap-2 mb-2 px-4 justify-between z-10 select-none"
    >
      <h2 className="font-semibold font-mono text-muted-foreground">
        Explorer
      </h2>

      <div className="flex gap-1">
        {isContributor(currentUser as User) && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewFile}
              aria-label="Add new file"
              title="Add new file"
            >
              <FilePlus2 />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewFolder}
              aria-label="Add new folder"
              title="Add new folder"
            >
              <FolderPlus />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          aria-label="Refresh file tree"
          title="Refresh file tree"
        >
          <RefreshCcw />
        </Button>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex items-center justify-center py-4">
    <p className="text-sm text-muted-foreground">No files or folders found.</p>
  </div>
);

export default function FileTree() {
  const fileTree = useRoomStore((state) => state.fileTree);
  const setFileTree = useRoomStore((state) => state.setFileTree);
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const setActiveItem = useRoomStore((state) => state.setActiveItem);
  const setActiveFile = useRoomStore((state) => state.setActiveFile);
  const activeItem = useRoomStore((state) => state.activeItem);
  const headerTreeRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const { isContributor, user: currentUser } = useAuth();

  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const { renameFile, removeFile } = useFileOperations();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        treeRef.current &&
        !treeRef.current.contains(e.target as Node) &&
        !isAddingFile &&
        !isAddingFolder &&
        !headerTreeRef.current?.contains(e.target as Node) &&
        !headerTreeRef.current?.contains(e.target as Node)
      ) {
        setActiveItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setActiveItem, isAddingFile, isAddingFolder]);

  useEffect(() => {
    const socket = getSocket();

    const handleFileTree = (data: FileTree[]) => {
      setFileTree(data);
    };

    socket.emit("exploreRoom", { roomId: activeRoom?.id }, handleFileTree);
    socket.on("fileTree", handleFileTree);

    return () => {
      socket.off("fileTree", handleFileTree);
      setActiveItem(null);
      setActiveFile(null);
    };
  }, [setFileTree, activeRoom, setActiveItem, setActiveFile]);

  const handleSelect = useCallback(
    (item: FileTree | null) => {
      setActiveItem(item);
      if (item && item.type === "file") {
        setActiveFile(item);
      }
    },
    [setActiveItem, setActiveFile],
  );

  const handleNewFile = useCallback(() => setIsAddingFile(true), []);
  const handleNewFolder = useCallback(() => setIsAddingFolder(true), []);
  const closeAddFile = useCallback(() => setIsAddingFile(false), []);
  const closeAddFolder = useCallback(() => setIsAddingFolder(false), []);

  const handleRefresh = useCallback(() => {
    getSocket().emit("exploreRoom", { roomId: activeRoom?.id }, setFileTree);
  }, [activeRoom, setFileTree]);

  const hasFiles = useMemo(() => fileTree && fileTree.length > 0, [fileTree]);

  return (
    <div className="flex flex-col overflow-hidden">
      <FileTreeHeader
        ref={headerTreeRef}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onRefresh={handleRefresh}
      />

      <div
        ref={treeRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden"
      >
        <ul className="space-y-0.5">
          {fileTree?.map((item) => (
            <FileNode
              key={item.path}
              item={item}
              onSelect={handleSelect}
              selectedPath={activeItem?.path}
              level={0}
              onRemove={removeFile}
              onRename={renameFile}
              isAddingFile={isAddingFile}
              closeAddFile={closeAddFile}
              isAddingFolder={isAddingFolder}
              closeAddFolder={closeAddFolder}
              withActions={isContributor(currentUser as User)}
            />
          ))}

          {(isAddingFile || isAddingFolder) && !activeItem && (
            <AddFile
              close={() => {
                setIsAddingFile(false);
                setIsAddingFolder(false);
              }}
              level={0}
              type={isAddingFile ? "file" : "directory"}
            />
          )}
        </ul>

        {!hasFiles && <EmptyState />}
      </div>
    </div>
  );
}
