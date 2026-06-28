// src/context/ProfileContext.jsx
// Load profile (tên, avatar, tiền tệ mặc định) 1 lần sau khi đăng nhập
// Các component dùng hook useProfile() để lấy và cập nhật

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { CURRENCIES } from "../utils/constants";

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  display_name: "",
  avatar_emoji: "💰",
  default_currency: CURRENCIES.VND,
};

export function ProfileProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);

  // Load khi đăng nhập thành công
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset về default khi logout
      setProfile(DEFAULT_PROFILE);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/app-settings/profile");
        setProfile({
          display_name: res.data.display_name || "",
          avatar_emoji: res.data.avatar_emoji || "💰",
          default_currency: res.data.default_currency || CURRENCIES.VND,
        });
      } catch {
        // Lỗi network hoặc chưa có data → dùng default, không crash app
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

  // Cập nhật local state ngay sau khi lưu (không cần reload)
  const updateProfile = (newProfile) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
