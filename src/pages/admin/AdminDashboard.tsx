import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiServer, FiActivity, FiSettings, FiDatabase, FiShield, FiAlertTriangle } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { CreateAccountModal } from "../../components/common/CreateAccountModal";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "settings">("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileMode, setProfileMode] = useState<"view" | "edit">("view");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  const [adminHotel, setAdminHotel] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/Main/router-backend/api/users/${user.id}`)
        .then((res) => {
          if (res.data && res.data.success) {
            const hotelsList = res.data.data.hotels || [];
            if (hotelsList.length > 0) {
              setAdminHotel(hotelsList[0]);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch admin's hotel:", err);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === "admin") {
      setActiveTab("users");
    }
  }, [user?.role]);

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) {
      alert("Name is required");
      return;
    }
    try {
      await userService.updateProfile(user!.id, profileName, profilePhone);
      updateProfile(profileName, profilePhone);
      alert("Profile updated successfully!");
      setProfileMode("view");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      try {
        await userService.deleteUser(user!.id);
        alert("Account deactivated successfully.");
        setShowProfileModal(false);
        await logout();
        navigate("/login");
      } catch (err: any) {
        alert(err.message || "Failed to deactivate account");
      }
    }
  };

  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchUsers = async () => {
    if (!user) return;
    setUsersLoading(true);
    try {
      // Standard admin is scoped to their hotelId; super_admin gets all hotels
      const params = user.role === "admin" ? { hotel_id: user.hotelId } : {};
      const data = await userService.getUsers(params);
      // Filter out super_admin users for standard admins
      const filtered = user.role === "admin"
        ? data.filter((u) => u.role !== "super_admin")
        : data;
      setUsersList(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // Calculate stats from loaded users list
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.status === "active").length;
  const pendingUsers = usersList.filter(u => u.status === "pending").length;

  const systemAlerts = [
    { id: 1, type: "warning", message: "High CPU usage on Node 02", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: "info", message: "Database backup completed successfully", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, type: "error", message: "Failed login attempts detected (IP: 192.168.1.50)", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];

  const sidebarItems = [
    ...(user?.role === "super_admin"
      ? [
          {
            icon: <FiActivity size={20} />,
            label: "System Overview",
            active: activeTab === "overview",
            onClick: () => setActiveTab("overview"),
          },
        ]
      : []),
    {
      icon: <FiUsers size={20} />,
      label: "User Management",
      active: activeTab === "users",
      onClick: () => setActiveTab("users"),
      badge: pendingUsers > 0 ? pendingUsers : undefined,
    },
    ...(user?.role === "super_admin"
      ? [
          {
            icon: <FiSettings size={20} />,
            label: "System Settings",
            active: activeTab === "settings",
            onClick: () => setActiveTab("settings"),
          },
        ]
      : []),
  ];

  const userColumns = [
    {
      key: "name",
      label: "User",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value: string) => (
        <span className="capitalize text-sm text-slate-700 font-medium">{value}</span>
      ),
    },
    {
      key: "hotelName",
      label: "Hotel",
      render: (value: string) => (
        <span className="text-sm text-slate-700 font-medium">{value || "Global"}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${
              value === "active"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                : value === "inactive"
                ? "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10"
                : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
            }
          `}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      onProfileClick={() => setShowProfileModal(true)}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Administration</h1>
        <p className="text-sm text-slate-500">
          {user?.role === "admin" && adminHotel 
            ? `Scoped to ${adminHotel.name} (${adminHotel.city})` 
            : "System health and global configuration"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        {(["overview", "users", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 capitalize
              ${
                activeTab === tab
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FiUsers size={18} />} label="Total Users" value={totalUsers} color="blue" />
            <StatCard icon={<FiActivity size={18} />} label="Active Sessions" value={activeUsers} color="green" />
            <StatCard icon={<FiServer size={18} />} label="Server Uptime" value="99.9%" color="yellow" />
            <StatCard icon={<FiAlertTriangle size={18} />} label="System Alerts" value={systemAlerts.length} color="red" trend="down" trendValue="1 since yesterday" />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* System Health */}
            <Card className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <FiDatabase className="text-primary-500" size={16} />
                System Health metrics
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Database Storage</span>
                    <span className="text-xs font-medium text-slate-900">45% used</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Server CPU</span>
                    <span className="text-xs font-medium text-slate-900">28% load</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Memory Usage</span>
                    <span className="text-xs font-medium text-slate-900">62% used</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "62%" }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Alerts */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FiShield className="text-primary-500" size={16} />
                Security & Alerts
              </h2>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-md bg-primary-50/50 border border-primary-100">
                    <div className="flex gap-2">
                      <FiAlertTriangle className={`flex-shrink-0 mt-0.5 ${
                        alert.type === 'error' ? 'text-red-500' :
                        alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`} size={14} />
                      <div>
                        <p className="text-sm font-medium text-slate-900 leading-tight">{alert.message}</p>
                        <p className="text-[11px] text-slate-500 mt-1.5">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900">
              {user?.role === "admin" ? "Hotel User Directory" : "Global User Directory"}
            </h2>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add User
            </button>
          </div>
          <Table columns={userColumns} data={usersList} loading={usersLoading} />
        </Card>
      )}

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        allowedRoles={
          user?.role === "super_admin"
            ? [{ value: "ADMIN", label: "Admin" }]
            : [
                { value: "ADMIN", label: "Admin" },
                { value: "MANAGER", label: "Manager" }
              ]
        }
        defaultHotelId={user?.role === "admin" ? user.hotelId : undefined}
        onSubmit={async (data) => {
          const { name, email, mobileNumber, role, hotelId } = data;
          await userService.createInternalUser({
            name,
            email,
            mobileNumber,
            role,
            hotelId: user?.role === "admin" ? user.hotelId : hotelId
          });
          fetchUsers();
        }}
      />

      {/* Profile Modal */}
      <Modal 
        isOpen={showProfileModal} 
        title={profileMode === "view" ? "My Profile" : "Edit Profile"} 
        onClose={() => {
          setShowProfileModal(false);
          setProfileMode("view");
        }}
      >
        {profileMode === "view" ? (
          <div className="space-y-6">
            {/* Avatar & Header */}
            <div className="flex flex-col items-center pb-4 border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-3xl shadow-md border-2 border-white ring-4 ring-primary-50">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{user?.name}</h3>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-700/20">
                {user?.role}
              </span>
            </div>

            {/* Profile Fields List */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Email Address</span>
                <span className="text-slate-900 font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Phone Number</span>
                <span className="text-slate-900 font-medium">{user?.phone || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Department</span>
                <span className="text-slate-900 font-medium">{user?.department || "Administration"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Account Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-500">Created At</span>
                <span className="text-slate-900 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : "N/A"}
                </span>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <Button fullWidth onClick={() => setProfileMode("edit")}>
                Edit Profile
              </Button>
              <Button fullWidth variant="danger" onClick={handleDeactivateAccount}>
                Deactivate Account
              </Button>
              <Button fullWidth variant="secondary" onClick={() => {
                setShowProfileModal(false);
                setProfileMode("view");
              }}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button fullWidth onClick={handleUpdateProfile}>
                Save Changes
              </Button>
              <Button fullWidth variant="secondary" onClick={() => setProfileMode("view")}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {activeTab === "settings" && (
        <Card>
          <div className="max-w-2xl space-y-8">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Maintenance Mode</p>
                    <p className="text-xs text-slate-500 mt-0.5">Suspend all non-admin access to the system</p>
                  </div>
                  <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Require 2FA</p>
                    <p className="text-xs text-slate-500 mt-0.5">Enforce two-factor authentication globally</p>
                  </div>
                  <div className="w-11 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
};
