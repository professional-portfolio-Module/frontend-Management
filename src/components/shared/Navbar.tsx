import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiBell, 
  FiMessageSquare, 
  FiLogOut, 
  FiUser, 
  FiChevronDown, 
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiUserPlus
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { notificationService, AppNotification } from "../../services/notificationService";

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
  messageCount = 0,
  onProfileClick,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (user?.id) {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      const success = await notificationService.markAllAsRead(user.id);
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "bg-blue-50 text-blue-600";
      case "task_completed":
        return "bg-green-50 text-green-600";
      case "task_expired":
        return "bg-red-50 text-red-600";
      case "maintenance_due":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return <FiUserPlus size={15} />;
      case "task_completed":
        return <FiCheckCircle size={15} />;
      case "task_expired":
        return <FiAlertTriangle size={15} />;
      case "maintenance_due":
        return <FiCalendar size={15} />;
      default:
        return <FiInfo size={15} />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  };

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
            <FiCalendar size={18} />
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
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMenu(false);
              }}
              className={`relative p-2 rounded-md transition-all duration-150 ${
                showNotifications 
                  ? "text-primary-600 bg-primary-50/50" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
              title="Notifications"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/85 z-50 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-150 flex items-center gap-1"
                      >
                        <FiCheck className="stroke-[3px]" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                          <FiBell size={18} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 flex gap-3 hover:bg-slate-50/80 cursor-pointer transition-all duration-150 relative ${
                            !notif.read ? "bg-primary-50/20" : ""
                          }`}
                        >
                          {!notif.read && (
                            <span className="absolute top-4 left-3 w-1.5 h-1.5 bg-primary-600 rounded-full" />
                          )}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBg(notif.notificationType)}`}>
                            {getIcon(notif.notificationType)}
                          </div>
                          <div className="flex-1 min-w-0 pl-1">
                            <p className={`text-xs text-slate-900 leading-tight ${!notif.read ? 'font-semibold' : 'font-medium'}`}>{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal break-words">{notif.content}</p>
                            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">{formatDate(notif.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

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
