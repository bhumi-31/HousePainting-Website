import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi
        .getProfile()
        .then((response) => {
          setUser(response.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem("token", response.token);
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    localStorage.setItem("token", response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await authApi.updateProfile(profileData);
    setUser(response.user);
    return response;
  };

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, updateProfile, isAdmin, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
