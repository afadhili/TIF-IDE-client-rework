import type { Contributor, User } from "@/lib/auth";
import { create } from "zustand";

export type Room = {
  id: string;
  name: string;
  description: string;
  path: string;
  user: User | null;
  activeUsers: User[];
  contributors: Contributor[];
};

export type FileType = "file" | "directory";

export type FileTree = {
  name: string;
  type: FileType;
  path: string;
  children?: FileTree[] | null;
};

type State = {
  activeRoom: Room | null;
  activeUsers: User[];
  fileTree: FileTree[] | null;
  activeFile: FileTree | null;
  activeItem: FileTree | null;
  sidebarOpen: boolean;
};

type Action = {
  setActiveRoom: (room: Room | null) => void;
  setActiveUsers: (users: User[]) => void;
  setFileTree: (tree: FileTree[] | null) => void;
  setActiveFile: (file: FileTree | null) => void;
  setActiveItem: (item: FileTree | null) => void;
  setSidebarOpen: (open: boolean) => void;
};

const useRoomStore = create<State & Action>((set) => ({
  activeRoom: null,
  activeUsers: [],
  fileTree: [],
  activeFile: null,
  activeItem: null,
  sidebarOpen: true,

  setFileTree: (tree: FileTree[] | null) => {
    set({ fileTree: tree });
  },
  setActiveRoom: (room: Room | null) => {
    set({ activeRoom: room });
  },
  setActiveUsers: (users: User[]) => {
    set({ activeUsers: users });
  },
  setActiveFile: (file: FileTree | null) => {
    set({ activeFile: file });
  },
  setActiveItem: (item: FileTree | null) => {
    set({ activeItem: item });
  },
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },
}));

export default useRoomStore;
