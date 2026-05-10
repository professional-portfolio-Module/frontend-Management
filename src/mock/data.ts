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
