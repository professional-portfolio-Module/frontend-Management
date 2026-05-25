import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiClock, FiMessageSquare, FiBell, FiCalendar, FiFolder, FiHardDrive } from "react-icons/fi";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard, Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { mockSchedules, mockNotifications, mockMessages } from "../../mock/data";
import { categoryService, Category } from "../../services/categoryService";
import { assetService, Asset } from "../../services/assetService";
import apiClient from "../../services/api";

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "overview";
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  // Categories & Assets read-only state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
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

  const mySchedules = mockSchedules.filter((s) => s.userId === user?.id);
  const unreadNotifications = mockNotifications.filter((n) => !n.read && n.userId === user?.id);
  const myMessages = mockMessages.filter((m) => m.receiverId === user?.id || m.senderId === user?.id);
  const unreadMessages = myMessages.filter((m) => !m.read && m.receiverId === user?.id);

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

  useEffect(() => {
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
          console.error("Failed to fetch user's hotels:", err);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "categories" || activeTab === "assets") {
      fetchCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "assets") {
      fetchAssets();
    }
  }, [activeTab, assetPage, assetSearch, assetCategory, assetStatus, selectedHotelId]);

  const sidebarItems = [
    { icon: <FiBell />, label: "Dashboard", active: activeTab === "overview", onClick: () => setActiveTab("overview") },
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
    </DashboardLayout>
  );
};
