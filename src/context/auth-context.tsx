// src/context/auth-context.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserType } from "@/types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const user: UserType | null = session?.user
    ? {
        id: Number(session.user.id),
        email: session.user.email as string,
        name: session.user.name as string,
        role: session.user.role
          ? { id: 0, name: session.user.role as string, status: 1 }
          : null,
      }
    : null;

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      console.error("Login failed:", result.error);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!session, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}