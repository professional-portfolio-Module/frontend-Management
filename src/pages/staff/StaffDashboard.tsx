import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiClock, FiMessageSquare, FiBell, FiCalendar, FiFolder, FiHardDrive, FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input, Select, TextArea } from "../../components/common/Form";
import { useAuth } from "../../context/AuthContext";
import { mockSchedules, mockNotifications, mockMessages } from "../../mock/data";
import { categoryService, Category } from "../../services/categoryService";
import { assetService, Asset } from "../../services/assetService";
import apiClient from "../../services/api";
import { userService } from "../../services/userService";
import { maintenanceScheduleService, MaintenanceSchedule } from "../../services/maintenanceScheduleService";


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

export const StaffDashboard: React.FC = () => {
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

  // Categories & Assets read-only state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [statuses, setStatuses] = useState<{ value: string; label: string }[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [userHotels, setUserHotels] = useState<any[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  // Filters state
  const [assetSearch, setAssetSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState("");
  const [assetStatus, setAssetStatus] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [assetTotalPages, setAssetTotalPages] = useState(1);

  // Maintenance Schedules states
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleTotalPages, setScheduleTotalPages] = useState(1);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleMonthFilter, setScheduleMonthFilter] = useState("");
  const [scheduleWeekFilter, setScheduleWeekFilter] = useState("");
  const [scheduleAssetFilter, setScheduleAssetFilter] = useState("");
  const [allAssetsForDropdown, setAllAssetsForDropdown] = useState<Asset[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  
  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);

  // Form fields
  const [schedTitle, setSchedTitle] = useState("");
  const [schedCardNo, setSchedCardNo] = useState("");
  const [schedMonth, setSchedMonth] = useState("JAN");
  const [schedWeekNo, setSchedWeekNo] = useState(1);
  const [schedStartDate, setSchedStartDate] = useState("");
  const [schedEndDate, setSchedEndDate] = useState("");
  const [schedDescription, setSchedDescription] = useState("");
  const [schedAssignedTechs, setSchedAssignedTechs] = useState<string[]>([]);
  const [schedIsActive, setSchedIsActive] = useState(true);

  const mySchedules = mockSchedules.filter((s) => s.userId === user?.id);
  const unreadNotifications = mockNotifications.filter((n) => !n.read && n.userId === user?.id);
  const myMessages = mockMessages.filter((m) => m.receiverId === user?.id || m.senderId === user?.id);
  const unreadMessages = myMessages.filter((m) => !m.read && m.receiverId === user?.id);
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

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const data = await assetService.getStatuses();
      setStatuses(data);
    } catch (err: any) {
      console.error("Failed to fetch statuses:", err);
    }
  };



  const fetchAssets = async () => {
    setAssetsLoading(true);
    try {
      const response = await assetService.getAssets({
        page: assetPage,
        limit: 10,
        search: assetSearch || undefined,
        category_id: assetCategory || undefined,
        status: assetStatus || undefined,
        hotel_id: selectedHotelId || undefined,
      });
      setAssets(response.items);
      setAssetTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setAssetsLoading(false);
    }
  };

  const fetchMaintenanceSchedules = async () => {
    if (!selectedHotelId) return;
    setSchedulesLoading(true);
    try {
      const result = await maintenanceScheduleService.getMaintenanceSchedules({
        hotel_id: selectedHotelId,
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

  const fetchTechnicians = async () => {
    try {
      const data = await userService.getUsers({
        hotel_id: selectedHotelId || undefined,
      });
      setTechnicians(data.filter((u: any) => u.role === "technician"));
    } catch (err: any) {
      console.error("Failed to fetch technicians:", err);
    }
  };

  const fetchAllAssetsForDropdown = async () => {
    try {
      const response = await assetService.getAssets({
        limit: 2000,
        hotel_id: selectedHotelId || undefined,
      });
      setAllAssetsForDropdown(response.items);
    } catch (err: any) {
      console.error("Failed to fetch all assets for dropdown:", err);
    }
  };

  const handleCreateSchedule = async () => {
    if (!schedTitle.trim() || !schedCardNo || !schedMonth || !schedStartDate || !schedEndDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await maintenanceScheduleService.createMaintenanceSchedule({
        hotel_id: selectedHotelId,
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

  useEffect(() => {
    if (activeTab === "categories" || activeTab === "assets") {
      fetchCategories();
      fetchStatuses();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "assets") {
      fetchAssets();
    }
  }, [activeTab, assetPage, assetSearch, assetCategory, assetStatus, selectedHotelId]);

  useEffect(() => {
    if (activeTab === "maintenance-schedules" && selectedHotelId) {
      fetchMaintenanceSchedules();
      fetchTechnicians();
      fetchAllAssetsForDropdown();
    }
  }, [activeTab, selectedHotelId, schedulePage, scheduleSearch, scheduleMonthFilter, scheduleWeekFilter, scheduleAssetFilter]);

  const sidebarItems = [
    { icon: <FiBell />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiCalendar />, label: "Maintenance Schedules", active: activeTab === "maintenance-schedules", onClick: () => setActiveTab("maintenance-schedules") },
    { icon: <FiClock />, label: "My Schedule", active: activeTab === "schedule", onClick: () => navigate("/schedules") },
    { icon: <FiFolder />, label: "Categories", active: activeTab === "categories", onClick: () => setActiveTab("categories") },
    { icon: <FiHardDrive />, label: "Assets", active: activeTab === "assets", onClick: () => setActiveTab("assets") },
    { icon: <FiBell />, label: "Notifications", active: activeTab === "notifications", onClick: () => setActiveTab("notifications"), badge: unreadNotifications.length },
    { icon: <FiMessageSquare />, label: "Messages", active: activeTab === "messages", onClick: () => navigate("/messages"), badge: unreadMessages.length },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} onProfileClick={() => setShowProfileModal(true)}>
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard icon={<FiCalendar size={18} />} label="Scheduled Shifts" value={mySchedules.filter((s) => s.status === "scheduled").length} color="blue" />
            <StatCard icon={<FiBell size={18} />} label="Notifications" value={unreadNotifications.length} color="yellow" />
            <StatCard icon={<FiMessageSquare size={18} />} label="Messages" value={unreadMessages.length} color="red" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Upcoming Schedule</h2>
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
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.slice(0, 5).map((notif) => (
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

      {/* Maintenance Schedules Tab */}
      {activeTab === "maintenance-schedules" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 bg-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-slate-900">Maintenance Schedules</h2>
              {userHotels.length > 0 && (
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
            </div>
            <Button size="sm" onClick={() => { resetScheduleForm(); setShowCreateModal(true); }}>
              <FiPlus className="mr-1" /> Create Schedule
            </Button>
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
            columns={[
              { key: "title", label: "Title" },
              { key: "card_no", label: "Asset Code" },
              { key: "month", label: "Month" },
              { key: "week_no", label: "Week" },
              {
                key: "dates",
                label: "Date Range",
                render: (_, row: any) => (
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
              },
              {
                key: "actions",
                label: "Actions",
                render: (_, row: any) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(row)}>
                      <FiEdit className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteSchedule(row.schedule_id)}>
                      <FiTrash2 className="mr-1" /> Deactivate
                    </Button>
                  </div>
                )
              }
            ]}
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
              { key: "status", label: "Status" },
            ]}
            data={mySchedules}
          />
        </Card>
      )}

      {/* Categories Tab (Read-Only) */}
      {activeTab === "categories" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Categories (Read-Only)</h2>
          </div>
          <Table
            loading={categoriesLoading}
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Name" },
              { key: "description", label: "Description" },
            ]}
            data={categories}
          />
        </Card>
      )}

      {/* Assets Tab (Read-Only) */}
      {activeTab === "assets" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Assets Inventory (Read-Only)</h2>
          </div>

          {/* Filters Panel */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Hotel</label>
              <select
                value={selectedHotelId}
                onChange={(e) => {
                  setSelectedHotelId(e.target.value);
                  setAssetPage(1);
                }}
                disabled={userHotels.length <= 1}
                className="input-field text-sm bg-white cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {userHotels.length === 0 ? (
                  <option value="">Loading Hotels...</option>
                ) : (
                  userHotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Search</label>
              <input
                type="text"
                placeholder="Search card no, description, location..."
                value={assetSearch}
                onChange={(e) => {
                  setAssetSearch(e.target.value);
                  setAssetPage(1);
                }}
                className="input-field text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={assetCategory}
                onChange={(e) => {
                  setAssetCategory(e.target.value);
                  setAssetPage(1);
                }}
                className="input-field text-sm bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={assetStatus}
                onChange={(e) => {
                  setAssetStatus(e.target.value);
                  setAssetPage(1);
                }}
                className="input-field text-sm bg-white cursor-pointer"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Table
            loading={assetsLoading}
            columns={[
              { key: "card_no", label: "Card No" },
              { key: "description", label: "Description" },
              { key: "category_name", label: "Category" },
              { key: "location", label: "Location" },
              {
                key: "status",
                label: "Status",
                render: (value: string) => (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${
                        value === "active"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                          : value === "retired"
                          ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                          : value === "under_maintainace"
                          ? "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20"
                          : value === "breakdown"
                          ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                          : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10"
                      }
                    `}
                  >
                    {value}
                  </span>
                ),
              },
            ]}
            data={assets}
          />

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <span className="text-sm text-slate-500 font-medium">
              Showing Page {assetTotalPages === 0 ? 0 : assetPage} of {assetTotalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={assetPage <= 1 || assetTotalPages === 0}
                onClick={() => setAssetPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={assetPage >= assetTotalPages || assetTotalPages === 0}
                onClick={() => setAssetPage((prev) => Math.min(assetTotalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
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
          <Table
            columns={[
              { key: "subject", label: "Subject" },
              { key: "senderId", label: "From", render: (val) => `User ${val}` },
              { key: "createdAt", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
              { key: "read", label: "Status", render: (val) => <span className={val ? "text-slate-500" : "font-bold text-primary-600"}>{ val ? "Read" : "Unread"}</span> },
            ]}
            data={myMessages}
          />
        </Card>
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

          <Select
            label="Status"
            required
            value={schedIsActive ? "true" : "false"}
            onChange={(e) => setSchedIsActive(e.target.value === "true")}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />

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
