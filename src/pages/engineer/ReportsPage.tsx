import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiFileText,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiX,
  FiDownload,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
} from "react-icons/fi";
import { Card } from "../../components/common/Card";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input, TextArea, Select } from "../../components/common/Form";
import { mockReports, Report } from "../../mock/data";
import { mockStaff } from "../../mock/users";

export const ReportsPage: React.FC = () => {
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
  const [markedAsReviewed, setMarkedAsReviewed] = useState<Set<string>>(new Set());

  const itemsPerPage = 9;

  // Get unique technicians, device types
  const uniqueTechnicians = Array.from(
    new Set(mockReports.map((r) => r.technicianId))
  ).map((id) => mockReports.find((r) => r.technicianId === id)!);

  const uniqueDeviceTypes = Array.from(
    new Set(mockReports.map((r) => r.deviceType))
  );

  // Filter reports
  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
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
  }, [searchTerm, statusFilter, deviceTypeFilter, technicianFilter]);

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

  const handleSaveRemarks = () => {
    setIsRemarksSaving(true);
    setTimeout(() => {
      setIsRemarksSaving(false);
      alert("Remarks saved successfully!");
    }, 1000);
  };

  const handleMarkAsReviewed = () => {
    if (selectedReport) {
      setMarkedAsReviewed((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedReport.id);
        return newSet;
      });
      alert(`Report ${selectedReport.reportId} marked as reviewed!`);
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
        <h1 className="text-3xl font-bold text-gray-900">Technician Reports</h1>
        <p className="text-gray-600">
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
                  value: tech.technicianId,
                  label: tech.technicianName,
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
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
        {Math.min(currentPage * itemsPerPage, filteredReports.length)} of{" "}
        {filteredReports.length} reports
      </div>

      {/* Reports Display */}
      {filteredReports.length === 0 ? (
        // Empty State
        <Card className="flex flex-col items-center justify-center py-12">
          <div className="text-5xl text-gray-300 mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600 mb-6">
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
            const isReviewed = markedAsReviewed.has(report.id);

            return (
              <Card
                key={report.id}
                className="flex flex-col hover:shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => openReportModal(report)}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {report.reportTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{report.reportId}</p>
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
                    <span className="text-gray-500 font-medium min-w-fit">Device:</span>
                    <span className="text-gray-900 line-clamp-1">{report.deviceName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-fit">Type:</span>
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                      {report.deviceType}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiUser size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 text-sm">{report.technicianName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCalendar size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">
                      {new Date(report.uploadedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600 line-clamp-2">{report.issueDescription}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
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
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Report</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Device</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Technician</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => {
                const statusConfig = getStatusBadge(report.maintenanceStatus);
                const StatusIcon = statusConfig.icon;
                const isReviewed = markedAsReviewed.has(report.id);

                return (
                  <tr
                    key={report.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => openReportModal(report)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate">
                        {report.reportTitle}
                      </div>
                      <div className="text-xs text-gray-500">{report.reportId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 truncate">
                      {report.deviceName}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
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
                    <td className="px-4 py-3 text-gray-600">
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
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedReport.reportTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedReport.reportId}
                  </p>
                </div>
                <button
                  onClick={closeReportModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
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
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Device Name
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {selectedReport.deviceName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Device Type
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {selectedReport.deviceType}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Technician
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {selectedReport.technicianName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Uploaded Date
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(selectedReport.uploadedDate).toLocaleDateString()} at{" "}
                  {new Date(selectedReport.uploadedDate).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Issue Description
              </p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedReport.issueDescription}
              </p>
            </div>

            {/* Repair Summary */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Repair Summary
              </p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedReport.repairSummary}
              </p>
            </div>

            {/* Engineer Remarks */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiMessageCircle size={16} className="text-gray-600" />
                <p className="text-sm font-semibold text-gray-900">
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
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Attachments
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.attachments?.map((file, idx) => (
                    <a
                      key={idx}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm text-gray-700"
                    >
                      <FiDownload size={14} />
                      {file}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSaveRemarks}
                disabled={isRemarksSaving}
              >
                {isRemarksSaving ? "Saving..." : "Save Remarks"}
              </Button>
              <Button
                onClick={handleMarkAsReviewed}
                variant="secondary"
              >
                <FiCheckCircle size={16} />
                Mark as Reviewed
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
