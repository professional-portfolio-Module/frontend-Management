import React, { useState, useEffect } from "react";
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheckCircle, 
  FiActivity, 
  FiFolder, 
  FiHardDrive, 
  FiFileText, 
  FiMessageSquare, 
  FiBell, 
  FiClipboard, 
  FiTrendingUp,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { scheduledTaskService, ScheduledTask } from "../../services/scheduledTaskService";
import { manualTaskService, ManualTask } from "../../services/manualTaskService";
import { maintenanceScheduleService, MaintenanceSchedule } from "../../services/maintenanceScheduleService";
import { assetService, Asset } from "../../services/assetService";
import { userService } from "../../services/userService";
import apiClient from "../../services/api";

import { Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input, Select, TextArea } from "../../components/common/Form";

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

const SearchableAssetDropdown: React.FC<{
  label: string;
  required?: boolean;
  value: string;
  onChange: (card_no: string) => void;
  assets: Asset[];
}> = ({ label, required, value, onChange, assets }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAsset = assets.find(a => a.card_no === value);
  const displayedLabel = selectedAsset 
    ? `${selectedAsset.card_no} - ${selectedAsset.description}` 
    : "Search and select asset...";

  const filteredAssets = assets
    .filter(a => 
      a.card_no.toLowerCase().includes(search.toLowerCase()) || 
      (a.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 50);

  return (
    <div className="flex flex-col gap-2.5 relative">
      <label className="text-sm font-semibold text-slate-700 tracking-tight">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex justify-between items-center cursor-pointer bg-white text-sm min-h-[38px] border border-slate-300 rounded-md px-3 py-2"
      >
        <span className={selectedAsset ? "text-slate-900" : "text-slate-400"}>
          {displayedLabel}
        </span>
        <span className="text-slate-400 text-xs">▼</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[75px] left-0 w-full bg-white border border-slate-200 rounded-md shadow-lg z-50 p-2 flex flex-col gap-2 max-h-[300px]">
            <input
              type="text"
              placeholder="Type code or description to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-xs bg-slate-50 w-full"
              autoFocus
            />
            <div className="overflow-y-auto flex-1 flex flex-col gap-0.5 max-h-[200px]">
              {filteredAssets.length === 0 ? (
                <div className="p-2 text-xs text-slate-500 text-center">No matching assets found</div>
              ) : (
                filteredAssets.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onChange(a.card_no);
                      setSearch("");
                      setIsOpen(false);
                    }}
                    className={`p-2 text-xs rounded hover:bg-primary-50 hover:text-primary-700 cursor-pointer transition-colors ${value === a.card_no ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700"}`}
                  >
                    <span className="font-semibold">{a.card_no}</span> - {a.description}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const SchedulesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab control state
  const [activeTab, setActiveTab] = useState<"calendar" | "yearly">("calendar");

  // Filter & Navigation states for task calendar
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [pendingCount, setPendingCount] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-hotel states
  const [userHotels, setUserHotels] = useState<any[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  // Yearly Maintenance Schedules state
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleTotalPages, setScheduleTotalPages] = useState(1);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleMonthFilter, setScheduleMonthFilter] = useState("");
  const [scheduleWeekFilter, setScheduleWeekFilter] = useState("");
  const [scheduleAssetFilter, setScheduleAssetFilter] = useState("");
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [allAssetsForDropdown, setAllAssetsForDropdown] = useState<Asset[]>([]);

  // Modal / Form states for create/edit
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);

  const [schedTitle, setSchedTitle] = useState("");
  const [schedCardNo, setSchedCardNo] = useState("");
  const [schedMonth, setSchedMonth] = useState("JAN");
  const [schedWeekNo, setSchedWeekNo] = useState(1);
  const [schedStartDate, setSchedStartDate] = useState("");
  const [schedEndDate, setSchedEndDate] = useState("");
  const [schedDescription, setSchedDescription] = useState("");
  const [schedIsActive, setSchedIsActive] = useState(true);
  const [schedAssignedTechs, setSchedAssignedTechs] = useState<string[]>([]);

  const canEdit = user?.role === "manager" || user?.role === "staff";

  // Fetch pending count for manager verification badge
  useEffect(() => {
    if (user?.role === "manager") {
      import("../../services/userService").then(({ userService }) => {
        userService.getPendingUsers().then((users) => setPendingCount(users.length)).catch(() => {});
      });
    }
  }, [user]);

  // Load user's hotel mappings
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

  // Fetch calendar tasks
  const fetchSchedules = async () => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (!hotelId) return;
    setLoading(true);
    try {
      const isEngineer = user?.role === "engineer";
      const [scheduledRes, manualRes] = await Promise.all([
        scheduledTaskService.getScheduledTasks(hotelId, undefined, isEngineer ? "emergency" : undefined),
        manualTaskService.getManualTasks({ hotel_id: hotelId, priority: isEngineer ? "emergency" : undefined })
      ]);
      
      const mappedSchedules = scheduledRes.map(mapScheduledTask);
      const mappedManual = manualRes.map(mapManualTask);
      setEvents([...mappedSchedules, ...mappedManual]);
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedHotelId, user?.hotelId, user?.role]);

  // Fetch yearly maintenance schedules list
  const fetchMaintenanceSchedules = async () => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (!hotelId) return;
    setSchedulesLoading(true);
    try {
      const result = await maintenanceScheduleService.getMaintenanceSchedules({
        hotel_id: hotelId,
        page: schedulePage,
        limit: 50,
        month: scheduleMonthFilter || undefined,
        card_no: scheduleAssetFilter || undefined,
        week_no: scheduleWeekFilter ? Number(scheduleWeekFilter) : undefined,
        search: scheduleSearch.trim() || undefined,
      });
      setMaintenanceSchedules(result.items);
      setScheduleTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch maintenance schedules:", err);
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Fetch technicians list for assignment
  const fetchTechnicians = async () => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (!hotelId) return;
    try {
      const data = await userService.getUsers({
        hotel_id: hotelId,
      });
      setTechnicians(data.filter((u: any) => u.role === "technician"));
    } catch (err: any) {
      console.error("Failed to fetch technicians:", err);
    }
  };

  // Fetch all assets for code dropdown
  const fetchAllAssetsForDropdown = async () => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (!hotelId) return;
    try {
      const response = await assetService.getAssets({
        limit: 2000,
        hotel_id: hotelId,
      });
      setAllAssetsForDropdown(response.items);
    } catch (err: any) {
      console.error("Failed to fetch all assets for dropdown:", err);
    }
  };

  useEffect(() => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (hotelId) {
      fetchTechnicians();
      fetchAllAssetsForDropdown();
    }
  }, [selectedHotelId, user?.hotelId]);

  useEffect(() => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (hotelId) {
      fetchMaintenanceSchedules();
    }
  }, [selectedHotelId, user?.hotelId, schedulePage, scheduleSearch, scheduleMonthFilter, scheduleWeekFilter, scheduleAssetFilter]);

  const handleCreateSchedule = async () => {
    const hotelId = selectedHotelId || user?.hotelId;
    if (!hotelId) return;
    if (!schedTitle.trim() || !schedCardNo || !schedMonth || !schedStartDate || !schedEndDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await maintenanceScheduleService.createMaintenanceSchedule({
        hotel_id: hotelId,
        card_no: schedCardNo,
        month: schedMonth,
        week_no: Number(schedWeekNo),
        start_date: schedStartDate,
        end_date: schedEndDate,
        title: schedTitle.trim(),
        default_description_manager: schedDescription.trim() || undefined,
        assigned_technicians: schedAssignedTechs,
        assigned_by: user!.id,
      });
      alert("Maintenance schedule created successfully!");
      setShowCreateModal(false);
      resetScheduleForm();
      fetchMaintenanceSchedules();
      fetchSchedules(); // sync calendar events
    } catch (err: any) {
      alert(err.message || "Failed to create maintenance schedule");
    }
  };

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return;
    if (!schedTitle.trim() || !schedCardNo || !schedMonth || !schedStartDate || !schedEndDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await maintenanceScheduleService.updateMaintenanceSchedule(selectedSchedule.schedule_id, {
        card_no: schedCardNo,
        month: schedMonth,
        week_no: Number(schedWeekNo),
        start_date: schedStartDate,
        end_date: schedEndDate,
        title: schedTitle.trim(),
        default_description_manager: schedDescription.trim() || null,
        is_active: schedIsActive,
        assigned_technicians: schedAssignedTechs,
        assigned_by: user!.id,
      });
      alert("Maintenance schedule updated successfully!");
      setShowEditModal(false);
      setSelectedSchedule(null);
      resetScheduleForm();
      fetchMaintenanceSchedules();
      fetchSchedules(); // sync calendar events
    } catch (err: any) {
      alert(err.message || "Failed to update maintenance schedule");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("Are you sure you want to deactivate this maintenance schedule?")) {
      try {
        await maintenanceScheduleService.deleteMaintenanceSchedule(id);
        alert("Maintenance schedule deactivated successfully.");
        fetchMaintenanceSchedules();
        fetchSchedules(); // sync calendar events
      } catch (err: any) {
        alert(err.message || "Failed to deactivate maintenance schedule");
      }
    }
  };

  const openEditModal = (schedule: MaintenanceSchedule) => {
    setSelectedSchedule(schedule);
    setSchedTitle(schedule.title);
    setSchedCardNo(schedule.card_no);
    setSchedMonth(schedule.month);
    setSchedWeekNo(schedule.week_no);
    setSchedStartDate(formatDateForInput(schedule.start_date));
    setSchedEndDate(formatDateForInput(schedule.end_date));
    setSchedDescription(schedule.default_description_manager || "");
    setSchedIsActive(schedule.is_active);
    setSchedAssignedTechs(schedule.assignments.map(a => a.user_id));
    setShowEditModal(true);
  };

  const resetScheduleForm = () => {
    setSchedTitle("");
    setSchedCardNo("");
    setSchedMonth("JAN");
    setSchedWeekNo(1);
    setSchedStartDate("");
    setSchedEndDate("");
    setSchedDescription("");
    setSchedIsActive(true);
    setSchedAssignedTechs([]);
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

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

  // Get schedules for the selected type (Task Calendar filters)
  const filteredSchedules =
    filterRole === "all"
      ? events
      : events.filter((s) => s.type === filterRole);

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getSchedulesForDate = (date: Date) => {
    return filteredSchedules.filter((s) => s.date === date.toISOString().split("T")[0]);
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const monthDays: (Date | null)[] = [];
  const firstDayOfWeek = monthStart.getDay();

  // Align starting weekday
  const adjustedOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = 0; i < adjustedOffset; i++) {
    monthDays.push(null);
  }

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

  // Build columns list for Maintenance schedules table
  const yearlyTableColumns = [
    { key: "title", label: "Title" },
    { key: "card_no", label: "Asset Code" },
    { key: "month", label: "Month" },
    { key: "week_no", label: "Week" },
    {
      key: "dates",
      label: "Date Range",
      render: (_: any, row: any) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatDateForInput(row.start_date)} to {formatDateForInput(row.end_date)}
        </span>
      )
    },
    {
      key: "assignments",
      label: "Assigned Technicians",
      render: (val: any) => (
        <div className="flex flex-wrap gap-1">
          {val && val.length > 0 ? (
            val.map((a: any) => (
              <span key={a.assignment_id} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                {a.technician_name || 'Tech'}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">None</span>
          )}
        </div>
      )
    },
    {
      key: "is_active",
      label: "Status",
      render: (val: boolean) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${val ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10'}`}>
          {val ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  if (canEdit) {
    yearlyTableColumns.push({
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(row)}>
            <FiEdit className="mr-1" /> Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDeleteSchedule(row.schedule_id)}>
            <FiTrash2 className="mr-1" /> Deactivate
          </Button>
        </div>
      )
    });
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
        {/* Header with Switcher */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Schedules</h1>
            <p className="text-sm text-slate-500">Manage and view team schedules and recurring maintenance</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Hotel Selector */}
            {userHotels.length > 1 && (
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-slate-50 cursor-pointer text-slate-700 font-medium"
              >
                {userHotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            )}

            {/* Switch Tabs */}
            <div className="flex border border-slate-200 bg-slate-100 p-1 rounded-lg w-fit shadow-sm">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  activeTab === "calendar"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Task Calendar
              </button>
              <button
                onClick={() => setActiveTab("yearly")}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  activeTab === "yearly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Yearly Schedules
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Task Calendar */}
        {activeTab === "calendar" && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
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

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading schedules...</p>
              </div>
            ) : viewMode === "week" ? (
              // Week View
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 sm:gap-4">
                {weekDays.map((day, index) => {
                  const daySchedules = getSchedulesForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border border-slate-200 overflow-hidden transition-all duration-200 ${
                        isToday
                          ? "border-2 border-primary-500 bg-primary-50"
                          : "bg-white shadow-sm"
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

                      {/* Schedules list */}
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
                                    <p className="font-semibold text-xs truncate">{schedule.assignedToName}</p>
                                    <p className="text-[10px] opacity-75 capitalize truncate">
                                      {schedule.title}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] mt-2">
                                  <FiClock size={10} />
                                  <span>
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                {schedule.location && (
                                  <div className="flex items-center gap-1 text-[10px] mt-1">
                                    <FiMapPin size={10} />
                                    <span className="truncate">{schedule.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-[10px] mt-1 opacity-75">
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
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
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
                                  className={`text-[10px] px-2 py-1 rounded border cursor-pointer hover:shadow-md transition-shadow duration-200 truncate ${getStatusColor(
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
                              <p className="text-[10px] text-slate-500 px-2">
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

            {/* Stats section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
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

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
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

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
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

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
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
          </>
        )}

        {/* Tab 2: Yearly Maintenance Schedules */}
        {activeTab === "yearly" && (
          <Card padding="none">
            <div className="p-5 border-b border-slate-200 bg-white flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-900">Yearly Maintenance Schedules</h2>
              {canEdit && (
                <Button size="sm" onClick={() => { resetScheduleForm(); setShowCreateModal(true); }}>
                  <FiPlus className="mr-1" /> Create Schedule
                </Button>
              )}
            </div>

            {/* Search & Filters Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search schedule title or description..."
                  value={scheduleSearch}
                  onChange={(e) => {
                    setScheduleSearch(e.target.value);
                    setSchedulePage(1);
                  }}
                  className="pl-9 w-full rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white"
                />
              </div>
              
              {/* Month Filter */}
              <select
                value={scheduleMonthFilter}
                onChange={(e) => {
                  setScheduleMonthFilter(e.target.value);
                  setSchedulePage(1);
                }}
                className="rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white text-slate-700 font-medium cursor-pointer"
              >
                <option value="">All Months</option>
                <option value="Jan">January</option>
                <option value="Feb">February</option>
                <option value="Mar">March</option>
                <option value="Apr">April</option>
                <option value="May">May</option>
                <option value="Jun">June</option>
                <option value="Jul">July</option>
                <option value="Aug">August</option>
                <option value="Sep">September</option>
                <option value="Oct">October</option>
                <option value="Nov">November</option>
                <option value="Dec">December</option>
              </select>

              {/* Week Filter */}
              <select
                value={scheduleWeekFilter}
                onChange={(e) => {
                  setScheduleWeekFilter(e.target.value);
                  setSchedulePage(1);
                }}
                className="rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white text-slate-700 font-medium cursor-pointer"
              >
                <option value="">All Weeks</option>
                <option value="1">Week 1</option>
                <option value="2">Week 2</option>
                <option value="3">Week 3</option>
                <option value="4">Week 4</option>
                <option value="5">Week 5</option>
              </select>

              {/* Asset Filter */}
              <select
                value={scheduleAssetFilter}
                onChange={(e) => {
                  setScheduleAssetFilter(e.target.value);
                  setSchedulePage(1);
                }}
                className="rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white text-slate-700 font-medium max-w-[200px] cursor-pointer"
              >
                <option value="">All Assets</option>
                {allAssetsForDropdown.map((asset) => (
                  <option key={asset.id} value={asset.card_no}>
                    {asset.card_no} - {asset.description}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {(scheduleSearch || scheduleMonthFilter || scheduleWeekFilter || scheduleAssetFilter) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setScheduleSearch("");
                    setScheduleMonthFilter("");
                    setScheduleWeekFilter("");
                    setScheduleAssetFilter("");
                    setSchedulePage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <Table
              loading={schedulesLoading}
              columns={yearlyTableColumns}
              data={maintenanceSchedules}
            />

            {/* Pagination */}
            {scheduleTotalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
                <p className="text-xs text-slate-500">
                  Page {schedulePage} of {scheduleTotalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={schedulePage <= 1}
                    onClick={() => setSchedulePage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={schedulePage >= scheduleTotalPages}
                    onClick={() => setSchedulePage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Create Maintenance Schedule Modal */}
        <Modal
          isOpen={showCreateModal}
          title="Create Maintenance Schedule"
          size="lg"
          onClose={() => {
            setShowCreateModal(false);
            resetScheduleForm();
          }}
        >
          <div className="space-y-4 pr-1">
            <Input
              label="Title"
              required
              value={schedTitle}
              onChange={(e) => setSchedTitle(e.target.value)}
              placeholder="e.g. Air Conditioner Monthly Servicing"
            />

            <SearchableAssetDropdown
              label="Asset Code"
              required
              value={schedCardNo}
              onChange={(card_no) => setSchedCardNo(card_no)}
              assets={allAssetsForDropdown}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month"
                required
                value={schedMonth}
                onChange={(e) => setSchedMonth(e.target.value)}
                options={[
                  { value: "JAN", label: "JAN" },
                  { value: "FEB", label: "FEB" },
                  { value: "MAR", label: "MAR" },
                  { value: "APR", label: "APR" },
                  { value: "MAY", label: "MAY" },
                  { value: "JUN", label: "JUN" },
                  { value: "JUL", label: "JUL" },
                  { value: "AUG", label: "AUG" },
                  { value: "SEP", label: "SEP" },
                  { value: "OCT", label: "OCT" },
                  { value: "NOV", label: "NOV" },
                  { value: "DEC", label: "DEC" },
                ]}
              />
              <Select
                label="Week No"
                required
                value={schedWeekNo}
                onChange={(e) => setSchedWeekNo(Number(e.target.value))}
                options={[
                  { value: 1, label: "Week 1" },
                  { value: 2, label: "Week 2" },
                  { value: 3, label: "Week 3" },
                  { value: 4, label: "Week 4" },
                  { value: 5, label: "Week 5" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                required
                value={schedStartDate}
                onChange={(e) => setSchedStartDate(e.target.value)}
              />
              <Input
                type="date"
                label="End Date"
                required
                value={schedEndDate}
                onChange={(e) => setSchedEndDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-semibold text-slate-700 tracking-tight">Assign Technicians</label>
              <div className="border border-slate-200 rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2 bg-slate-50">
                {technicians.map((tech) => (
                  <label key={tech.id} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedAssignedTechs.includes(tech.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSchedAssignedTechs([...schedAssignedTechs, tech.id]);
                        } else {
                          setSchedAssignedTechs(schedAssignedTechs.filter(id => id !== tech.id));
                        }
                      }}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{tech.name}</span>
                  </label>
                ))}
                {technicians.length === 0 && <p className="text-xs text-slate-500">No technicians found.</p>}
              </div>
            </div>

            <TextArea
              label="Default Description (for Manager)"
              value={schedDescription}
              onChange={(e) => setSchedDescription(e.target.value)}
              placeholder="Provide any description or instructions..."
            />

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button fullWidth onClick={handleCreateSchedule}>
                Create Schedule
              </Button>
              <Button fullWidth variant="secondary" onClick={() => { setShowCreateModal(false); resetScheduleForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Maintenance Schedule Modal */}
        <Modal
          isOpen={showEditModal}
          title="Edit Maintenance Schedule"
          size="lg"
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
            resetScheduleForm();
          }}
        >
          <div className="space-y-4 pr-1">
            <Input
              label="Title"
              required
              value={schedTitle}
              onChange={(e) => setSchedTitle(e.target.value)}
              placeholder="e.g. Air Conditioner Monthly Servicing"
            />

            <SearchableAssetDropdown
              label="Asset Code"
              required
              value={schedCardNo}
              onChange={(card_no) => setSchedCardNo(card_no)}
              assets={allAssetsForDropdown}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month"
                required
                value={schedMonth}
                onChange={(e) => setSchedMonth(e.target.value)}
                options={[
                  { value: "JAN", label: "JAN" },
                  { value: "FEB", label: "FEB" },
                  { value: "MAR", label: "MAR" },
                  { value: "APR", label: "APR" },
                  { value: "MAY", label: "MAY" },
                  { value: "JUN", label: "JUN" },
                  { value: "JUL", label: "JUL" },
                  { value: "AUG", label: "AUG" },
                  { value: "SEP", label: "SEP" },
                  { value: "OCT", label: "OCT" },
                  { value: "NOV", label: "NOV" },
                  { value: "DEC", label: "DEC" },
                ]}
              />
              <Select
                label="Week No"
                required
                value={schedWeekNo}
                onChange={(e) => setSchedWeekNo(Number(e.target.value))}
                options={[
                  { value: 1, label: "Week 1" },
                  { value: 2, label: "Week 2" },
                  { value: 3, label: "Week 3" },
                  { value: 4, label: "Week 4" },
                  { value: 5, label: "Week 5" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                required
                value={schedStartDate}
                onChange={(e) => setSchedStartDate(e.target.value)}
              />
              <Input
                type="date"
                label="End Date"
                required
                value={schedEndDate}
                onChange={(e) => setSchedEndDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-semibold text-slate-700 tracking-tight">Assign Technicians</label>
              <div className="border border-slate-200 rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2 bg-slate-50">
                {technicians.map((tech) => (
                  <label key={tech.id} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedAssignedTechs.includes(tech.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSchedAssignedTechs([...schedAssignedTechs, tech.id]);
                        } else {
                          setSchedAssignedTechs(schedAssignedTechs.filter(id => id !== tech.id));
                        }
                      }}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{tech.name}</span>
                  </label>
                ))}
                {technicians.length === 0 && <p className="text-xs text-slate-500">No technicians found.</p>}
              </div>
            </div>

            <TextArea
              label="Default Description (for Manager)"
              value={schedDescription}
              onChange={(e) => setSchedDescription(e.target.value)}
              placeholder="Provide any description or instructions..."
            />

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="schedIsActive"
                checked={schedIsActive}
                onChange={(e) => setSchedIsActive(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="schedIsActive" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                Schedule Active
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button fullWidth onClick={handleUpdateSchedule}>
                Save Changes
              </Button>
              <Button fullWidth variant="secondary" onClick={() => { setShowEditModal(false); setSelectedSchedule(null); resetScheduleForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
    </DashboardLayout>
  );
};

export default SchedulesPage;
