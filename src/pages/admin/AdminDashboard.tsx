import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiServer, FiActivity, FiSettings, FiDatabase, FiShield, FiAlertTriangle } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { mockUsers } from "../../mock/users";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "settings">("overview");

  // Mock admin data
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === "active").length;
  const pendingUsers = mockUsers.filter(u => u.status === "pending").length;

  const systemAlerts = [
    { id: 1, type: "warning", message: "High CPU usage on Node 02", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: "info", message: "Database backup completed successfully", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, type: "error", message: "Failed login attempts detected (IP: 192.168.1.50)", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];

  const sidebarItems = [
    {
      icon: <FiActivity size={20} />,
      label: "System Overview",
      active: activeTab === "overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      icon: <FiUsers size={20} />,
      label: "User Management",
      active: activeTab === "users",
      onClick: () => setActiveTab("users"),
      badge: pendingUsers > 0 ? pendingUsers : undefined,
    },
    {
      icon: <FiSettings size={20} />,
      label: "System Settings",
      active: activeTab === "settings",
      onClick: () => setActiveTab("settings"),
    },
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
      onProfileClick={() => navigate("/profile")}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Administration</h1>
        <p className="text-sm text-slate-500">System health and global configuration</p>
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
            <h2 className="text-sm font-semibold text-slate-900">Global User Directory</h2>
            <button className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors">
              + Add User
            </button>
          </div>
          <Table columns={userColumns} data={mockUsers} />
        </Card>
      )}

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
