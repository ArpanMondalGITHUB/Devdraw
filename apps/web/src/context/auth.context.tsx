import { createContext,useContext,useEffect,useState, type ReactNode } from "react";
import type { User } from "@devdraw/shared";
import authApi from "../api/auth.api";
import { useNavigate, useLocation } from "react-router-dom";

type AuthCtx = {
  user: User | null;
  accessToken: string | null;
  loading:boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const setAuth = (u: User, t: string) => {
    setUser(u);
    setAccessToken(t);
  };
  const clearAuth = () => { setUser(null); setAccessToken(null); };

  useEffect(() => {
    authApi.refresh()
      .then(async ({ accessToken }) => {
        const { user } = await authApi.me(accessToken);
        setAuth(user, accessToken);
        if (location.pathname === "/") navigate("/home");
      })
      .catch((err) => console.error("Session restore failed:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
