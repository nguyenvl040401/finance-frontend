import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// Context quản lý trạng thái xác thực PIN toàn app
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Đang kiểm tra token khi app load

  // Khi app khởi động, kiểm tra xem token cũ có còn hợp lệ không
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await api.get("/auth/check");
        setIsAuthenticated(true);
      } catch {
        // Token không hợp lệ, xóa đi
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Đăng nhập: gọi API verify PIN, lưu token vào localStorage
  const login = async (pin) => {
    const response = await api.post("/auth/verify", { pin });
    const { token } = response.data;
    localStorage.setItem("auth_token", token);
    setIsAuthenticated(true);
    return response.data;
  };

  // Đăng xuất: xóa token ở cả frontend và backend
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook tiện lợi để dùng trong component
export const useAuth = () => useContext(AuthContext);
