import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get("/auth/me");
          setCurrentUser(res.data.user);
        } catch (err) {
          console.error("Session verification failed:", err.message);
          logout();
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token: receivedToken, user } = res.data;
    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
    setCurrentUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
