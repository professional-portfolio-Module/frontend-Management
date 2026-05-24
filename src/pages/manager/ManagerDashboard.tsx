import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiClock, FiFileText, FiMessageSquare, FiBell, FiActivity, FiFolder, FiHardDrive } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input, Select, TextArea } from "../../components/common/Form";
import { useAuth } from "../../context/AuthContext";
import { mockActivities, mockNotifications } from "../../mock/data";
import { mockUsers } from "../../mock/users";
import { CreateAccountModal } from "../../components/common/CreateAccountModal";
import { userService } from "../../services/userService";
import { categoryService, Category } from "../../services/categoryService";
import { assetService, Asset } from "../../services/assetService";
import { HOTELS } from "../../constants/hotels";

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "overview";
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "", code: "", description: "" });
  const [categoryError, setCategoryError] = useState("");

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

  // Assets filters and pagination state
  const [assetSearch, setAssetSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState("");
  const [assetStatus, setAssetStatus] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [assetTotalPages, setAssetTotalPages] = useState(1);

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

  const fetchAssets = async () => {
    setAssetsLoading(true);
    try {
      const response = await assetService.getAssets({
        page: assetPage,
        limit: 10,
        search: assetSearch || undefined,
        category_id: assetCategory || undefined,
        status: assetStatus || undefined,
      });
      setAssets(response.items);
      setAssetTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setAssetsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "verification") {
      userService.getPendingUsers().then((users) => {
        setPendingUsers(users);
      });
    } else if (activeTab === "categories" || activeTab === "assets") {
      fetchCategories();
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (activeTab === "assets") {
      fetchAssets();
    }
  }, [activeTab, assetPage, assetSearch, assetCategory, assetStatus]);

  const engineers = mockUsers.filter((u) => u.role === "engineer");
  const staff = mockUsers.filter((u) => u.role === "staff");
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

  const sidebarItems = [
    { icon: <FiActivity />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
    { icon: <FiUsers />, label: "User Management", active: activeTab === "users", onClick: () => setActiveTab("users") },
    { icon: <FiCheckCircle />, label: "Verification", active: activeTab === "verification", onClick: () => setActiveTab("verification"), badge: pendingUsers.length },
    { icon: <FiFolder />, label: "Categories", active: activeTab === "categories", onClick: () => setActiveTab("categories") },
    { icon: <FiHardDrive />, label: "Assets", active: activeTab === "assets", onClick: () => setActiveTab("assets") },
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
            <StatCard icon={<FiUsers size={18} />} label="Total Engineers" value={engineers.length} color="blue" />
            <StatCard icon={<FiCheckCircle size={18} />} label="Staff Members" value={staff.length} color="green" />
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
            data={mockUsers.filter((u) => u.role !== "admin")}
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
                  hotel_id: HOTELS[0]?.id || "",
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
          <div className="p-5 bg-slate-50 border-b border-slate-200 grid md:grid-cols-3 gap-4">
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
                <option value="active">Active</option>
                <option value="under_maintainace">Under Maintenance</option>
                <option value="breakdown">Breakdown</option>
                <option value="retired">Retired</option>
                <option value="inactive">Inactive</option>
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

      {/* Work Items Tab */}
      {activeTab === "work-items" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Manage Work Items</h2>
            <Button onClick={() => navigate("/manager/create-work-item")}>+ New Work Item</Button>
          </div>
          <p className="text-slate-600">View and manage all work items assigned to your team members.</p>
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

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} title="Edit Profile" onClose={() => setShowProfileModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
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
            options={HOTELS.map((h) => ({ value: h.id, label: `${h.name} - ${h.city}` }))}
            value={assetFormData.hotel_id}
            onChange={(e) => setAssetFormData({ ...assetFormData, hotel_id: e.target.value })}
            required
          />
          <Input
            label="Location"
            value={assetFormData.location}
            onChange={(e) => setAssetFormData({ ...assetFormData, location: e.target.value })}
          />
          <Select
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "under_maintainace", label: "Under Maintenance" },
              { value: "breakdown", label: "Breakdown" },
              { value: "retired", label: "Retired" },
              { value: "inactive", label: "Inactive" }
            ]}
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

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        allowedRoles={[
          { value: "ENGINEER", label: "Engineer" },
          { value: "STAFF", label: "Staff" },
        ]}
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

