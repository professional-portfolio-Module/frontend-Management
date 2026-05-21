import React, { useState } from "react";
import { Sidebar, SidebarNav } from "../components/shared/Sidebar";
import { Navbar } from "../components/shared/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
    badge?: number;
    active?: boolean;
  }[];
  onProfileClick?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarItems,
  onProfileClick,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      >
        <SidebarNav items={sidebarItems} />
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar */}
        <Navbar
          userName={user?.name}
          userRole={user?.role}
          onLogout={handleLogout}
          onProfileClick={onProfileClick}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
