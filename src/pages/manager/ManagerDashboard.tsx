import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiClock, FiFileText, FiMessageSquare, FiBell, FiActivity, FiFolder, FiHardDrive, FiClipboard, FiSearch, FiTrendingUp } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input, Select, TextArea } from "../../components/common/Form";
import { useAuth } from "../../context/AuthContext";
import { mockActivities, mockNotifications } from "../../mock/data";
import { User } from "../../mock/users";
import { CreateAccountModal } from "../../components/common/CreateAccountModal";
import { userService } from "../../services/userService";
import { categoryService, Category } from "../../services/categoryService";
import { assetService, Asset } from "../../services/assetService";
import { manualTaskService, ManualTask } from "../../services/manualTaskService";
import { scheduledTaskService, ScheduledTask } from "../../services/scheduledTaskService";
import apiClient from "../../services/api";
import { AnalyticsPage } from "../analytics/AnalyticsPage";

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

export const ManagerDashboard: React.FC = () => {
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "", code: "", description: "" });
  const [categoryError, setCategoryError] = useState("");

  // Statuses state
  const [statuses, setStatuses] = useState<{ value: string; label: string }[]>([]);

  // Assets state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetFormData, setAssetFormData] = useState({
    card_no: "",
    description: "",
    location: "",
    status: "active" as Asset['status'],
    installation_date: "",
    warranty_expiery: "",
    notes: "",
    category_id: "",
    hotel_id: "",
    qr_code_url: "",
  });
  const [assetError, setAssetError] = useState("");

  // User's Associated Hotels
  const [userHotels, setUserHotels] = useState<any[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  // Assets filters and pagination state
  const [assetSearch, setAssetSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState("");
  const [assetStatus, setAssetStatus] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [assetTotalPages, setAssetTotalPages] = useState(1);

  // QR Code state
  const [selectedQrAsset, setSelectedQrAsset] = useState<Asset | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);
  const [qrRedirectUrl, setQrRedirectUrl] = useState("");
  const [qrSavingRedirect, setQrSavingRedirect] = useState(false);
  const [qrMessage, setQrMessage] = useState("");

  // Manual Tasks state
  const [manualTasks, setManualTasks] = useState<ManualTask[]>([]);
  const [manualTasksLoading, setManualTasksLoading] = useState(false);
  const [manualTaskSearch, setManualTaskSearch] = useState("");
  const [manualTaskStatus, setManualTaskStatus] = useState("");
  const [manualTaskPriority, setManualTaskPriority] = useState("");
  const [manualTaskAssignedTo, setManualTaskAssignedTo] = useState("");

  // Scheduled Tasks state
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [scheduledTasksLoading, setScheduledTasksLoading] = useState(false);
  const [scheduledTaskStatus, setScheduledTaskStatus] = useState("");
  const [scheduledTaskPriority, setScheduledTaskPriority] = useState("");

  // Modals state
  const [isManualTaskModalOpen, setIsManualTaskModalOpen] = useState(false);
  const [manualTaskForm, setManualTaskForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    card_no: "",
    priority: "normal" as 'normal' | 'emergency',
    due_date: ""
  });
  const [manualTaskError, setManualTaskError] = useState("");

  const [isEditManualTaskModalOpen, setIsEditManualTaskModalOpen] = useState(false);
  const [selectedManualTask, setSelectedManualTask] = useState<ManualTask | null>(null);
  const [editManualTaskForm, setEditManualTaskForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    card_no: "",
    status: "pending" as any,
    priority: "normal" as any,
    due_date: "",
    tech_remarks: "",
    eng_remarks: ""
  });
  const [editManualTaskError, setEditManualTaskError] = useState("");
  const [allAssetsForTask, setAllAssetsForTask] = useState<Asset[]>([]);



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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await userService.getUsers({
        hotel_id: selectedHotelId || undefined,
      });
      setUsersList(data);
    } catch (err: any) {
      console.error("Failed to fetch hotel users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchManualTasks = async () => {
    setManualTasksLoading(true);
    try {
      const data = await manualTaskService.getManualTasks({
        hotel_id: selectedHotelId || undefined,
        status: manualTaskStatus || undefined,
        priority: manualTaskPriority || undefined,
        assigned_to: manualTaskAssignedTo || undefined,
        search: manualTaskSearch || undefined,
      });
      setManualTasks(data);
    } catch (err: any) {
      console.error("Failed to fetch manual tasks:", err);
    } finally {
      setManualTasksLoading(false);
    }
  };

  const fetchScheduledTasks = async () => {
    if (!selectedHotelId) return;
    setScheduledTasksLoading(true);
    try {
      const data = await scheduledTaskService.getScheduledTasks(
        selectedHotelId,
        scheduledTaskStatus || undefined,
        scheduledTaskPriority || undefined
      );
      setScheduledTasks(data);
    } catch (err: any) {
      console.error("Failed to fetch scheduled tasks:", err);
    } finally {
      setScheduledTasksLoading(false);
    }
  };

  const fetchAllAssetsForTask = async () => {
    try {
      const response = await assetService.getAssets({
        limit: 2000,
        hotel_id: selectedHotelId || undefined,
      });
      setAllAssetsForTask(response.items);
    } catch (err: any) {
      console.error("Failed to fetch all assets for dropdown:", err);
    }
  };


  const handleShowQrCode = async (asset: Asset) => {
    setSelectedQrAsset(asset);
    setQrLoading(true);
    setQrBlobUrl(null);
    setQrRedirectUrl("");
    setQrMessage("");

    // Fetch QR Code image as a base64 Data URL (JSON response)
    try {
      const response = await apiClient.get(
        `/Main/router-backend/api/qr/generate/${encodeURIComponent(asset.card_no)}`
      );
      if (response.data && response.data.success && response.data.data.qrCode) {
        setQrBlobUrl(response.data.data.qrCode);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Failed to generate QR code", err);
      setQrMessage("Failed to generate QR code image.");
    }

    // Fetch current redirect target URL
    try {
      const redirectRes = await apiClient.get(
        `/Main/router-backend/api/qr/target/${encodeURIComponent(asset.card_no)}`
      );
      if (redirectRes.data && redirectRes.data.success && redirectRes.data.data.targetUrl) {
        setQrRedirectUrl(redirectRes.data.data.targetUrl);
      } else {
        // Pre-fill with the production Netlify URL for this specific asset
        setQrRedirectUrl(`https://browns-company.netlify.app/manager/assets?search=${encodeURIComponent(asset.card_no)}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch redirect target URL", err);
      // Fallback pre-fill on error
      setQrRedirectUrl(`https://browns-company.netlify.app/manager/assets?search=${encodeURIComponent(asset.card_no)}`);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSaveQrRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQrAsset) return;
    setQrSavingRedirect(true);
    setQrMessage("");
    try {
      const response = await apiClient.post("/Main/router-backend/api/qr/update", {
        machineId: selectedQrAsset.card_no,
        targetUrl: qrRedirectUrl,
      });
      if (response.data && response.data.success) {
        setQrMessage("Redirect URL updated successfully!");
      } else {
        setQrMessage(response.data.message || "Failed to update redirect URL.");
      }
    } catch (err: any) {
      console.error("Failed to update QR redirect", err);
      setQrMessage(err.response?.data?.message || "Failed to update redirect URL. Ensure it is a valid absolute URL.");
    } finally {
      setQrSavingRedirect(false);
    }
  };


  React.useEffect(() => {
    if (user?.id) {
      apiClient.get(`/Main/router-backend/api/users/${user.id}`)
        .then((res) => {
          if (res.data && res.data.success) {
            const hotelsList = res.data.data.hotels || [];
            setUserHotels(hotelsList);
            if (hotelsList.length > 0) {
              setSelectedHotelId(hotelsList[0].id);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch manager's hotels:", err);
        });
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (activeTab === "verification") {
      userService.getPendingUsers().then((users) => {
        setPendingUsers(users);
      });
    } else if (activeTab === "categories" || activeTab === "assets") {
      fetchCategories();
      fetchStatuses();
    }

    if (activeTab === "overview" || activeTab === "users" || activeTab === "manual-tasks") {
      fetchUsers();
    }
    if (activeTab === "manual-tasks") {
      fetchAllAssetsForTask();
      fetchManualTasks();
    }
  }, [activeTab, selectedHotelId]);

  React.useEffect(() => {
    if (activeTab === "assets") {
      fetchAssets();
    }
  }, [activeTab, assetPage, assetSearch, assetCategory, assetStatus, selectedHotelId]);

  React.useEffect(() => {
    if (activeTab === "manual-tasks") {
      fetchManualTasks();
    }
  }, [activeTab, manualTaskStatus, manualTaskPriority, manualTaskAssignedTo, manualTaskSearch, selectedHotelId]);

  React.useEffect(() => {
    if (activeTab === "work-items") {
      fetchScheduledTasks();
    }
  }, [activeTab, scheduledTaskStatus, scheduledTaskPriority, selectedHotelId]);


  const engineers = usersList.filter((u) => u.role === "engineer");
  const staff = usersList.filter((u) => u.role === "staff");
  const managers = usersList.filter((u) => u.role === "manager");
  const technicians = usersList.filter((u) => u.role === "technician");
  const filteredUsers = usersList.filter((u) => {
    if (u.role === "admin") return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (userStatusFilter && u.status !== userStatusFilter) return false;
    return true;
  });
  const unreadNotifications = mockNotifications.filter((n) => !n.read && n.userId === user?.id);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError("");
    if (!categoryFormData.name || !categoryFormData.code) {
      setCategoryError("Name and Code are required.");
      return;
    }
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: categoryFormData.name,
          description: categoryFormData.description,
        });
      } else {
        await categoryService.createCategory(categoryFormData);
      }
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: "", code: "", description: "" });
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setCategoryError(err.message || "Failed to save category.");
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      code: cat.code,
      description: cat.description || "",
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this category?")) return;
    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category.");
    }
  };

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssetError("");
    if (!assetFormData.card_no || !assetFormData.category_id || !assetFormData.description) {
      setAssetError("Card Number, Category, and Description are required.");
      return;
    }
    try {
      const payload = {
        card_no: assetFormData.card_no,
        category_id: assetFormData.category_id,
        description: assetFormData.description,
        location: assetFormData.location || null,
        status: assetFormData.status,
        installation_date: assetFormData.installation_date || null,
        warranty_expiery: assetFormData.warranty_expiery || null,
        notes: assetFormData.notes || null,
        hotel_id: assetFormData.hotel_id || null,
        qr_code_url: assetFormData.qr_code_url || null,
      };

      if (editingAsset) {
        await assetService.updateAsset(editingAsset.id, payload);
      } else {
        await assetService.createAsset(payload);
      }
      setIsAssetModalOpen(false);
      setEditingAsset(null);
      setAssetFormData({
        card_no: "",
        description: "",
        location: "",
        status: "active",
        installation_date: "",
        warranty_expiery: "",
        notes: "",
        category_id: "",
        hotel_id: "",
        qr_code_url: "",
      });
      fetchAssets();
    } catch (err: any) {
      setAssetError(err.message || "Failed to save asset.");
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetFormData({
      card_no: asset.card_no,
      description: asset.description,
      location: asset.location || "",
      status: asset.status,
      installation_date: asset.installation_date ? asset.installation_date.split("T")[0] : "",
      warranty_expiery: asset.warranty_expiery ? asset.warranty_expiery.split("T")[0] : "",
      notes: asset.notes || "",
      category_id: asset.category_id,
      hotel_id: asset.hotel_id || "",
      qr_code_url: asset.qr_code_url || "",
    });
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm("Are you sure you want to retire this asset?")) return;
    try {
      await assetService.deleteAsset(id);
      fetchAssets();
    } catch (err: any) {
      alert(err.message || "Failed to delete asset.");
    }
  };

  const handleManualTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualTaskError("");
    if (!manualTaskForm.title) {
      setManualTaskError("Title is required.");
      return;
    }
    if (!manualTaskForm.assigned_to) {
      setManualTaskError("Technician assignment is required.");
      return;
    }
    if (!manualTaskForm.card_no) {
      setManualTaskError("Asset selection is required.");
      return;
    }
    try {
      await manualTaskService.createManualTask({
        hotel_id: selectedHotelId || (userHotels[0]?.id || null),
        title: manualTaskForm.title,
        description: manualTaskForm.description || null,
        assigned_to: manualTaskForm.assigned_to,
        assigned_by: user?.id || null,
        card_no: manualTaskForm.card_no,
        priority: manualTaskForm.priority,
        status: 'pending',
        due_date: manualTaskForm.due_date || null,
      });
      setIsManualTaskModalOpen(false);
      setManualTaskForm({ title: "", description: "", assigned_to: "", card_no: "", priority: "normal", due_date: "" });
      fetchManualTasks();
    } catch (err: any) {
      setManualTaskError(err.message || "Failed to create manual task.");
    }
  };

  const handleEditManualTask = (task: ManualTask) => {
    setSelectedManualTask(task);
    setEditManualTaskForm({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      card_no: task.card_no || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      tech_remarks: task.tech_remarks || "",
      eng_remarks: task.eng_remarks || "",
    });
    setIsEditManualTaskModalOpen(true);
  };

  const handleEditManualTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditManualTaskError("");
    if (!selectedManualTask) return;
    if (!editManualTaskForm.title) {
      setEditManualTaskError("Title is required.");
      return;
    }
    if (!editManualTaskForm.assigned_to) {
      setEditManualTaskError("Technician assignment is required.");
      return;
    }
    if (!editManualTaskForm.card_no) {
      setEditManualTaskError("Asset selection is required.");
      return;
    }
    try {
      await manualTaskService.updateManualTask(selectedManualTask.manual_task_id, {
        title: editManualTaskForm.title,
        description: editManualTaskForm.description || null,
        assigned_to: editManualTaskForm.assigned_to,
        card_no: editManualTaskForm.card_no,
        status: editManualTaskForm.status,
        priority: editManualTaskForm.priority,
        due_date: editManualTaskForm.due_date || null,
        eng_remarks: editManualTaskForm.eng_remarks || null,
        tech_remarks: editManualTaskForm.tech_remarks || null,
        checked_by: editManualTaskForm.status === 'completed' ? user?.id : undefined
      });
      setIsEditManualTaskModalOpen(false);
      setSelectedManualTask(null);
      fetchManualTasks();
    } catch (err: any) {
      setEditManualTaskError(err.message || "Failed to update manual task.");
    }
  };

  const handleManualTaskDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this manual task?")) return;
    try {
      await manualTaskService.deleteManualTask(id);
      fetchManualTasks();
    } catch (err: any) {
      alert(err.message || "Failed to delete manual task.");
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

  const sidebarItems = [
    { icon: <FiActivity />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiTrendingUp />, label: "Analytics", active: activeTab === "analytics", onClick: () => setActiveTab("analytics") },
    { icon: <FiUsers />, label: "User Management", active: activeTab === "users", onClick: () => setActiveTab("users") },
    { icon: <FiCheckCircle />, label: "Verification", active: activeTab === "verification", onClick: () => setActiveTab("verification"), badge: pendingUsers.length },
    { icon: <FiFolder />, label: "Categories", active: activeTab === "categories", onClick: () => setActiveTab("categories") },
    { icon: <FiHardDrive />, label: "Assets", active: activeTab === "assets", onClick: () => setActiveTab("assets") },
    { icon: <FiClipboard />, label: "Manual Tasks", active: activeTab === "manual-tasks", onClick: () => setActiveTab("manual-tasks") },
    { icon: <FiFileText />, label: "Scheduled Tasks", active: activeTab === "work-items", onClick: () => setActiveTab("work-items") },
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard icon={<FiUsers size={18} />} label="Total Engineers" value={engineers.length} color="blue" />
            <StatCard icon={<FiCheckCircle size={18} />} label="Staff Members" value={staff.length} color="green" />
            <StatCard icon={<FiUsers size={18} />} label="Technicians" value={technicians.length} color="teal" />
            <StatCard icon={<FiUsers size={18} />} label="Managers" value={managers.length} color="purple" />
            <StatCard icon={<FiClock size={18} />} label="Pending Verification" value={pendingUsers.length} color="yellow" trend="up" trendValue="2 this week" />
            <StatCard icon={<FiBell size={18} />} label="Notifications" value={unreadNotifications.length} color="red" />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Recent Activities</h2>
              <div className="space-y-4">
                {mockActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                      <FiActivity size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications */}
            <Card>
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {unreadNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-md bg-primary-50/50 border border-primary-100">
                    <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                  </div>
                ))}
                {unreadNotifications.length === 0 && <p className="text-slate-500 text-sm">No notifications</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === "verification" && (
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Employee Verification</h2>
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role", render: (val) => <span className="capitalize">{val}</span> },
              {
                key: "id",
                label: "Actions",
                render: (val) => (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={async () => {
                        try {
                          await userService.verifyUser(val as string);
                          setPendingUsers(prev => prev.filter(u => u.id !== val));
                          alert("User approved successfully!");
                        } catch (e: any) {
                          alert(e.message || "Failed to approve user");
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="danger">Reject</Button>
                  </div>
                ),
              },
            ]}
            data={pendingUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))}
          />
        </Card>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900">Team Directory</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add User
            </button>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 w-full rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white"
              />
            </div>
            
            {/* Role Filter */}
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="engineer">Engineer</option>
              <option value="staff">Staff</option>
              <option value="technician">Technician</option>
            </select>

            {/* Status Filter */}
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="rounded-md border-slate-300 text-xs shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-3 bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Clear Filters Button */}
            {(userSearch || userRoleFilter || userStatusFilter) && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setUserSearch("");
                  setUserRoleFilter("");
                  setUserStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role", render: (val) => <span className="capitalize">{val}</span> },
              { key: "department", label: "Department" },
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
            ]}
            loading={usersLoading}
            data={filteredUsers}
          />
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900">Categories Management</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryFormData({ name: "", code: "", description: "" });
                setIsCategoryModalOpen(true);
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add Category
            </button>
          </div>
          <Table
            loading={categoriesLoading}
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Name" },
              { key: "description", label: "Description" },
              {
                key: "id",
                label: "Actions",
                render: (val, row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEditCategory(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteCategory(val)}>
                      Deactivate
                    </Button>
                  </div>
                )
              }
            ]}
            data={categories}
          />
        </Card>
      )}

      {/* Assets Tab */}
      {activeTab === "assets" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Assets Inventory</h2>
            <button
              onClick={() => {
                setEditingAsset(null);
                setAssetFormData({
                  card_no: "",
                  description: "",
                  location: "",
                  status: "active",
                  installation_date: "",
                  warranty_expiery: "",
                  notes: "",
                  category_id: "",
                  hotel_id: selectedHotelId || (userHotels[0]?.id || ""),
                  qr_code_url: "",
                });
                setIsAssetModalOpen(true);
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add Asset
            </button>
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
              {
                key: "id",
                label: "Actions",
                render: (val, row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEditAsset(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleShowQrCode(row)}>
                      QR Code
                    </Button>
                    {row.status !== "retired" && (
                      <Button size="sm" variant="danger" onClick={() => handleDeleteAsset(val)}>
                        Retire
                      </Button>
                    )}
                  </div>
                )
              }
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

      {/* Manual Tasks Tab */}
      {activeTab === "manual-tasks" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Manual Tasks</h2>
              <p className="text-xs text-slate-500 mt-1">Assign and manage manual tasks for technicians</p>
            </div>
            <button
              onClick={() => {
                setManualTaskForm({
                  title: "",
                  description: "",
                  assigned_to: "",
                  card_no: "",
                  priority: "normal",
                  due_date: ""
                });
                setManualTaskError("");
                setIsManualTaskModalOpen(true);
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
            >
              + Add Manual Task
            </button>
          </div>

          {/* Filters Panel */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Search</label>
              <input
                type="text"
                placeholder="Search title, description..."
                value={manualTaskSearch}
                onChange={(e) => setManualTaskSearch(e.target.value)}
                className="input-field text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Technician</label>
              <select
                value={manualTaskAssignedTo}
                onChange={(e) => setManualTaskAssignedTo(e.target.value)}
                className="input-field text-sm bg-white cursor-pointer"
              >
                <option value="">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Priority</label>
              <select
                value={manualTaskPriority}
                onChange={(e) => setManualTaskPriority(e.target.value)}
                className="input-field text-sm bg-white cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="normal">Normal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={manualTaskStatus}
                onChange={(e) => setManualTaskStatus(e.target.value)}
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

          <Table
            loading={manualTasksLoading}
            columns={[
              {
                key: "title",
                label: "Task Details",
                render: (_val, row: ManualTask) => (
                  <div>
                    <div className="font-semibold text-slate-900">{row.title}</div>
                    {row.description && (
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{row.description}</div>
                    )}
                  </div>
                )
              },
              {
                key: "assigned_to_name",
                label: "Assigned To",
                render: (_val, row: ManualTask) => (
                  <span className="text-sm text-slate-700">{row.assigned_to_name || "Unassigned"}</span>
                )
              },
              {
                key: "card_no",
                label: "Asset",
                render: (_val, row: ManualTask) => (
                  row.card_no ? (
                    <div>
                      <div className="font-medium text-slate-800 text-xs">{row.card_no}</div>
                      {row.asset_description && (
                        <div className="text-[10px] text-slate-500">{row.asset_description}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )
                )
              },
              {
                key: "priority",
                label: "Priority",
                render: (_val, row: ManualTask) => {
                  if (row.priority === 'emergency') {
                    return (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse border border-red-200">
                        Emergency
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      Normal
                    </span>
                  );
                }
              },
              {
                key: "status",
                label: "Status",
                render: (_val, row: ManualTask) => {
                  switch (row.status) {
                    case 'pending':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
                    case 'in-progress':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>;
                    case 'under_review':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Under Review</span>;
                    case 'completed':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Completed</span>;
                    case 'rejected':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
                    case 'expired':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">Expired</span>;
                    default:
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{row.status}</span>;
                  }
                }
              },
              {
                key: "due_date",
                label: "Due Date",
                render: (_val, row: ManualTask) => (
                  <span className="text-xs text-slate-600">
                    {row.due_date ? new Date(row.due_date).toLocaleDateString() : "No due date"}
                  </span>
                )
              },
              {
                key: "manual_task_id",
                label: "Actions",
                render: (val, row: ManualTask) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEditManualTask(row)}>

                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleManualTaskDelete(val)}>
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            data={manualTasks}
          />
        </Card>
      )}

      {/* Work Items Tab (Scheduled Tasks) */}
      {activeTab === "work-items" && (
        <Card padding="none">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Scheduled Tasks</h2>
              <p className="text-xs text-slate-500 mt-1">View and monitor all auto-generated background scheduled tasks</p>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={scheduledTaskStatus}
                onChange={(e) => setScheduledTaskStatus(e.target.value)}
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
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Priority</label>
              <select
                value={scheduledTaskPriority}
                onChange={(e) => setScheduledTaskPriority(e.target.value)}
                className="input-field text-sm bg-white cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="normal">Normal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <Table
            loading={scheduledTasksLoading}
            columns={[
              {
                key: "schedule_title",
                label: "Task details",
                render: (val, row: ScheduledTask) => (
                  <div>
                    <div className="font-semibold text-slate-900">{val}</div>
                    <div className="text-xs text-slate-500 mt-1 max-w-md truncate">
                      {row.additional_details || "No details provided"}
                    </div>
                  </div>
                )
              },
              {
                key: "asset_card_no",
                label: "Asset",
                render: (val, row: ScheduledTask) => (
                  <div>
                    <div className="text-sm font-medium text-slate-700">{val}</div>
                    {row.asset_description && (
                      <div className="text-xs text-slate-400 mt-0.5">{row.asset_description}</div>
                    )}
                    {row.asset_location && (
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">{row.asset_location}</div>
                    )}
                  </div>
                )
              },
              {
                key: "assigned_technicians",
                label: "Assigned Technicians",
                render: (val: any[]) => (
                  <div className="flex flex-wrap gap-1">
                    {val && val.length > 0 ? (
                      val.map((tech) => (
                        <span
                          key={tech.user_id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {tech.technician_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </div>
                )
              },
              {
                key: "due_date",
                label: "Due Date",
                render: (val) => (
                  val ? (
                    <span className="text-sm text-slate-600 font-medium">
                      {new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )
                )
              },
              {
                key: "priority",
                label: "Priority",
                render: (_val, row: ScheduledTask) => {
                  if (row.priority === 'emergency') {
                    return (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse border border-red-200">
                        Emergency
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      Normal
                    </span>
                  );
                }
              },
              {
                key: "status",
                label: "Status",
                render: (_val, row: ScheduledTask) => {
                  switch (row.status) {
                    case 'pending':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
                    case 'in-progress':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>;
                    case 'under_review':
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 w-fit">Under Review</span>
                          {row.checked_by_name && (
                            <span className="text-[10px] text-purple-600 font-medium">By {row.checked_by_name}</span>
                          )}
                        </div>
                      );
                    case 'completed':
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 w-fit">Completed</span>
                          {row.done_by_name && (
                            <span className="text-[10px] text-slate-500">By {row.done_by_name}</span>
                          )}
                          {row.checked_by_name && (
                            <span className="text-[10px] text-indigo-500 font-medium">Verified by {row.checked_by_name}</span>
                          )}
                        </div>
                      );
                    case 'rejected':
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 w-fit">Rejected</span>
                          {row.checked_by_name && (
                            <span className="text-[10px] text-rose-500">By {row.checked_by_name}</span>
                          )}
                        </div>
                      );
                    case 'expired':
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">Expired</span>;
                    default:
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{row.status}</span>;
                  }
                }
              }
            ]}
            data={scheduledTasks}
          />
        </Card>
      )}

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Manage Schedules</h2>
            <Button onClick={() => navigate("/manager/create-schedule")}>+ New Schedule</Button>
          </div>
          <p className="text-slate-600">View and manage team schedules and assignments.</p>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Messages</h2>
          <p className="text-slate-600">Messaging system for internal communication.</p>
        </Card>
      )}

      {/* System Logs Tab */}
      {activeTab === "logs" && (
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">System Logs</h2>
          <p className="text-slate-600">View system activity and audit logs.</p>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <AnalyticsPage role="manager" />
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
                <span className="text-slate-900 font-medium">{user?.department || "Management"}</span>
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

      {/* Create Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={() => setIsCategoryModalOpen(false)}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          {categoryError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {categoryError}
            </div>
          )}
          <Input
            label="Category Code"
            value={categoryFormData.code}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value })}
            disabled={!!editingCategory}
            required
          />
          <Input
            label="Category Name"
            value={categoryFormData.name}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
            required
          />
          <TextArea
            label="Description"
            value={categoryFormData.description}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
          />
          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Asset Modal */}
      <Modal
        isOpen={isAssetModalOpen}
        title={editingAsset ? "Edit Asset" : "Add Asset"}
        onClose={() => setIsAssetModalOpen(false)}
      >
        <form onSubmit={handleAssetSubmit} className="space-y-4">
          {assetError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {assetError}
            </div>
          )}
          <Input
            label="Card Number (ID)"
            value={assetFormData.card_no}
            onChange={(e) => setAssetFormData({ ...assetFormData, card_no: e.target.value })}
            required
          />
          <Input
            label="Description (Name)"
            value={assetFormData.description}
            onChange={(e) => setAssetFormData({ ...assetFormData, description: e.target.value })}
            required
          />
          <Select
            label="Category"
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            value={assetFormData.category_id}
            onChange={(e) => setAssetFormData({ ...assetFormData, category_id: e.target.value })}
            required
          />
          <Select
            label="Hotel"
            options={userHotels.map((h) => ({ value: h.id, label: `${h.name} - ${h.city}` }))}
            value={assetFormData.hotel_id}
            onChange={(e) => setAssetFormData({ ...assetFormData, hotel_id: e.target.value })}
            required
            disabled={userHotels.length <= 1}
          />
          <Input
            label="Location"
            value={assetFormData.location}
            onChange={(e) => setAssetFormData({ ...assetFormData, location: e.target.value })}
          />
          <Select
            label="Status"
            options={statuses}
            value={assetFormData.status}
            onChange={(e) => setAssetFormData({ ...assetFormData, status: e.target.value as Asset['status'] })}
            required
          />
          <Input
            label="Installation Date"
            type="date"
            value={assetFormData.installation_date}
            onChange={(e) => setAssetFormData({ ...assetFormData, installation_date: e.target.value })}
          />
          <Input
            label="Warranty Expiry"
            type="date"
            value={assetFormData.warranty_expiery}
            onChange={(e) => setAssetFormData({ ...assetFormData, warranty_expiery: e.target.value })}
          />
          <Input
            label="QR Code URL"
            value={assetFormData.qr_code_url}
            onChange={(e) => setAssetFormData({ ...assetFormData, qr_code_url: e.target.value })}
          />
          <TextArea
            label="Notes"
            value={assetFormData.notes}
            onChange={(e) => setAssetFormData({ ...assetFormData, notes: e.target.value })}
          />
          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="secondary" onClick={() => setIsAssetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAsset ? "Save Changes" : "Create Asset"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={!!selectedQrAsset}
        title={`QR Code: ${selectedQrAsset?.card_no}`}
        onClose={() => {
          setSelectedQrAsset(null);
          if (qrBlobUrl) {
            URL.revokeObjectURL(qrBlobUrl);
            setQrBlobUrl(null);
          }
        }}
      >
        <div className="flex flex-col items-center gap-6 p-4">
          {qrLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <svg className="animate-spin h-8 w-8 text-primary-600 mb-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium text-slate-500">Generating QR Code…</p>
            </div>
          ) : (
            <>
              {qrBlobUrl ? (
                <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
                  <img src={qrBlobUrl} alt={`QR Code for ${selectedQrAsset?.card_no}`} className="w-48 h-48 object-contain" />
                  <div className="flex gap-2 w-full justify-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = qrBlobUrl;
                        link.download = `qrcode_${selectedQrAsset?.card_no}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download QR
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(`
                            <html>
                              <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
                                <h2>Asset: ${selectedQrAsset?.card_no}</h2>
                                <p>${selectedQrAsset?.description}</p>
                                <img src="${qrBlobUrl}" style="width:300px;height:300px;" />
                                <script>window.onload = function() { window.print(); window.close(); }</script>
                              </body>
                            </html>
                          `);
                          win.document.close();
                        }
                      }}
                    >
                      Print
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600">{qrMessage || "Failed to load QR code."}</p>
              )}

              {/* Dynamic Redirect URL Configuration */}
              <div className="w-full border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Dynamic QR Redirect Target</h3>
                <form onSubmit={handleSaveQrRedirect} className="space-y-3">
                  {qrMessage && !qrLoading && !qrBlobUrl && (
                    <div className="p-2.5 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                      {qrMessage}
                    </div>
                  )}
                  {qrMessage && qrBlobUrl && (
                    <div className={`p-2.5 text-xs rounded-md border ${qrMessage.includes("success") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                      {qrMessage}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Redirect Target URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://example.com/asset-status"
                      value={qrRedirectUrl}
                      onChange={(e) => setQrRedirectUrl(e.target.value)}
                      className="input-field text-sm w-full"
                      required
                    />
                  </div>
                  <Button type="submit" fullWidth disabled={qrSavingRedirect}>
                    {qrSavingRedirect ? "Saving Target URL…" : "Update Target URL"}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Create Manual Task Modal */}
      <Modal
        isOpen={isManualTaskModalOpen}
        title="Create Manual Task"
        onClose={() => setIsManualTaskModalOpen(false)}
      >
        <form onSubmit={handleManualTaskSubmit} className="space-y-4">
          {manualTaskError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {manualTaskError}
            </div>
          )}
          
          <Input
            label="Task Title"
            value={manualTaskForm.title}
            onChange={(e) => setManualTaskForm({ ...manualTaskForm, title: e.target.value })}
            required
          />

          <TextArea
            label="Task Description"
            value={manualTaskForm.description}
            onChange={(e) => setManualTaskForm({ ...manualTaskForm, description: e.target.value })}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Assign Technician <span className="text-red-600 ml-0.5">*</span>
            </label>
            <select
              value={manualTaskForm.assigned_to}
              onChange={(e) => setManualTaskForm({ ...manualTaskForm, assigned_to: e.target.value })}
              className="input-field text-sm bg-white cursor-pointer"
              required
            >
              <option value="">Select Technician...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <SearchableAssetDropdown
            label="Select Asset"
            required
            value={manualTaskForm.card_no}
            onChange={(card_no) => setManualTaskForm({ ...manualTaskForm, card_no })}
            assets={allAssetsForTask}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              value={manualTaskForm.priority}
              onChange={(e) => setManualTaskForm({ ...manualTaskForm, priority: e.target.value as any })}
              className="input-field text-sm bg-white cursor-pointer"
            >
              <option value="normal">Normal</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={manualTaskForm.due_date}
              onChange={(e) => setManualTaskForm({ ...manualTaskForm, due_date: e.target.value })}
              className="input-field text-sm bg-white"
            />
          </div>

          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="secondary" onClick={() => setIsManualTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Manual Task Modal */}
      <Modal
        isOpen={isEditManualTaskModalOpen}
        title="Edit Manual Task"
        onClose={() => setIsEditManualTaskModalOpen(false)}
      >
        <form onSubmit={handleEditManualTaskSubmit} className="space-y-4">
          {editManualTaskError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {editManualTaskError}
            </div>
          )}
          
          <Input
            label="Task Title"
            value={editManualTaskForm.title}
            onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, title: e.target.value })}
            required
          />

          <TextArea
            label="Task Description"
            value={editManualTaskForm.description}
            onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, description: e.target.value })}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Assign Technician <span className="text-red-600 ml-0.5">*</span>
            </label>
            <select
              value={editManualTaskForm.assigned_to}
              onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, assigned_to: e.target.value })}
              className="input-field text-sm bg-white cursor-pointer"
              required
            >
              <option value="">Select Technician...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <SearchableAssetDropdown
            label="Select Asset"
            required
            value={editManualTaskForm.card_no}
            onChange={(card_no) => setEditManualTaskForm({ ...editManualTaskForm, card_no })}
            assets={allAssetsForTask}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              value={editManualTaskForm.priority}
              onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, priority: e.target.value as any })}
              className="input-field text-sm bg-white cursor-pointer"
            >
              <option value="normal">Normal</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={editManualTaskForm.status}
              onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, status: e.target.value as any })}
              className="input-field text-sm bg-white cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={editManualTaskForm.due_date}
              onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, due_date: e.target.value })}
              className="input-field text-sm bg-white"
            />
          </div>

          <TextArea
            label="Tech Remarks"
            value={editManualTaskForm.tech_remarks}
            onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, tech_remarks: e.target.value })}
          />

          <TextArea
            label="Manager Remarks"
            value={editManualTaskForm.eng_remarks}
            onChange={(e) => setEditManualTaskForm({ ...editManualTaskForm, eng_remarks: e.target.value })}
          />

          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="secondary" onClick={() => setIsEditManualTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        allowedRoles={[
          { value: "ENGINEER", label: "Engineer" },
          { value: "STAFF", label: "Staff" },
        ]}
        defaultHotelId={user?.hotelId}
        onSubmit={async (data) => {
          const { name, email, mobileNumber, role, hotelId } = data;
          await userService.createInternalUser({
            name,
            email,
            mobileNumber,
            role,
            hotelId
          });
        }}
      />
    </DashboardLayout>

  );
};

