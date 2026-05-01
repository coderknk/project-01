import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/client";
import { apiBaseUrl } from "../config.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "ttm_auth";


export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate("/login");
  }, [navigate]);

  const bootstrapAuth = useCallback(async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed?.refreshToken) throw new Error("Missing refresh token");

      setRefreshToken(parsed.refreshToken);
      const refreshRes = await api.post(`${apiBaseUrl}/auth/refresh`, {
        refreshToken: parsed.refreshToken,
      });

      const newAccessToken = refreshRes.data.data.accessToken;
      setAccessToken(newAccessToken);
      setAuthToken(newAccessToken);

      const meRes = await api.get(`${apiBaseUrl}/auth/me`);
      setUser(meRes.data.data.user);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ refreshToken: parsed.refreshToken })
      );
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const login = async (email, password) => {
    const res = await api.post(`${apiBaseUrl}/auth/login`, { email, password });
    const { accessToken: at, refreshToken: rt, user: currentUser } = res.data.data;

    setAccessToken(at);
    setRefreshToken(rt);
    setUser(currentUser);
    setAuthToken(at);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ refreshToken: rt }));
  };

  const register = async (payload) => {
    try {
      await api.post(`${apiBaseUrl}/auth/register`, payload);
    } catch (error) {
      if (error.response?.status === 404) {
        await api.post(`${apiBaseUrl}/auth/signup`, payload);
        return;
      }
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      login,
      register,
      logout,
    }),
    [user, accessToken, refreshToken, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
