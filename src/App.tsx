import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleBasedRedirect } from "./routes/RoleBasedRedirect";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { EngineerDashboard } from "./pages/engineer/EngineerDashboard";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { MessagingPage } from "./pages/messaging/MessagingPage";
import { SchedulesPage } from "./pages/schedules/SchedulesPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <RoleBasedRedirect>
                <LandingPage />
              </RoleBasedRedirect>
            }
          />
          <Route path="/login" element={<LoginPage />} />

          {/* Manager Routes */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Engineer Routes */}
          <Route
            path="/engineer/*"
            element={
              <ProtectedRoute requiredRole="engineer">
                <EngineerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute requiredRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* Messaging Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />

          {/* Schedules Routes */}
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <SchedulesPage />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

