import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiMessageSquare, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";

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
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        {/* Left side - Breadcrumb area */}
        <div className="flex-1 hidden sm:block">
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight">Dashboard</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          {/* Schedules */}
          <button
            onClick={() => navigate("/schedules")}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all duration-150"
            title="View Schedules"
          >
            📅
          </button>

          {/* Messages */}
          <button
            onClick={() => navigate("/messages")}
            className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all duration-150"
            title="Messages"
          >
            <FiMessageSquare size={18} />
            {messageCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all duration-150">
            <FiBell size={18} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-2 py-1.5 text-slate-700 hover:bg-slate-50 rounded-md transition-all duration-150"
            >
              <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-none">{userName}</p>
                <p className="text-[10px] text-slate-500 capitalize mt-0.5">{userRole}</p>
              </div>
              <FiChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200/80 z-50 overflow-hidden animate-scale-in">
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors duration-150"
                  >
                    <FiUser size={16} className="text-slate-400" />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => {
                      onLogout();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors duration-150"
                  >
                    <FiLogOut size={16} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
