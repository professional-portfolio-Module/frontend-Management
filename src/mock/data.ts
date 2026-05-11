export interface WorkItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: "shift" | "maintenance" | "training" | "meeting";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  attachments?: string[];
}

export interface SystemLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  status: "success" | "failed";
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface Report {
  id: string;
  reportId: string;
  deviceName: string;
  deviceType: "HVAC" | "Electrical" | "Plumbing" | "Fire Safety" | "Generator" | "Other";
  technicianId: string;
  technicianName: string;
  reportTitle: string;
  issueDescription: string;
  repairSummary: string;
  uploadedDate: string;
  maintenanceStatus: "pending-review" | "approved" | "needs-rework" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  reviewedBy?: string;
  reviewedDate?: string;
  engineerRemarks?: string;
  attachments?: string[];
  images?: string[];
}

export const mockWorkItems: WorkItem[] = [
  {
    id: "1",
    title: "Maintenance Check - Building A",
    description: "Monthly maintenance inspection for Building A ventilation system",
    assignedTo: "2",
    assignedBy: "1",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-05-15",
    createdAt: "2024-05-01",
    updatedAt: "2024-05-10",
  },
  {
    id: "2",
    title: "Equipment Calibration",
    description: "Calibrate pressure gauges and flow meters",
    assignedTo: "4",
    assignedBy: "1",
    status: "pending",
    priority: "medium",
    dueDate: "2024-05-20",
    createdAt: "2024-05-02",
    updatedAt: "2024-05-02",
  },
  {
    id: "3",
    title: "Safety Audit - Zone B",
    description: "Complete safety audit for Zone B",
    assignedTo: "2",
    assignedBy: "1",
    status: "completed",
    priority: "high",
    dueDate: "2024-05-10",
    createdAt: "2024-04-25",
    updatedAt: "2024-05-10",
  },
  {
    id: "4",
    title: "Electrical System Inspection",
    description: "Inspect main electrical panel and connections",
    assignedTo: "4",
    assignedBy: "1",
    status: "on-hold",
    priority: "medium",
    dueDate: "2024-05-25",
    createdAt: "2024-05-03",
    updatedAt: "2024-05-08",
  },
  {
    id: "5",
    title: "Replace HVAC Filters",
    description: "Replace all HVAC filters in Building C",
    assignedTo: "2",
    assignedBy: "1",
    status: "pending",
    priority: "low",
    dueDate: "2024-05-22",
    createdAt: "2024-05-04",
    updatedAt: "2024-05-04",
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: "1",
    userId: "2",
    date: "2024-05-15",
    startTime: "08:00",
    endTime: "16:00",
    location: "Building A",
    type: "shift",
    status: "scheduled",
    notes: "Regular maintenance shift",
  },
  {
    id: "2",
    userId: "2",
    date: "2024-05-16",
    startTime: "08:00",
    endTime: "12:00",
    location: "Building B",
    type: "maintenance",
    status: "scheduled",
    notes: "Scheduled maintenance",
  },
  {
    id: "3",
    userId: "3",
    date: "2024-05-15",
    startTime: "09:00",
    endTime: "17:00",
    location: "Office",
    type: "shift",
    status: "scheduled",
  },
  {
    id: "4",
    userId: "4",
    date: "2024-05-17",
    startTime: "10:00",
    endTime: "14:00",
    location: "Training Center",
    type: "training",
    status: "scheduled",
    notes: "Safety training session",
  },
  {
    id: "5",
    userId: "3",
    date: "2024-05-14",
    startTime: "08:00",
    endTime: "16:00",
    location: "Office",
    type: "shift",
    status: "completed",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "2",
    title: "Work Item Assigned",
    message: "You have been assigned a new work item: Maintenance Check - Building A",
    type: "info",
    read: false,
    createdAt: "2024-05-10T10:30:00",
    actionUrl: "/engineer/work-items",
  },
  {
    id: "2",
    userId: "2",
    title: "Schedule Updated",
    message: "Your schedule has been updated for tomorrow",
    type: "info",
    read: false,
    createdAt: "2024-05-10T09:15:00",
  },
  {
    id: "3",
    userId: "1",
    title: "Pending Verification",
    message: "User David Smith is pending account verification",
    type: "warning",
    read: false,
    createdAt: "2024-05-10T08:45:00",
    actionUrl: "/manager/verification",
  },
  {
    id: "4",
    userId: "3",
    title: "System Maintenance",
    message: "System maintenance scheduled for tonight at 2 AM",
    type: "warning",
    read: true,
    createdAt: "2024-05-09T16:00:00",
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "1",
    receiverId: "2",
    subject: "Regarding Work Assignment",
    content: "Please complete the maintenance check for Building A by end of day.",
    read: false,
    createdAt: "2024-05-10T10:00:00",
  },
  {
    id: "2",
    senderId: "2",
    receiverId: "1",
    subject: "Re: Regarding Work Assignment",
    content: "I have started the inspection. Should be complete by 3 PM.",
    read: true,
    createdAt: "2024-05-10T11:30:00",
  },
  {
    id: "3",
    senderId: "1",
    receiverId: "4",
    subject: "Equipment Calibration",
    content: "Please calibrate all instruments before Friday.",
    read: false,
    createdAt: "2024-05-09T14:20:00",
  },
  {
    id: "4",
    senderId: "3",
    receiverId: "1",
    subject: "Schedule Conflict",
    content: "I have a conflict on the schedule for May 16th.",
    read: true,
    createdAt: "2024-05-08T09:00:00",
  },
];

export const mockSystemLogs: SystemLog[] = [
  {
    id: "1",
    userId: "1",
    action: "CREATE",
    resource: "WorkItem",
    details: "Created work item: Maintenance Check - Building A",
    timestamp: "2024-05-10T08:00:00",
    status: "success",
  },
  {
    id: "2",
    userId: "2",
    action: "UPDATE",
    resource: "WorkItem",
    details: "Updated work item status to in-progress",
    timestamp: "2024-05-10T09:30:00",
    status: "success",
  },
  {
    id: "3",
    userId: "1",
    action: "DELETE",
    resource: "Schedule",
    details: "Deleted schedule entry",
    timestamp: "2024-05-09T15:45:00",
    status: "success",
  },
  {
    id: "4",
    userId: "3",
    action: "LOGIN",
    resource: "User",
    details: "User logged in",
    timestamp: "2024-05-10T08:15:00",
    status: "success",
  },
  {
    id: "5",
    userId: "1",
    action: "UPDATE",
    resource: "User",
    details: "Updated user information",
    timestamp: "2024-05-10T10:20:00",
    status: "success",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    userId: "2",
    action: "Completed Work Item",
    description: "Safety Audit - Zone B has been marked as complete",
    timestamp: "2024-05-10T14:30:00",
    icon: "CheckCircle",
  },
  {
    id: "2",
    userId: "1",
    action: "Assigned Work Item",
    description: "Assigned Equipment Calibration to Emma Johnson",
    timestamp: "2024-05-10T11:00:00",
    icon: "AlertCircle",
  },
  {
    id: "3",
    userId: "4",
    action: "Updated Schedule",
    description: "Emma Johnson updated their schedule",
    timestamp: "2024-05-10T09:45:00",
    icon: "Clock",
  },
  {
    id: "4",
    userId: "3",
    action: "Login",
    description: "Mike Staff logged into the system",
    timestamp: "2024-05-10T08:00:00",
    icon: "LogIn",
  },
  {
    id: "5",
    userId: "1",
    action: "Sent Message",
    description: "John Manager sent a message to Sarah Engineer",
    timestamp: "2024-05-09T16:20:00",
    icon: "Mail",
  },
];

export const mockReports: Report[] = [
  {
    id: "1",
    reportId: "RPT-2024-001",
    deviceName: "Central HVAC System - Building A",
    deviceType: "HVAC",
    technicianId: "3",
    technicianName: "Mike Staff",
    reportTitle: "Quarterly HVAC Maintenance",
    issueDescription: "Routine maintenance inspection of the central HVAC system. Filter replacement needed.",
    repairSummary: "Replaced all air filters, checked refrigerant levels (normal), inspected evaporator coil, cleaned condensate drain. System operating normally.",
    uploadedDate: "2024-05-10T14:30:00",
    maintenanceStatus: "pending-review",
    priority: "medium",
    attachments: ["maintenance_log.pdf"],
    images: ["hvac_filter.jpg", "hvac_coil.jpg"],
  },
  {
    id: "2",
    reportId: "RPT-2024-002",
    deviceName: "Main Electrical Panel - Building B",
    deviceType: "Electrical",
    technicianId: "5",
    technicianName: "David Smith",
    reportTitle: "Electrical System Inspection",
    issueDescription: "Safety inspection of main electrical panel. Loose connections found on circuit breaker 7.",
    repairSummary: "Tightened all loose connections, tested circuit integrity, replaced damaged insulation on breaker 7. All systems now safe and compliant.",
    uploadedDate: "2024-05-09T11:15:00",
    maintenanceStatus: "approved",
    priority: "high",
    reviewedBy: "2",
    reviewedDate: "2024-05-10T09:00:00",
    engineerRemarks: "Good catch on the loose connections. Approved for closure.",
    attachments: ["electrical_report.pdf"],
    images: ["panel_overview.jpg", "breaker_7.jpg"],
  },
  {
    id: "3",
    reportId: "RPT-2024-003",
    deviceName: "Backup Generator - Facility",
    deviceType: "Generator",
    technicianId: "3",
    technicianName: "Mike Staff",
    reportTitle: "Generator Load Test",
    issueDescription: "Monthly load test of backup generator. Oil leak detected near fuel pump.",
    repairSummary: "Replaced fuel pump gasket, refilled oil to proper level, ran load test for 1 hour. All systems operational.",
    uploadedDate: "2024-05-08T16:45:00",
    maintenanceStatus: "approved",
    priority: "high",
    reviewedBy: "2",
    reviewedDate: "2024-05-09T08:30:00",
    engineerRemarks: "Critical repair handled promptly. Excellent work.",
    attachments: ["load_test_report.pdf"],
    images: ["generator_oil_leak.jpg"],
  },
  {
    id: "4",
    reportId: "RPT-2024-004",
    deviceName: "Plumbing System - 3rd Floor",
    deviceType: "Plumbing",
    technicianId: "5",
    technicianName: "David Smith",
    reportTitle: "Water Pressure Issue Investigation",
    issueDescription: "Low water pressure reported on 3rd floor. Investigation needed to locate blockage.",
    repairSummary: "Found calcium buildup in main supply line. Pressure relief valve replaced, main line flushed.",
    uploadedDate: "2024-05-10T10:20:00",
    maintenanceStatus: "needs-rework",
    priority: "medium",
    engineerRemarks: "Water pressure still showing low on follow-up. Please re-inspect main supply line.",
    attachments: ["plumbing_report.pdf"],
    images: ["pipe_blockage.jpg"],
  },
  {
    id: "5",
    reportId: "RPT-2024-005",
    deviceName: "Fire Safety System - All Zones",
    deviceType: "Fire Safety",
    technicianId: "3",
    technicianName: "Mike Staff",
    reportTitle: "Annual Fire Safety Certification",
    issueDescription: "Annual inspection and certification of all fire safety systems including sprinklers and alarms.",
    repairSummary: "Tested all sprinkler heads, replaced corroded nozzles in Zone B, recalibrated all fire alarms, updated certification documents.",
    uploadedDate: "2024-05-07T13:00:00",
    maintenanceStatus: "closed",
    priority: "high",
    reviewedBy: "2",
    reviewedDate: "2024-05-08T10:15:00",
    engineerRemarks: "All systems pass safety standards. Certification renewed for next 12 months.",
    attachments: ["fire_safety_cert.pdf", "inspection_checklist.pdf"],
    images: ["sprinkler_test.jpg", "alarm_test.jpg"],
  },
  {
    id: "6",
    reportId: "RPT-2024-006",
    deviceName: "UPS System - Data Center",
    deviceType: "Electrical",
    technicianId: "5",
    technicianName: "David Smith",
    reportTitle: "UPS Battery Backup Test",
    issueDescription: "Quarterly battery backup test for UPS system. Need to verify load capacity.",
    repairSummary: "Performed full load test, battery passed all capacity checks, replaced 2 failing battery modules, verified automatic failover.",
    uploadedDate: "2024-05-06T15:30:00",
    maintenanceStatus: "approved",
    priority: "high",
    reviewedBy: "2",
    reviewedDate: "2024-05-07T11:00:00",
    engineerRemarks: "Good preventive maintenance on battery modules.",
    attachments: ["ups_test_report.pdf"],
    images: ["battery_modules.jpg"],
  },
  {
    id: "7",
    reportId: "RPT-2024-007",
    deviceName: "Chiller Unit - Building C",
    deviceType: "HVAC",
    technicianId: "3",
    technicianName: "Mike Staff",
    reportTitle: "Chiller Performance Optimization",
    issueDescription: "Chiller efficiency declining. Routine maintenance and performance check needed.",
    repairSummary: "Cleaned evaporator tubes, replaced compressor oil, calibrated thermostat, system efficiency improved by 15%.",
    uploadedDate: "2024-05-05T09:45:00",
    maintenanceStatus: "approved",
    priority: "medium",
    reviewedBy: "2",
    reviewedDate: "2024-05-06T14:20:00",
    engineerRemarks: "Efficiency improvement verified. Great optimization work.",
    attachments: ["chiller_report.pdf"],
    images: ["evaporator_clean.jpg", "efficiency_chart.jpg"],
  },
  {
    id: "8",
    reportId: "RPT-2024-008",
    deviceName: "Door Access Control - Main Entrance",
    deviceType: "Other",
    technicianId: "5",
    technicianName: "David Smith",
    reportTitle: "Access Control System Malfunction",
    issueDescription: "Electronic lock failing intermittently. Affected main entrance security.",
    repairSummary: "Replaced electronic lock mechanism, updated firmware to latest version, tested 50 lock/unlock cycles.",
    uploadedDate: "2024-05-10T12:00:00",
    maintenanceStatus: "pending-review",
    priority: "high",
    attachments: ["access_control_report.pdf"],
    images: ["lock_mechanism.jpg", "test_results.jpg"],
  },
  {
    id: "9",
    reportId: "RPT-2024-009",
    deviceName: "Water Treatment System - Facility",
    deviceType: "Plumbing",
    technicianId: "3",
    technicianName: "Mike Staff",
    reportTitle: "Water Quality Testing",
    issueDescription: "Quarterly water quality test. pH balance check and filter replacement.",
    repairSummary: "Tested water pH levels (normal range), replaced all filters, system producing quality water per standards.",
    uploadedDate: "2024-05-04T08:30:00",
    maintenanceStatus: "closed",
    priority: "low",
    reviewedBy: "2",
    reviewedDate: "2024-05-05T10:00:00",
    engineerRemarks: "All tests passed. System well-maintained.",
    attachments: ["water_quality_report.pdf"],
    images: ["filter_replacement.jpg", "test_results.jpg"],
  },
  {
    id: "10",
    reportId: "RPT-2024-010",
    deviceName: "CCTV Security System - All Cameras",
    deviceType: "Other",
    technicianId: "5",
    technicianName: "David Smith",
    reportTitle: "Security Camera System Check",
    issueDescription: "Security camera malfunction in Zone 3. Frame rate issues detected.",
    repairSummary: "Diagnosed network connectivity issue, reconfigured network settings, replaced damaged cable in Zone 3, all cameras now operational.",
    uploadedDate: "2024-05-03T14:15:00",
    maintenanceStatus: "approved",
    priority: "high",
    reviewedBy: "2",
    reviewedDate: "2024-05-04T09:00:00",
    engineerRemarks: "Network diagnosis was thorough. System back to full operation.",
    attachments: ["security_report.pdf"],
    images: ["zone3_camera.jpg"],
  },
];
