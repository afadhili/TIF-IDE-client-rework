import type { User } from "@/lib/auth";
import { createContext } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
  isContributor: (user: User) => boolean;
  isAdmin: (user: User) => boolean;
  isOwner: (user: User) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
