import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { loadStatsStart } from "./utils/dateUtils";
import Layout from "./components/Layout";
import PinScreen from "./pages/PinScreen";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Component bảo vệ route — chuyển hướng về PIN nếu chưa đăng nhập
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Sau khi xác thực thành công, tải mốc thống kê 1 lần (dùng cho dropdown tháng/năm)
  useEffect(() => {
    if (isAuthenticated) loadStatsStart();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full border-income border-t-transparent animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/pin" replace />;
}

// Component xử lý route cho màn hình PIN (không cho vào nếu đã đăng nhập)
function PinRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <PinScreen />;
}

// Cấu hình routing toàn bộ app
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Màn hình đăng nhập PIN */}
          <Route path="/pin" element={<PinRoute />} />

          {/* Các màn hình cần đăng nhập */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
