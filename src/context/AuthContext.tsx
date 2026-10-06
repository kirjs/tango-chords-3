import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, getAuthErrorMessage, loginWithGoogle, logout } from "../services/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setIsLoading(false);
      }),
    [],
  );

  const value: AuthState = {
    user,
    isLoading,
    error,
    async login() {
      setError(null);
      try {
        await loginWithGoogle();
      } catch (e) {
        setError(getAuthErrorMessage(e));
      }
    },
    async logout() {
      try {
        await logout();
      } catch (e) {
        console.error("Logout error:", e);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
