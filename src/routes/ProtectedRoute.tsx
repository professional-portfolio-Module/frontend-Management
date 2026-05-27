import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "super_admin" | "manager" | "engineer" | "staff";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const isAllowed = user.role === requiredRole || (requiredRole === "admin" && user.role === "super_admin");
    if (!isAllowed) {
      // Redirect to the user's own dashboard instead of root to avoid loops
      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        super_admin: "/admin",
        manager: "/manager",
        engineer: "/engineer",
        staff: "/staff",
      };
      return <Navigate to={roleRoutes[user.role] || "/"} replace />;
    }
  }

  return <>{children}</>;
};
