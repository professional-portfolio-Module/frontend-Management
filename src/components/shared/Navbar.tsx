import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiMessageSquare, FiLogOut, FiUser } from "react-icons/fi";

interface NavbarProps {
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  notificationCount?: number;
  messageCount?: number;
  onProfileClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName = "User",
  userRole = "",
  onLogout,
  notificationCount = 0,
  messageCount = 0,
  onProfileClick,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo/Title */}
        <div className="flex-1 hidden sm:block">
          <h1 className="text-xl font-bold text-primary-600">Browns Maintenance</h1>
        </div>

        {/* Right side - Icons and user menu */}
        <div className="flex items-center gap-4">
          {/* Schedules */}
          <button
            onClick={() => navigate("/schedules")}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
            title="View Schedules"
          >
            📅
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition">
            <FiBell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Messages */}
          <button
            onClick={() => navigate("/messages")}
            className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
            title="Go to Messages"
          >
            <FiMessageSquare size={20} />
            {messageCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {messageCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="hidden sm:block text-right">
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                {userName.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    onProfileClick?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 text-left border-b border-gray-200"
                >
                  <FiUser size={18} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 text-left"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
