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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      >
        <SidebarNav items={sidebarItems} />
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Navbar */}
        <Navbar
          userName={user?.name}
          userRole={user?.role}
          onLogout={handleLogout}
          onProfileClick={onProfileClick}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="container-custom py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
