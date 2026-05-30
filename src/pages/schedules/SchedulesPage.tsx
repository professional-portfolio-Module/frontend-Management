import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiFilter, FiChevronLeft, FiChevronRight, FiCheckCircle, FiActivity, FiFolder, FiHardDrive, FiFileText, FiMessageSquare, FiBell, FiClipboard, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { scheduledTaskService, ScheduledTask } from "../../services/scheduledTaskService";
import { manualTaskService, ManualTask } from "../../services/manualTaskService";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  type: "scheduled" | "manual";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  assignedToName: string;
}

const mapScheduledTask = (task: ScheduledTask): CalendarEvent => {
  const dateStr = task.due_date ? task.due_date.split("T")[0] : new Date().toISOString().split("T")[0];
  let status: CalendarEvent["status"] = "scheduled";
  if (task.status === "in-progress") status = "in-progress";
  else if (task.status === "completed") status = "completed";
  else if (task.status === "rejected") status = "cancelled";

  return {
    id: `scheduled-${task.task_id}`,
    title: task.schedule_title || "Scheduled Maintenance",
    date: dateStr,
    startTime: "09:00",
    endTime: "12:00",
    location: task.asset_location || "Main Hotel",
    type: "scheduled",
    status,
    assignedToName: task.done_by_name || "Unassigned Technician",
  };
};

const mapManualTask = (task: ManualTask): CalendarEvent => {
  const rawDate = task.due_date || task.created_at || new Date().toISOString();
  const dateStr = rawDate.split("T")[0];
  let status: CalendarEvent["status"] = "scheduled";
  if (task.status === "in-progress") status = "in-progress";
  else if (task.status === "completed") status = "completed";
  else if (task.status === "rejected" || task.status === "expired") status = "cancelled";

  return {
    id: `manual-${task.manual_task_id}`,
    title: task.title || "Manual Task",
    date: dateStr,
    startTime: "13:00",
    endTime: "16:00",
    location: task.asset_description || "Facility Equipment",
    type: "manual",
    status,
    assignedToName: task.assigned_to_name || "Unassigned Technician",
  };
};

export const SchedulesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [pendingCount, setPendingCount] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "manager") {
      import("../../services/userService").then(({ userService }) => {
        userService.getPendingUsers().then((users) => setPendingCount(users.length)).catch(() => {});
      });
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const fetchSchedules = async () => {
      const hotelId = user?.hotelId;
      if (!hotelId) return;
      setLoading(true);
      try {
        const isEngineer = user?.role === "engineer";
        const [scheduledRes, manualRes] = await Promise.all([
          scheduledTaskService.getScheduledTasks(hotelId, undefined, isEngineer ? "emergency" : undefined),
          manualTaskService.getManualTasks({ hotel_id: hotelId, priority: isEngineer ? "emergency" : undefined })
        ]);
        
        if (active) {
          const mappedSchedules = scheduledRes.map(mapScheduledTask);
          const mappedManual = manualRes.map(mapManualTask);
          setEvents([...mappedSchedules, ...mappedManual]);
        }
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSchedules();
    return () => {
      active = false;
    };
  }, [user?.hotelId, user?.role]);

  const getSidebarItems = () => {
    const managerItems = [
      { icon: <FiActivity />, label: "Dashboard", active: false, onClick: () => navigate("/manager", { state: { activeTab: "overview" } }) },
      { icon: <FiTrendingUp />, label: "Analytics", active: false, onClick: () => navigate("/manager", { state: { activeTab: "analytics" } }) },
      { icon: <FiUsers />, label: "User Management", active: false, onClick: () => navigate("/manager", { state: { activeTab: "users" } }) },
      { icon: <FiCheckCircle />, label: "Verification", active: false, onClick: () => navigate("/manager", { state: { activeTab: "verification" } }), badge: pendingCount },
      { icon: <FiFolder />, label: "Categories", active: false, onClick: () => navigate("/manager", { state: { activeTab: "categories" } }) },
      { icon: <FiHardDrive />, label: "Assets", active: false, onClick: () => navigate("/manager", { state: { activeTab: "assets" } }) },
      { icon: <FiClipboard />, label: "Manual Tasks", active: false, onClick: () => navigate("/manager", { state: { activeTab: "manual-tasks" } }) },
      { icon: <FiFileText />, label: "Scheduled Tasks", active: false, onClick: () => navigate("/manager", { state: { activeTab: "work-items" } }) },
      { icon: <FiClock />, label: "Schedules", active: true, onClick: () => navigate("/schedules") },
      { icon: <FiMessageSquare />, label: "Messages", active: false, onClick: () => navigate("/messages") },
    ];

    const engineerItems = [
      { icon: <FiCheckCircle />, label: "Dashboard", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "overview" } }) },
      { icon: <FiFileText />, label: "Work Items", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "work-items" } }) },
      { icon: <FiClipboard />, label: "Reports", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "reports" } }) },
      { icon: <FiClock />, label: "Schedule", active: true, onClick: () => navigate("/schedules") },
      { icon: <FiCheckCircle />, label: "Notifications", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "notifications" } }) },
      { icon: <FiMessageSquare />, label: "Messages", active: false, onClick: () => navigate("/messages") },
    ];

    const staffItems = [
      { icon: <FiBell />, label: "Dashboard", active: false, onClick: () => navigate("/staff", { state: { activeTab: "overview" } }) },
      { icon: <FiTrendingUp />, label: "Analytics", active: false, onClick: () => navigate("/staff", { state: { activeTab: "analytics" } }) },
      { icon: <FiCalendar />, label: "Maintenance Schedules", active: false, onClick: () => navigate("/staff", { state: { activeTab: "maintenance-schedules" } }) },
      { icon: <FiClock />, label: "My Schedule", active: true, onClick: () => navigate("/schedules") },
      { icon: <FiFolder />, label: "Categories", active: false, onClick: () => navigate("/staff", { state: { activeTab: "categories" } }) },
      { icon: <FiHardDrive />, label: "Assets", active: false, onClick: () => navigate("/staff", { state: { activeTab: "assets" } }) },
      { icon: <FiBell />, label: "Notifications", active: false, onClick: () => navigate("/staff", { state: { activeTab: "notifications" } }) },
      { icon: <FiMessageSquare />, label: "Messages", active: false, onClick: () => navigate("/messages") },
    ];

    if (user?.role === "manager") return managerItems;
    if (user?.role === "engineer") return engineerItems;
    if (user?.role === "staff") return staffItems;
    return [];
  };

  const sidebarItems = getSidebarItems();

  // Get schedules for the selected type
  const filteredSchedules =
    filterRole === "all"
      ? events
      : events.filter((s) => s.type === filterRole);

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Get schedule for specific date
  const getSchedulesForDate = (date: Date) => {
    return filteredSchedules.filter((s) => s.date === date.toISOString().split("T")[0]);
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Month view days
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const monthDays = [];
  const firstDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    monthDays.push(null);
  }

  // Add days of month
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    monthDays.push(date);
  }

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scheduled":
        return "🔧";
      case "manual":
        return "📋";
      default:
        return "📅";
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading schedules...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Schedules</h1>
          <p className="text-sm text-slate-500">Manage and view team schedules</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Filter */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <FiFilter className="text-slate-600" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150 shadow-sm"
              >
                <option value="all">All Tasks</option>
                <option value="scheduled">Scheduled Tasks</option>
                <option value="manual">Manual Tasks</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  viewMode === "week"
                    ? "bg-primary-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  viewMode === "month"
                    ? "bg-primary-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } text-sm`}
              >
                Month
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPeriod}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <FiChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-slate-700 min-w-fit">
                {viewMode === "week"
                  ? `${weekStart.toLocaleDateString()} - ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                  : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={goToNextPeriod}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === "week" ? (
          // Week View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 sm:gap-4">
            {weekDays.map((day, index) => {
              const daySchedules = getSchedulesForDate(day);
              const isToday =
                day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`rounded-lg border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 ${
                    isToday
                      ? "border-2 border-primary-500 bg-primary-50"
                      : "bg-white"
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`p-4 ${
                      isToday
                        ? "bg-primary-500 text-white"
                        : "bg-gradient-to-r from-slate-100 to-slate-50"
                    }`}
                  >
                    <p className="font-semibold">
                      {day.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <p className={`text-2xl font-bold ${isToday ? "" : "text-slate-900"}`}>
                      {day.getDate()}
                    </p>
                  </div>

                  {/* Schedules */}
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {daySchedules.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">
                        No schedules
                      </p>
                    ) : (
                      daySchedules.map((schedule) => {
                        return (
                          <div
                            key={schedule.id}
                            className={`p-3 rounded-lg text-sm border hover:shadow-md transition-shadow duration-200 cursor-pointer ${getStatusColor(
                              schedule.status
                            )}`}
                          >
                            <div className="flex items-start gap-2 mb-1">
                              <span className="text-lg">
                                {getTypeIcon(schedule.type)}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold">{schedule.assignedToName}</p>
                                <p className="text-xs opacity-75 capitalize">
                                  {schedule.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-2">
                              <FiClock size={12} />
                              <span>
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            {schedule.location && (
                              <div className="flex items-center gap-1 text-xs mt-1">
                                <FiMapPin size={12} />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs mt-1 opacity-75">
                              <span className="capitalize">{schedule.status}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Month View
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Calendar Grid - scrollable on mobile */}
            <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-0 border-collapse min-w-[640px]">
              {/* Day Headers */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day) => (
                  <div
                    key={day}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 sm:p-4 text-center font-semibold text-xs sm:text-sm"
                  >
                    {day}
                  </div>
                )
              )}

              {/* Calendar Days */}
              {monthDays.map((day, index) => {
                if (!day)
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-slate-50 p-4 min-h-24 border border-slate-200"
                    />
                  );

                const daySchedules = getSchedulesForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-4 min-h-24 border border-slate-200 ${
                      isToday
                        ? "bg-primary-50 border-2 border-primary-500"
                        : day.getMonth() !== currentDate.getMonth()
                        ? "bg-slate-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <p
                      className={`font-semibold mb-2 ${
                        isToday
                          ? "text-primary-600"
                          : day.getMonth() !== currentDate.getMonth()
                          ? "text-slate-400"
                          : "text-slate-900"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map((schedule) => {
                        return (
                          <div
                            key={schedule.id}
                            className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-md transition-shadow duration-200 truncate ${getStatusColor(
                              schedule.status
                            )}`}
                          >
                            <span className="mr-1">
                              {getTypeIcon(schedule.type)}
                            </span>
                            {schedule.assignedToName}
                          </div>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <p className="text-xs text-slate-500 px-2">
                          +{daySchedules.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCalendar size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Schedules</p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredSchedules.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUsers size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Scheduled Today</p>
                <p className="text-2xl font-bold text-slate-900">
                  {
                    filteredSchedules.filter(
                      (s) =>
                        s.date ===
                        new Date().toISOString().split("T")[0]
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  {
                    filteredSchedules.filter((s) => s.status === "in-progress")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {
                    filteredSchedules.filter((s) => s.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default SchedulesPage;
