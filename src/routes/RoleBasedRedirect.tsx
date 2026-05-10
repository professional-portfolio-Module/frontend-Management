import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is authenticated but accessing root, redirect to their role dashboard
  if (user) {
    if (user.role === "manager") {
      return <Navigate to="/manager" />;
    } else if (user.role === "engineer") {
      return <Navigate to="/engineer" />;
    } else if (user.role === "staff") {
      return <Navigate to="/staff" />;
    }
  }

  // Otherwise render the page (landing page)
  return <>{children}</>;
};
