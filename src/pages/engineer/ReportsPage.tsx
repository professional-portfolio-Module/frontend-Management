import React, { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiFileText,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiX,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
} from "react-icons/fi";
import { Card } from "../../components/common/Card";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input, TextArea, Select } from "../../components/common/Form";
import { useAuth } from "../../context/AuthContext";
import { scheduledTaskService, ScheduledTask } from "../../services/scheduledTaskService";
import { manualTaskService, ManualTask } from "../../services/manualTaskService";

export interface Report {
  id: string; // "scheduled-{id}" or "manual-{id}"
  reportId: string;
  reportTitle: string;
  deviceName: string;
  deviceType: string;
  technicianId: string;
  technicianName: string;
  uploadedDate: string;
  maintenanceStatus: "pending-review" | "approved" | "needs-rework" | "closed";
  priority: "urgent" | "high" | "medium" | "low";
  issueDescription: string;
  repairSummary: string;
  attachments?: string[];
  engineerRemarks?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  originalTask: any;
}

const mapScheduledTask = (task: ScheduledTask): Report => {
  let status: Report["maintenanceStatus"] = "pending-review";
  if (task.status === "completed") status = "approved";
  else if (task.status === "rejected") status = "needs-rework";

  return {
    id: `scheduled-${task.task_id}`,
    reportId: task.task_id,
    reportTitle: task.schedule_title || "Scheduled Maintenance",
    deviceName: task.asset_description || `Asset: ${task.asset_card_no || "N/A"}`,
    deviceType: "General",
    technicianId: task.done_by || "",
    technicianName: task.done_by_name || "Unassigned",
    uploadedDate: task.completed_at || task.due_date || new Date().toISOString(),
    maintenanceStatus: status,
    priority: task.priority === "emergency" ? "urgent" : "medium",
    issueDescription: task.additional_details || "No description provided.",
    repairSummary: task.technician_remarks || "No technician remarks provided.",
    attachments: task.attachment_url ? [task.attachment_url] : [],
    engineerRemarks: task.engineer_remarks || "",
    reviewedBy: task.checked_by_name || "",
    reviewedDate: task.completed_at || "",
    originalTask: task
  };
};

const mapManualTask = (task: ManualTask): Report => {
  let status: Report["maintenanceStatus"] = "pending-review";
  if (task.status === "completed") status = "approved";
  else if (task.status === "rejected" || task.status === "expired") status = "needs-rework";

  return {
    id: `manual-${task.manual_task_id}`,
    reportId: task.manual_task_id,
    reportTitle: task.title || "Manual Task",
    deviceName: task.asset_description || `Asset: ${task.card_no || "N/A"}`,
    deviceType: "General",
    technicianId: task.assigned_to || "",
    technicianName: task.assigned_to_name || "Unassigned",
    uploadedDate: task.completed_at || task.due_date || task.created_at || new Date().toISOString(),
    maintenanceStatus: status,
    priority: task.priority === "emergency" ? "urgent" : "medium",
    issueDescription: task.description || "No description provided.",
    repairSummary: task.tech_remarks || "No technician remarks provided.",
    attachments: task.attachment_url ? [task.attachment_url] : [],
    engineerRemarks: task.eng_remarks || "",
    reviewedBy: task.checked_by_name || "",
    reviewedDate: task.completed_at || "",
    originalTask: task
  };
};

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [engineerRemarks, setEngineerRemarks] = useState("");
  const [isRemarksSaving, setIsRemarksSaving] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 9;

  const fetchReports = async () => {
    if (!user?.hotelId) return;
    setLoading(true);
    try {
      const [scheduledRes, manualRes] = await Promise.all([
        scheduledTaskService.getScheduledTasks(user.hotelId, undefined, "emergency"),
        manualTaskService.getManualTasks({ hotel_id: user.hotelId, priority: "emergency" })
      ]);
      
      const filteredScheduled = scheduledRes.filter(t => 
        t.status === "under_review" || t.status === "completed" || t.status === "rejected"
      );
      const filteredManual = manualRes.filter(t => 
        t.status === "under_review" || t.status === "completed" || t.status === "rejected"
      );

      const mappedReports = [
        ...filteredScheduled.map(mapScheduledTask),
        ...filteredManual.map(mapManualTask)
      ];

      mappedReports.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
      setReports(mappedReports);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user?.hotelId]);

  // Get unique technicians, device types
  const uniqueTechnicians = useMemo(() => {
    const uniqueIds = Array.from(new Set(reports.map(r => r.technicianId).filter(Boolean)));
    return uniqueIds.map(id => {
      const rep = reports.find(r => r.technicianId === id);
      return { id, name: rep?.technicianName || "Unknown" };
    });
  }, [reports]);

  const uniqueDeviceTypes = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.deviceType).filter(Boolean)));
  }, [reports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.technicianName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || report.maintenanceStatus === statusFilter;

      const matchesDeviceType =
        deviceTypeFilter === "all" || report.deviceType === deviceTypeFilter;

      const matchesTechnician =
        technicianFilter === "all" ||
        report.technicianId === technicianFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDeviceType &&
        matchesTechnician
      );
    });
  }, [reports, searchTerm, statusFilter, deviceTypeFilter, technicianFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setEngineerRemarks(report.engineerRemarks || "");
    setShowModal(true);
  };

  const closeReportModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setEngineerRemarks("");
  };

  const handleSaveRemarks = async () => {
    if (!selectedReport) return;
    setIsRemarksSaving(true);
    try {
      const isScheduled = selectedReport.id.startsWith("scheduled-");
      const taskId = selectedReport.reportId;
      if (isScheduled) {
        await scheduledTaskService.updateScheduledTask(taskId, {
          engineer_remarks: engineerRemarks
        });
      } else {
        await manualTaskService.updateManualTask(taskId, {
          eng_remarks: engineerRemarks
        });
      }
      alert("Remarks saved successfully!");
      fetchReports();
    } catch (err: any) {
      alert(err.message || "Failed to save remarks");
    } finally {
      setIsRemarksSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "approved" | "needs-rework") => {
    if (!selectedReport) return;
    try {
      const isScheduled = selectedReport.id.startsWith("scheduled-");
      const taskId = selectedReport.reportId;
      const backendStatus = newStatus === "approved" ? "completed" : "rejected";
      if (isScheduled) {
        await scheduledTaskService.updateScheduledTask(taskId, {
          status: backendStatus,
          engineer_remarks: engineerRemarks
        });
      } else {
        await manualTaskService.updateManualTask(taskId, {
          status: backendStatus,
          eng_remarks: engineerRemarks
        });
      }
      alert(`Report marked as ${newStatus}!`);
      closeReportModal();
      fetchReports();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "pending-review": { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock },
      approved: { bg: "bg-green-100", text: "text-green-800", icon: FiCheckCircle },
      "needs-rework": { bg: "bg-red-100", text: "text-red-800", icon: FiAlertCircle },
      closed: { bg: "bg-blue-100", text: "text-blue-800", icon: FiCheckCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || FiFileText;
    return {
      badge: `${config.bg} ${config.text}`,
      icon: Icon,
      label: status.replace("-", " ").toUpperCase(),
    };
  };

  // Priority styling
  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-blue-100 text-blue-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Technician Reports</h1>
        <p className="text-slate-600">
          Review and manage reports submitted by technicians for device maintenance and repairs
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <Input
              placeholder="Search by report title, device name, or technician..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon={<FiSearch />}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending-review", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "needs-rework", label: "Needs Rework" },
                { value: "closed", label: "Closed" },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              label="Device Type"
              options={[
                { value: "all", label: "All Types" },
                ...uniqueDeviceTypes.map((type) => ({
                  value: type,
                  label: type,
                })),
              ]}
              value={deviceTypeFilter}
              onChange={(e) => {
                setDeviceTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              label="Technician"
              options={[
                { value: "all", label: "All Technicians" },
                ...uniqueTechnicians.map((tech) => ({
                  value: tech.id,
                  label: tech.name,
                })),
              ]}
              value={technicianFilter}
              onChange={(e) => {
                setTechnicianFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {paginatedReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
        {Math.min(currentPage * itemsPerPage, filteredReports.length)} of{" "}
        {filteredReports.length} reports
      </div>

      {/* Reports Display */}
      {loading ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl text-primary-500 animate-spin mb-4">⏳</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Reports...</h3>
          <p className="text-slate-600">Please wait while we fetch the latest technician reports.</p>
        </Card>
      ) : filteredReports.length === 0 ? (
        // Empty State
        <Card className="flex flex-col items-center justify-center py-12">
          <div className="text-5xl text-slate-300 mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports Found</h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your search filters or check back later for new reports
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setDeviceTypeFilter("all");
              setTechnicianFilter("all");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : viewMode === "cards" ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReports.map((report) => {
            const statusConfig = getStatusBadge(report.maintenanceStatus);
            const StatusIcon = statusConfig.icon;
            const isReviewed = report.maintenanceStatus === "approved";

            return (
              <Card
                key={report.id}
                className="flex flex-col hover:shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => openReportModal(report)}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                      {report.reportTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{report.reportId}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getPriorityColor(
                      report.priority
                    )}`}
                  >
                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                  </span>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit ${statusConfig.badge}`}>
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </div>

                {/* Device Info */}
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 font-medium min-w-fit">Device:</span>
                    <span className="text-slate-900 line-clamp-1">{report.deviceName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 font-medium min-w-fit">Type:</span>
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs">
                      {report.deviceType}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiUser size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-900 text-sm">{report.technicianName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 text-sm">
                      {new Date(report.uploadedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
                  <p className="text-slate-600 line-clamp-2">{report.issueDescription}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReportModal(report);
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm transition"
                  >
                    View Details →
                  </button>
                  {isReviewed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Reviewed
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        // Table View
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Report</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Device</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Technician</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => {
                const statusConfig = getStatusBadge(report.maintenanceStatus);
                const StatusIcon = statusConfig.icon;
                const isReviewed = report.maintenanceStatus === "approved";

                return (
                  <tr
                    key={report.id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => openReportModal(report)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-900 truncate">
                          {report.reportTitle}
                        </div>
                        {isReviewed && (
                          <span className="text-green-600 flex-shrink-0" title="Reviewed">
                            <FiCheckCircle size={14} />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{report.reportId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-900 truncate">
                      {report.deviceName}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {report.technicianName}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.badge}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(report.uploadedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openReportModal(report);
                        }}
                        className="text-primary-600 hover:text-primary-700 font-medium transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition ${
                  page === currentPage
                    ? "bg-primary-600 text-white"
                    : "hover:bg-slate-100 text-slate-900"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </Card>
      )}

      {/* Report Detail Modal */}
      <Modal
        isOpen={showModal}
        title=""
        onClose={closeReportModal}
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedReport.reportTitle}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedReport.reportId}
                  </p>
                </div>
                <button
                  onClick={closeReportModal}
                  className="p-1 hover:bg-slate-100 rounded-lg transition"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {(() => {
                  const statusConfig = getStatusBadge(
                    selectedReport.maintenanceStatus
                  );
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.badge}`}
                    >
                      <StatusIcon size={16} />
                      {statusConfig.label}
                    </div>
                  );
                })()}
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(
                    selectedReport.priority
                  )}`}
                >
                  {selectedReport.priority.charAt(0).toUpperCase() +
                    selectedReport.priority.slice(1)}{" "}
                  Priority
                </span>
              </div>
            </div>

            {/* Report Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Device Name
                </p>
                <p className="text-slate-900 font-medium mt-1">
                  {selectedReport.deviceName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Device Type
                </p>
                <p className="text-slate-900 font-medium mt-1">
                  {selectedReport.deviceType}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Technician
                </p>
                <p className="text-slate-900 font-medium mt-1">
                  {selectedReport.technicianName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Uploaded Date
                </p>
                <p className="text-slate-900 font-medium mt-1">
                  {new Date(selectedReport.uploadedDate).toLocaleDateString()} at{" "}
                  {new Date(selectedReport.uploadedDate).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Issue Description
              </p>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                {selectedReport.issueDescription}
              </p>
            </div>

            {/* Repair Summary */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Repair Summary
              </p>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                {selectedReport.repairSummary}
              </p>
            </div>

            {/* Engineer Remarks */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiMessageCircle size={16} className="text-slate-600" />
                <p className="text-sm font-semibold text-slate-900">
                  Engineer Remarks
                </p>
              </div>
              <TextArea
                placeholder="Add your remarks or comments about this report..."
                value={engineerRemarks}
                onChange={(e) => setEngineerRemarks(e.target.value)}
                rows={4}
              />
            </div>

            {/* Review Status */}
            {selectedReport.reviewedBy && selectedReport.reviewedDate && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  ✓ Reviewed on{" "}
                  {new Date(selectedReport.reviewedDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Attachments Preview */}
            {(selectedReport.attachments?.length || 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Attachments
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.attachments?.map((file, idx) => (
                    <a
                      key={idx}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm text-slate-700"
                    >
                      <FiDownload size={14} />
                      {file}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={handleSaveRemarks}
                disabled={isRemarksSaving}
              >
                {isRemarksSaving ? "Saving..." : "Save Remarks"}
              </Button>
              <Button
                onClick={() => handleUpdateStatus("approved")}
                variant="secondary"
              >
                <FiCheckCircle size={16} className="mr-1" />
                Approve & Complete
              </Button>
              <Button
                onClick={() => handleUpdateStatus("needs-rework")}
                variant="danger"
              >
                <FiAlertCircle size={16} className="mr-1" />
                Request Rework
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
