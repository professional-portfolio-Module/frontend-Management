import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiClock, FiMessageSquare, FiFileText, FiClipboard } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { mockWorkItems, mockSchedules, mockNotifications } from "../../mock/data";
import { ReportsPage } from "./ReportsPage";

export const EngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  const myWorkItems = mockWorkItems.filter((w) => w.assignedTo === user?.id);
  const mySchedules = mockSchedules.filter((s) => s.userId === user?.id);
  const unreadNotifications = mockNotifications.filter((n) => !n.read && n.userId === user?.id);

  const workItemStats = {
    pending: myWorkItems.filter((w) => w.status === "pending").length,
    inProgress: myWorkItems.filter((w) => w.status === "in-progress").length,
    completed: myWorkItems.filter((w) => w.status === "completed").length,
    onHold: myWorkItems.filter((w) => w.status === "on-hold").length,
  };

  const sidebarItems = [
    { icon: <FiCheckCircle />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiFileText />, label: "Work Items", active: activeTab === "work-items", onClick: () => setActiveTab("work-items"), badge: workItemStats.pending },
    { icon: <FiClipboard />, label: "Reports", active: activeTab === "reports", onClick: () => setActiveTab("reports") },
    { icon: <FiClock />, label: "Schedule", active: activeTab === "schedule", onClick: () => navigate("/schedules") },
    { icon: <FiCheckCircle />, label: "Notifications", active: activeTab === "notifications", onClick: () => setActiveTab("notifications"), badge: unreadNotifications.length },
    { icon: <FiMessageSquare />, label: "Messages", active: activeTab === "messages", onClick: () => navigate("/messages") },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} onProfileClick={() => setShowProfileModal(true)}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon="📋" label="Pending Tasks" value={workItemStats.pending} color="blue" />
            <StatCard icon="⏳" label="In Progress" value={workItemStats.inProgress} color="yellow" />
            <StatCard icon="✅" label="Completed" value={workItemStats.completed} color="green" />
            <StatCard icon="🛑" label="On Hold" value={workItemStats.onHold} color="red" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Assigned Work Items</h2>
              <Table
                columns={[
                  { key: "title", label: "Title" },
                  { key: "status", label: "Status", render: (val) => <span className={`badge-${val === "completed" ? "success" : val === "pending" ? "info" : "warning"}`}>{val}</span> },
                  { key: "dueDate", label: "Due Date" },
                ]}
                data={myWorkItems.slice(0, 5)}
              />
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="font-semibold text-blue-900 text-sm">{notif.title}</p>
                    <p className="text-xs text-blue-700 mt-1">{notif.message}</p>
                  </div>
                ))}
                {unreadNotifications.length === 0 && <p className="text-gray-500 text-sm">No new notifications</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Work Items Tab */}
      {activeTab === "work-items" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Work Items</h2>
          <Table
            columns={[
              { key: "id", label: "ID", width: "w-20" },
              { key: "title", label: "Title" },
              { key: "priority", label: "Priority" },
              { key: "status", label: "Status" },
              { key: "dueDate", label: "Due Date" },
            ]}
            data={myWorkItems}
          />
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && <ReportsPage />}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h2>
          <Table
            columns={[
              { key: "date", label: "Date" },
              { key: "startTime", label: "Start Time" },
              { key: "endTime", label: "End Time" },
              { key: "location", label: "Location" },
              { key: "type", label: "Type" },
            ]}
            data={mySchedules}
          />
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
          <div className="space-y-2">
            {mockNotifications.filter((n) => n.userId === user?.id).map((notif) => (
              <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"}`}>
                <p className={`font-semibold ${notif.read ? "text-gray-900" : "text-blue-900"}`}>{notif.title}</p>
                <p className={`text-sm mt-1 ${notif.read ? "text-gray-600" : "text-blue-700"}`}>{notif.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
          <p className="text-gray-600">Messaging system for internal communication.</p>
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
