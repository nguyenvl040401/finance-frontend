import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { loadStatsStart } from "./utils/dateUtils";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

const PinScreen = lazy(() => import("./pages/PinScreen"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Categories = lazy(() => import("./pages/Categories"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 rounded-full border-emerald-500/30 border-t-emerald-500 animate-spin" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

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

function PinRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <PinScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* ProfileProvider bên trong AuthProvider để useAuth() hoạt động */}
        <ProfileProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/pin" element={<PinRoute />} />
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
