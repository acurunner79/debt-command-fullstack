import { createContext } from "react";
import type { AuthUser } from "../types/auth";

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginUser: (input: LoginInput) => Promise<void>;
  registerUser: (input: RegisterInput) => Promise<void>;
  logoutUser: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);