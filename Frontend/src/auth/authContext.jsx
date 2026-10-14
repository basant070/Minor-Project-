import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosClient from "../api/axiosClient";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("authToken")),
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    axiosClient
      .get("/auth/profile")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("authToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await axiosClient.post("/auth/login", credentials);
    localStorage.setItem("authToken", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (registration) => {
    const { data } = await axiosClient.post("/auth/register", registration);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
