import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiClock, FiFileText, FiMessageSquare } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { mockActivities, mockNotifications } from "../../mock/data";
import { mockUsers } from "../../mock/users";

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  const pendingUsers = mockUsers.filter((u) => u.status === "pending");
  const engineers = mockUsers.filter((u) => u.role === "engineer");
  const staff = mockUsers.filter((u) => u.role === "staff");
  const unreadNotifications = mockNotifications.filter((n) => !n.read && n.userId === user?.id);

  const sidebarItems = [
    { icon: <FiCheckCircle />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiUsers />, label: "Verification", active: activeTab === "verification", onClick: () => setActiveTab("verification"), badge: pendingUsers.length },
    { icon: <FiFileText />, label: "Work Items", active: activeTab === "work-items", onClick: () => setActiveTab("work-items") },
    { icon: <FiClock />, label: "Schedules", active: activeTab === "schedules", onClick: () => navigate("/schedules") },
    { icon: <FiMessageSquare />, label: "Messages", active: activeTab === "messages", onClick: () => navigate("/messages") },
    { icon: <FiFileText />, label: "System Logs", active: activeTab === "logs", onClick: () => setActiveTab("logs") },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} onProfileClick={() => setShowProfileModal(true)}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon="👥" label="Total Engineers" value={engineers.length} color="blue" />
            <StatCard icon="👔" label="Staff Members" value={staff.length} color="green" />
            <StatCard icon="⏳" label="Pending Verification" value={pendingUsers.length} color="yellow" trend="up" trendValue="2 this week" />
            <StatCard icon="🔔" label="Notifications" value={unreadNotifications.length} color="red" />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {mockActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                      🔔
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="font-semibold text-blue-900 text-sm">{notif.title}</p>
                    <p className="text-xs text-blue-700 mt-1">{notif.message}</p>
                  </div>
                ))}
                {unreadNotifications.length === 0 && <p className="text-gray-500 text-sm">No notifications</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === "verification" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Verification</h2>
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role", render: (val) => <span className="capitalize">{val}</span> },
              {
                key: "id",
                label: "Actions",
                render: (_val) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary">Approve</Button>
                    <Button size="sm" variant="danger">Reject</Button>
                  </div>
                ),
              },
            ]}
            data={pendingUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))}
          />
        </Card>
      )}

      {/* Work Items Tab */}
      {activeTab === "work-items" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Work Items</h2>
            <Button onClick={() => navigate("/manager/create-work-item")}>+ New Work Item</Button>
          </div>
          <p className="text-gray-600">View and manage all work items assigned to your team members.</p>
        </Card>
      )}

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Schedules</h2>
            <Button onClick={() => navigate("/manager/create-schedule")}>+ New Schedule</Button>
          </div>
          <p className="text-gray-600">View and manage team schedules and assignments.</p>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
          <p className="text-gray-600">Messaging system for internal communication.</p>
        </Card>
      )}

      {/* System Logs Tab */}
      {activeTab === "logs" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Logs</h2>
          <p className="text-gray-600">View system activity and audit logs.</p>
        </Card>
      )}

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} title="Edit Profile" onClose={() => setShowProfileModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button fullWidth>Save Changes</Button>
          <Button fullWidth variant="secondary" onClick={() => setShowProfileModal(false)}>Cancel</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
