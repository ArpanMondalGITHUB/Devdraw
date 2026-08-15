import { createContext,useContext,useState, type ReactNode } from "react";
import type { User } from "@devdraw/shared";

type AuthCtx = {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      setAuth: (u, t) => { setUser(u); setAccessToken(t); },
      clearAuth: () => { setUser(null); setAccessToken(null); },
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
