// types/admin.types.ts
export type UserStatus = "active" | "idle" | "offline" | "banned";
export type UserRole = "admin" | "moderator" | "user" | "suspended";

export type UserActionType =
  | "login"
  | "logout"
  | "file_create"
  | "file_edit"
  | "file_delete"
  | "terminal_command"
  | "share"
  | "settings_change"
  | "error";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActive: string;
  lastLogin: string;
  ipAddress: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  lastPasswordChange: string;
  suspiciousActivities: number;
  rooms: string[];
  files: string[];
}

export interface UserActivity {
  id: string;
  userId: string;
  type: UserActionType;
  timestamp: string;
  description: string;
  details?: string;
}
