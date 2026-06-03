import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUsers, FiServer, FiActivity, FiSettings, FiDatabase, FiShield, FiAlertTriangle, FiHome, FiMessageSquare, FiSearch } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { CreateAccountModal } from "../../components/common/CreateAccountModal";
import { CreateHotelModal } from "../../components/common/CreateHotelModal";
import { userService } from "../../services/userService";
import { hotelService, Hotel } from "../../services/hotelService";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "hotels" | "settings">("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileMode, setProfileMode] = useState<"view" | "edit">("view");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  const [adminHotel, setAdminHotel] = useState<any>(null);
  const [scannerPaused, setScannerPaused] = useState<boolean>(false);
  const [scannerLoading, setScannerLoading] = useState<boolean>(false);

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
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    } else if (user?.role === "admin") {
      setActiveTab("users");
    }
  }, [location.state, user?.role]);

  useEffect(() => {
    if (activeTab === "settings") {
      setScannerLoading(true);
      apiClient.get("/Main/router-backend/api/scheduled-tasks/scanner-status")
        .then((res) => {
          if (res.data && res.data.success) {
            setScannerPaused(res.data.data.paused);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch scanner status:", err);
        })
        .finally(() => {
          setScannerLoading(false);
        });
    }
  }, [activeTab]);

  const handleToggleScanner = async (newVal: boolean) => {
    // If the admin is trying to PAUSE (newVal is true), show a warning confirmation popup
    if (newVal === true) {
      const confirmPause = window.confirm(
        "⚠️ WARNING: Pausing automated task generation will stop the system from automatically creating recurring maintenance tasks. Technicians will not receive new assignments. Are you sure you want to proceed?"
      );
      if (!confirmPause) {
        return; // Cancel the operation
      }
    }

    setScannerLoading(true);
    try {
      const res = await apiClient.post("/Main/router-backend/api/scheduled-tasks/scanner-toggle", {
        paused: newVal
      });
      if (res.data && res.data.success) {
        setScannerPaused(newVal);
      } else {
        alert(res.data.message || "Failed to update scanner status");
      }
    } catch (err: any) {
      console.error("Failed to toggle scanner:", err);
      alert(err.response?.data?.message || "Failed to toggle scanner status");
    } finally {
      setScannerLoading(false);
    }
  };

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hotelsList, setHotelsList] = useState<Hotel[]>([]);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [hotelsLoading, setHotelsLoading] = useState(false);

  const fetchUsers = async () => {
    if (!user) return;
    setUsersLoading(true);
    try {
      // Standard admin is scoped to their hotelId; super_admin gets all hotels
      const params = user.role === "admin" ? { hotel_id: user.hotelId } : {};
      const data = await userService.getUsers(params);
      // Filter based on roles:
      // Standard admin: can see all members except super_admin
      // Super admin: can only see property-level admins (role: admin)
      const filtered = user.role === "admin"
        ? data.filter((u) => u.role !== "super_admin")
        : user.role === "super_admin"
          ? data.filter((u) => u.role === "admin")
          : data;
      setUsersList(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchHotels = async () => {
    setHotelsLoading(true);
    try {
      const data = await hotelService.getHotels();
      setHotelsList(data);
    } catch (err) {
      console.error("Failed to fetch hotels:", err);
    } finally {
      setHotelsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHotels();
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
      label: user?.role === "super_admin" ? "Admin Management" : "User Management",
      active: activeTab === "users",
      onClick: () => setActiveTab("users"),
      badge: pendingUsers > 0 ? pendingUsers : undefined,
    },
    ...(user?.role === "super_admin"
      ? [
          {
            icon: <FiHome size={20} />,
            label: "Hotel Management",
            active: activeTab === "hotels",
            onClick: () => setActiveTab("hotels"),
          },
        ]
      : []),
    {
      icon: <FiMessageSquare size={20} />,
      label: "Messages",
      active: false,
      onClick: () => navigate("/messages"),
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

  const hotelColumns = [
    {
      key: "name",
      label: "Hotel Name",
      render: (_: any, row: any) => (
        <span className="font-semibold text-slate-900">{row.name}</span>
      ),
    },
    {
      key: "city",
      label: "City",
    },
    {
      key: "country",
      label: "Country",
    },
    {
      key: "createdAt",
      label: "Registered At",
      render: (_: any, row: any) => {
        const val = row.created_at || row.createdAt;
        return val ? new Date(val).toLocaleDateString() : "N/A";
      },
    },
  ];

  const userColumns = [
    {
      key: "name",
      label: user?.role === "super_admin" ? "Admin" : "User",
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

  // Filtered users for the user/admin directory
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      !searchQuery.trim() ||
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (u.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.hotelName?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filtered hotels for the hotel directory
  const filteredHotels = hotelsList.filter((h) => {
    return (
      !hotelSearchQuery.trim() ||
      h.name?.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
      h.city?.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
      h.country?.toLowerCase().includes(hotelSearchQuery.toLowerCase())
    );
  });

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
        {(user?.role === "super_admin"
          ? (["overview", "users", "hotels", "settings"] as const)
          : (["overview", "users", "settings"] as const)
        ).map((tab) => (
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
            {tab === "users" && user?.role === "super_admin" ? "admins" : tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FiUsers size={18} />} label={user?.role === "super_admin" ? "Total Admins" : "Total Users"} value={totalUsers} color="blue" />
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
              {user?.role === "admin" 
                ? "Hotel User Directory" 
                : user?.role === "super_admin" 
                  ? "Global Admin Directory" 
                  : "Global User Directory"}
            </h2>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add {user?.role === "super_admin" ? "Admin" : "User"}
            </button>
          </div>
          {/* Search Filters Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, department or hotel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              {user?.role === "admin" && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="engineer">Engineer</option>
                  <option value="staff">Staff</option>
                  <option value="technician">Technician</option>
                </select>
              )}
            </div>
          </div>
          <Table columns={userColumns} data={filteredUsers} loading={usersLoading} />
        </Card>
      )}

      {activeTab === "hotels" && user?.role === "super_admin" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900">
              System Hotel Directory
            </h2>
            <button 
              onClick={() => setIsCreateHotelModalOpen(true)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add Hotel
            </button>
          </div>
          {/* Hotel Search Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by hotel name, city or country..."
                value={hotelSearchQuery}
                onChange={(e) => setHotelSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <Table columns={hotelColumns} data={filteredHotels} loading={hotelsLoading} />
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
        excludeHotelIds={
          user?.role === "super_admin"
            ? usersList.filter(u => u.role === "admin" && u.hotelId).map(u => u.hotelId)
            : undefined
        }
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

      <CreateHotelModal
        isOpen={isCreateHotelModalOpen}
        onClose={() => setIsCreateHotelModalOpen(false)}
        onSubmit={async (data) => {
          const { name, city, country } = data;
          await hotelService.createHotel({ name, city, country });
          fetchHotels();
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
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Automated Task Generation</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {scannerPaused 
                        ? "⏸️ Paused: Recurring tasks will not be created automatically." 
                        : "Active: Recurring maintenance tasks are automatically generated on schedule."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleScanner(!scannerPaused)}
                    disabled={scannerLoading}
                    className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none ${
                      scannerPaused ? "bg-slate-200" : "bg-emerald-500"
                    } ${scannerLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                        scannerPaused ? "left-1" : "right-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
};
