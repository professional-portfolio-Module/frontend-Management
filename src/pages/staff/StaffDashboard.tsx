import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiMessageSquare, FiBell } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { mockSchedules, mockNotifications, mockMessages } from "../../mock/data";

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  const mySchedules = mockSchedules.filter((s) => s.userId === user?.id);
  const unreadNotifications = mockNotifications.filter((n) => !n.read && n.userId === user?.id);
  const myMessages = mockMessages.filter((m) => m.receiverId === user?.id || m.senderId === user?.id);
  const unreadMessages = myMessages.filter((m) => !m.read && m.receiverId === user?.id);

  const sidebarItems = [
    { icon: <FiBell />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiClock />, label: "My Schedule", active: activeTab === "schedule", onClick: () => navigate("/schedules") },
    { icon: <FiBell />, label: "Notifications", active: activeTab === "notifications", onClick: () => setActiveTab("notifications"), badge: unreadNotifications.length },
    { icon: <FiMessageSquare />, label: "Messages", active: activeTab === "messages", onClick: () => navigate("/messages"), badge: unreadMessages.length },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} onProfileClick={() => setShowProfileModal(true)}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard icon="📅" label="Scheduled Shifts" value={mySchedules.filter((s) => s.status === "scheduled").length} color="blue" />
            <StatCard icon="🔔" label="Notifications" value={unreadNotifications.length} color="yellow" />
            <StatCard icon="💬" label="Messages" value={unreadMessages.length} color="red" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Schedule</h2>
              <Table
                columns={[
                  { key: "date", label: "Date" },
                  { key: "startTime", label: "Start" },
                  { key: "endTime", label: "End" },
                  { key: "location", label: "Location" },
                ]}
                data={mySchedules.slice(0, 5)}
              />
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.slice(0, 5).map((notif) => (
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
              { key: "status", label: "Status" },
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
          <Table
            columns={[
              { key: "subject", label: "Subject" },
              { key: "senderId", label: "From", render: (val) => `User ${val}` },
              { key: "createdAt", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
              { key: "read", label: "Status", render: (val) => <span className={val ? "text-gray-500" : "font-bold text-primary-600"}>{ val ? "Read" : "Unread"}</span> },
            ]}
            data={myMessages}
          />
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
