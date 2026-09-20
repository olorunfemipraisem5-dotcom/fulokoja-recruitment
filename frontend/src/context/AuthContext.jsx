import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fulokoja_token");
    const storedUser = localStorage.getItem("fulokoja_user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("fulokoja_token", data.token);
    localStorage.setItem("fulokoja_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (fullName, email, phone, password) => {
    const { data } = await api.post("/auth/register", { fullName, email, phone, password });
    localStorage.setItem("fulokoja_token", data.token);
    localStorage.setItem("fulokoja_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("fulokoja_token");
    localStorage.removeItem("fulokoja_user");
    setUser(null);
  };

  // Merges updated fields (e.g. after editing the profile) into the stored user
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem("fulokoja_user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
