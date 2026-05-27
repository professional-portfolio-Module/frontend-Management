import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheckCircle, FiClock, FiMessageSquare, FiFileText, FiClipboard, FiBell, FiTrendingUp } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { mockWorkItems, mockSchedules, mockNotifications } from "../../mock/data";
import { ReportsPage } from "./ReportsPage";
import { userService } from "../../services/userService";
import { AnalyticsPage } from "../analytics/AnalyticsPage";

export const EngineerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "overview";
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileMode, setProfileMode] = useState<"view" | "edit">("view");
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

  const sidebarItems = [
    { icon: <FiCheckCircle />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiTrendingUp />, label: "Analytics", active: activeTab === "analytics", onClick: () => setActiveTab("analytics") },
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
            <StatCard icon={<FiClipboard size={18} />} label="Pending Tasks" value={workItemStats.pending} color="blue" />
            <StatCard icon={<FiClock size={18} />} label="In Progress" value={workItemStats.inProgress} color="yellow" />
            <StatCard icon={<FiCheckCircle size={18} />} label="Completed" value={workItemStats.completed} color="green" />
            <StatCard icon={<FiBell size={18} />} label="On Hold" value={workItemStats.onHold} color="red" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Assigned Work Items</h2>
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
              <h2 className="text-lg font-bold text-slate-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-md bg-primary-50/50 border border-primary-100">
                    <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                  </div>
                ))}
                {unreadNotifications.length === 0 && <p className="text-slate-500 text-sm">No new notifications</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Work Items Tab */}
      {activeTab === "work-items" && (
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Work Items</h2>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Schedule</h2>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
          <div className="space-y-2">
            {mockNotifications.filter((n) => n.userId === user?.id).map((notif) => (
              <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? "bg-slate-50 border-slate-200" : "bg-blue-50 border-blue-200"}`}>
                <p className={`font-semibold ${notif.read ? "text-slate-900" : "text-blue-900"}`}>{notif.title}</p>
                <p className={`text-sm mt-1 ${notif.read ? "text-slate-600" : "text-blue-700"}`}>{notif.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Messages</h2>
          <p className="text-slate-600">Messaging system for internal communication.</p>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <AnalyticsPage role="engineer" />
      )}

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
                <span className="text-slate-900 font-medium">{user?.department || "Operations"}</span>
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
                className="input-field"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="input-field"
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
    </DashboardLayout>
  );
};
