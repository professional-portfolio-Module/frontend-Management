import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheckCircle, FiClock, FiMessageSquare, FiFileText, FiClipboard, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { ReportsPage } from "./ReportsPage";
import { userService } from "../../services/userService";
import { AnalyticsPage } from "../analytics/AnalyticsPage";
import apiClient from "../../services/api";
import { scheduledTaskService, ScheduledTask } from "../../services/scheduledTaskService";
import { manualTaskService, ManualTask } from "../../services/manualTaskService";
import { useNotifications } from "../../context/NotificationContext";

const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.includes("/api/uploads/")) {
    const filename = url.split("/api/uploads/").pop();
    const base = apiClient.defaults.baseURL || "";
    return `${base.replace(/\/$/, "")}/Main/router-backend/api/uploads/${filename}`;
  }
  return url;
};

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

  // API State
  const [userHotels, setUserHotels] = useState<any[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [manualTasks, setManualTasks] = useState<ManualTask[]>([]);
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [scheduledTasksLoading, setScheduledTasksLoading] = useState(false);
  const [manualTasksLoading, setManualTasksLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"scheduled" | "manual">("scheduled");

  // Filters
  const [scheduledStatusFilter, setScheduledStatusFilter] = useState<string>("");
  const [manualStatusFilter, setManualStatusFilter] = useState<string>("");
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);

  // Review Modal state
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<"scheduled" | "manual" | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [engineerRemarks, setEngineerRemarks] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Profile Modal State Sync
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  // Sync activeTab from location state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch engineer's hotels
  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/Main/router-backend/api/users/${user.id}`)
        .then((res) => {
          if (res.data && res.data.success) {
            const hotelsList = res.data.data.hotels || [];
            setUserHotels(hotelsList);
            if (hotelsList.length > 0) {
              setSelectedHotelId(hotelsList[0].id);
            } else if (user.hotelId) {
              setSelectedHotelId(user.hotelId);
            }
          } else if (user.hotelId) {
            setSelectedHotelId(user.hotelId);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user's hotels:", err);
          if (user.hotelId) {
            setSelectedHotelId(user.hotelId);
          }
        });
    } else if (user?.hotelId) {
      setSelectedHotelId(user.hotelId);
    }
  }, [user?.id, user?.hotelId]);

  const fetchScheduledTasks = async () => {
    if (!selectedHotelId) return;
    setScheduledTasksLoading(true);
    try {
      const data = await scheduledTaskService.getScheduledTasks(
        selectedHotelId,
        scheduledStatusFilter || undefined,
        "emergency"
      );
      setScheduledTasks(data);
    } catch (err) {
      console.error("Failed to fetch scheduled tasks:", err);
    } finally {
      setScheduledTasksLoading(false);
    }
  };

  const fetchManualTasks = async () => {
    if (!selectedHotelId) return;
    setManualTasksLoading(true);
    try {
      const data = await manualTaskService.getManualTasks({
        hotel_id: selectedHotelId,
        status: manualStatusFilter || undefined,
        priority: "emergency"
      });
      setManualTasks(data);
    } catch (err) {
      console.error("Failed to fetch manual tasks:", err);
    } finally {
      setManualTasksLoading(false);
    }
  };



  // Trigger tasks fetch when selectedHotelId, filters or notifications change
  useEffect(() => {
    if (selectedHotelId) {
      fetchScheduledTasks();
      fetchManualTasks();
    }
  }, [selectedHotelId, scheduledStatusFilter, manualStatusFilter, notifications]);



  const handleOpenReview = (task: any, type: "scheduled" | "manual") => {
    setSelectedTask(task);
    setSelectedTaskType(type);
    setEngineerRemarks(type === "scheduled" ? task.engineer_remarks || "" : task.eng_remarks || "");
    setReviewModalOpen(true);
  };

  const submitTaskReview = async (newStatus: "completed" | "rejected") => {
    if (!selectedTask || !selectedTaskType) return;
    setIsSubmittingReview(true);
    try {
      if (selectedTaskType === "scheduled") {
        await scheduledTaskService.updateScheduledTask(selectedTask.task_id, {
          status: newStatus,
          engineer_remarks: engineerRemarks,
          checked_by: user?.id
        });
        alert(`Scheduled task ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully.`);
        fetchScheduledTasks();
      } else {
        await manualTaskService.updateManualTask(selectedTask.manual_task_id, {
          status: newStatus,
          eng_remarks: engineerRemarks,
          checked_by: user?.id
        });
        alert(`Manual task ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully.`);
        fetchManualTasks();
      }
      setReviewModalOpen(false);
      setSelectedTask(null);
      setSelectedTaskType(null);
    } catch (err: any) {
      alert(err.message || "Failed to update task status.");
    } finally {
      setIsSubmittingReview(false);
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

  // Combine tasks to calculate metrics
  const combinedTasks = [
    ...scheduledTasks.map(t => ({ ...t, type: 'scheduled' as const })),
    ...manualTasks.map(t => ({ ...t, type: 'manual' as const }))
  ];

  const isTaskAssignedToMe = (task: any) => {
    if (task.type === 'scheduled') {
      const isAssignedTech = task.assigned_technicians?.some((tech: any) => tech.user_id === user?.id);
      const isDoneByMe = task.done_by === user?.id;
      const isCheckedByMe = task.checked_by === user?.id;
      return isAssignedTech || isDoneByMe || isCheckedByMe;
    } else {
      const isAssignedTech = task.assigned_to === user?.id;
      const isCheckedByMe = task.checked_by === user?.id;
      const isCreatedByMe = task.assigned_by === user?.id;
      return isAssignedTech || isCheckedByMe || isCreatedByMe;
    }
  };

  const displayedScheduledTasks = showOnlyMyTasks
    ? scheduledTasks.filter(isTaskAssignedToMe)
    : scheduledTasks;

  const displayedManualTasks = showOnlyMyTasks
    ? manualTasks.filter(isTaskAssignedToMe)
    : manualTasks;

  const displayedCombinedTasks = showOnlyMyTasks
    ? combinedTasks.filter(isTaskAssignedToMe)
    : combinedTasks;

  const stats = {
    pending: displayedCombinedTasks.filter(t => t.status === 'pending').length,
    inProgress: displayedCombinedTasks.filter(t => t.status === 'in-progress').length,
    completed: displayedCombinedTasks.filter(t => t.status === 'completed' || t.status === 'under_review').length,
    emergency: displayedCombinedTasks.filter(t => t.priority === 'emergency').length,
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  const sidebarItems = [
    { icon: <FiCheckCircle />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiTrendingUp />, label: "Analytics", active: activeTab === "analytics", onClick: () => setActiveTab("analytics") },
    { icon: <FiFileText />, label: "Work Items", active: activeTab === "work-items", onClick: () => setActiveTab("work-items"), badge: stats.pending },
    { icon: <FiClipboard />, label: "Reports", active: activeTab === "reports", onClick: () => setActiveTab("reports") },
    { icon: <FiClock />, label: "Maintainance-Schedule", active: activeTab === "schedule", onClick: () => navigate("/schedules") },
    { icon: <FiCheckCircle />, label: "Notifications", active: activeTab === "notifications", onClick: () => setActiveTab("notifications"), badge: unreadNotifications.length },
    { icon: <FiMessageSquare />, label: "Messages", active: activeTab === "messages", onClick: () => navigate("/messages") },
  ];

  // Sort tasks by created_at newest first
  const recentTasks = [...displayedCombinedTasks].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 5);

  return (
    <DashboardLayout sidebarItems={sidebarItems} onProfileClick={() => setShowProfileModal(true)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Engineer Dashboard</h1>
          <p className="text-slate-500 mt-1">Supervise and verify operational maintenance schedules and tasks.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <input 
              id="my-tasks-toggle"
              type="checkbox" 
              checked={showOnlyMyTasks} 
              onChange={(e) => setShowOnlyMyTasks(e.target.checked)} 
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
            />
            <label htmlFor="my-tasks-toggle" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
              Only my assigned/checked tasks
            </label>
          </div>

          {userHotels.length > 0 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
              Hotel: {userHotels[0].name} ({userHotels[0].city})
            </span>
          )}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FiClipboard size={18} />} label="Pending Tasks" value={stats.pending} color="blue" />
            <StatCard icon={<FiClock size={18} />} label="In Progress" value={stats.inProgress} color="yellow" />
            <StatCard icon={<FiCheckCircle size={18} />} label="Completed & Under Review" value={stats.completed} color="green" />
            <StatCard icon={<FiAlertCircle size={18} />} label="Emergency Tasks" value={stats.emergency} color="red" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Assigned Work Items</h2>
              <Table
                columns={[
                  { 
                    key: "title", 
                    label: "Title",
                    render: (_, row: any) => (
                      <div>
                        <div className="font-semibold text-slate-900">{row.title || row.schedule_title}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{row.type} Task</div>
                      </div>
                    )
                  },
                  { 
                    key: "priority", 
                    label: "Priority", 
                    render: (val) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                        {val}
                      </span>
                    )
                  },
                  { 
                    key: "status", 
                    label: "Status", 
                    render: (val) => {
                      const colors: Record<string, string> = {
                        pending: "bg-amber-100 text-amber-800",
                        "in-progress": "bg-blue-100 text-blue-800",
                        under_review: "bg-purple-100 text-purple-800",
                        completed: "bg-green-100 text-green-800",
                        rejected: "bg-red-100 text-red-800",
                        expired: "bg-slate-100 text-slate-800"
                      };
                      return (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[val] || 'bg-slate-100 text-slate-800'}`}>
                          {val}
                        </span>
                      );
                    }
                  },
                  { 
                    key: "due_date", 
                    label: "Due Date",
                    render: (val) => val ? new Date(val).toLocaleDateString() : "No due date"
                  },
                ]}
                data={recentTasks}
              />
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="p-3 rounded-md bg-primary-50/50 border border-primary-100">
                    <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.content}</p>
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
          {/* Sub-tabs header */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveSubTab("scheduled")}
                className={`pb-2 text-sm font-semibold border-b-2 transition-all ${activeSubTab === "scheduled" ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Scheduled Tasks
              </button>
              <button
                onClick={() => setActiveSubTab("manual")}
                className={`pb-2 text-sm font-semibold border-b-2 transition-all ${activeSubTab === "manual" ? "border-primary-600 text-primary-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Manual Tasks
              </button>
            </div>
          </div>

          {/* Sub-tab contents */}
          {activeSubTab === "scheduled" ? (
            <div className="space-y-6">
              {/* Scheduled Filters */}
              <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={scheduledStatusFilter}
                    onChange={(e) => setScheduledStatusFilter(e.target.value)}
                    className="input-field text-sm bg-white cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {scheduledTasksLoading ? (
                <div className="text-center py-8 text-slate-500">Loading scheduled tasks...</div>
              ) : (
                <Table
                  columns={[
                    { key: "task_id", label: "Task ID", width: "w-20", render: (val) => <span className="font-mono text-xs">{val.substring(0, 8)}</span> },
                    { key: "schedule_title", label: "Title" },
                    { key: "asset_card_no", label: "Asset Code" },
                    { 
                      key: "priority", 
                      label: "Priority", 
                      render: (val) => (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                          {val}
                        </span>
                      )
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (_, row: ScheduledTask) => {
                        const colors: Record<string, string> = {
                          pending: "bg-amber-100 text-amber-800 border-amber-200",
                          "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
                          under_review: "bg-purple-100 text-purple-800 border-purple-200",
                          completed: "bg-green-100 text-green-800 border-green-200",
                          rejected: "bg-red-100 text-red-800 border-red-200",
                          expired: "bg-slate-100 text-slate-800 border-slate-200"
                        };
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[row.status] || 'bg-slate-100 text-slate-800'}`}>
                              {row.status}
                            </span>
                            {row.done_by_name && (
                              <span className="text-[9px] text-slate-500 font-medium">Done by: {row.done_by_name}</span>
                            )}
                          </div>
                        );
                      }
                    },
                    { key: "due_date", label: "Due Date", render: (val) => val ? new Date(val).toLocaleDateString() : "N/A" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row: ScheduledTask) => (
                        <Button 
                          size="sm" 
                          variant={row.status === 'under_review' ? 'primary' : 'secondary'}
                          onClick={() => handleOpenReview(row, "scheduled")}
                        >
                          {row.status === 'under_review' ? 'Review' : 'View Details'}
                        </Button>
                      )
                    }
                  ]}
                  data={displayedScheduledTasks}
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Manual Filters */}
              <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={manualStatusFilter}
                    onChange={(e) => setManualStatusFilter(e.target.value)}
                    className="input-field text-sm bg-white cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {manualTasksLoading ? (
                <div className="text-center py-8 text-slate-500">Loading manual tasks...</div>
              ) : (
                <Table
                  columns={[
                    { key: "manual_task_id", label: "Task ID", width: "w-20", render: (val) => <span className="font-mono text-xs">{val.substring(0, 8)}</span> },
                    { key: "title", label: "Title" },
                    { key: "card_no", label: "Asset Code" },
                    { 
                      key: "priority", 
                      label: "Priority", 
                      render: (val) => (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                          {val}
                        </span>
                      )
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (_, row: ManualTask) => {
                        const colors: Record<string, string> = {
                          pending: "bg-amber-100 text-amber-800 border-amber-200",
                          "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
                          under_review: "bg-purple-100 text-purple-800 border-purple-200",
                          completed: "bg-green-100 text-green-800 border-green-200",
                          rejected: "bg-red-100 text-red-800 border-red-200",
                          expired: "bg-slate-100 text-slate-800 border-slate-200"
                        };
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[row.status] || 'bg-slate-100 text-slate-800'}`}>
                              {row.status}
                            </span>
                            {row.assigned_to_name && (
                              <span className="text-[9px] text-slate-500 font-medium">Assigned to: {row.assigned_to_name}</span>
                            )}
                          </div>
                        );
                      }
                    },
                    { key: "due_date", label: "Due Date", render: (val) => val ? new Date(val).toLocaleDateString() : "N/A" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row: ManualTask) => (
                        <Button 
                          size="sm" 
                          variant={row.status === 'under_review' ? 'primary' : 'secondary'}
                          onClick={() => handleOpenReview(row, "manual")}
                        >
                          {row.status === 'under_review' ? 'Review' : 'View Details'}
                        </Button>
                      )
                    }
                  ]}
                  data={displayedManualTasks}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && <ReportsPage />}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
            {unreadNotifications.length > 0 && (
              <Button size="sm" variant="secondary" onClick={async () => {
                await markAllAsRead();
              }}>
                Mark All as Read
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-lg border transition-all cursor-pointer ${notif.read ? "bg-slate-50 border-slate-200" : "bg-blue-50/70 border-blue-200 shadow-sm"}`}
                onClick={async () => {
                  if (!notif.read) {
                    await markAsRead(notif.id);
                  }
                }}
              >
                <p className={`font-semibold text-sm ${notif.read ? "text-slate-700" : "text-blue-900"}`}>{notif.title}</p>
                <p className={`text-xs mt-1 ${notif.read ? "text-slate-500" : "text-blue-700"}`}>{notif.content}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No notifications found
              </div>
            )}
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

      {/* Review Task Modal */}
      {selectedTask && (
        <Modal
          isOpen={reviewModalOpen}
          title={selectedTask.status === 'under_review' ? "Review Task Completion" : "Task Details"}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedTask(null);
            setSelectedTaskType(null);
          }}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedTask.title || selectedTask.schedule_title}</h3>
              <p className="text-xs text-slate-500 mt-1 capitalize font-medium">{selectedTaskType} Task • ID: {selectedTaskType === "scheduled" ? selectedTask.task_id : selectedTask.manual_task_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Priority</span>
                <span className="font-semibold text-slate-900 capitalize">{selectedTask.priority}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Status</span>
                <span className="font-semibold text-slate-900 capitalize">{selectedTask.status}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Asset Card No</span>
                <span className="font-semibold text-slate-900">{selectedTask.card_no || selectedTask.asset_card_no || "N/A"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Due Date</span>
                <span className="font-semibold text-slate-900">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
                <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200 min-h-[60px] whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Technician Remarks</p>
              <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200 min-h-[60px] whitespace-pre-wrap">
                {selectedTaskType === "scheduled" 
                  ? selectedTask.technician_remarks || "No technician remarks provided."
                  : selectedTask.tech_remarks || "No technician remarks provided."
                }
              </p>
            </div>

            {selectedTask.attachment_url && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Evidence Image</p>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-60 flex items-center justify-center">
                  <img
                    src={getImageUrl(selectedTask.attachment_url)}
                    alt="Evidence of completion"
                    className="max-h-60 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {selectedTask.status === 'under_review' ? (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Engineering Remarks</label>
                  <textarea
                    value={engineerRemarks}
                    onChange={(e) => setEngineerRemarks(e.target.value)}
                    className="input-field min-h-[80px]"
                    placeholder="Add feedback, approval notes, or reasons for rejection..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() => submitTaskReview("completed")}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Processing..." : "Approve & Complete"}
                  </Button>
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() => submitTaskReview("rejected")}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Processing..." : "Reject & Require Rework"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100">
                {(selectedTask.engineer_remarks || selectedTask.eng_remarks) && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Engineering Remarks</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 min-h-[40px] whitespace-pre-wrap">
                      {selectedTaskType === "scheduled" ? selectedTask.engineer_remarks : selectedTask.eng_remarks}
                    </p>
                  </div>
                )}
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    setReviewModalOpen(false);
                    setSelectedTask(null);
                    setSelectedTaskType(null);
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </Modal>
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
