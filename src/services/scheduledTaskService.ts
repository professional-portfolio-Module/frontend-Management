import apiClient from "./api";

export interface AssignedTechnician {
  user_id: string;
  technician_name: string;
  technician_email: string;
}

export interface ScheduledTask {
  task_id: string;
  scheduled_id: string;
  asset_id?: string | null;
  done_by?: string | null;
  checked_by?: string | null;
  additional_details?: string | null;
  status: 'pending' | 'in-progress' | 'under_review' | 'completed' | 'rejected' | 'expired';
  priority: 'normal' | 'emergency';
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  technician_remarks?: string | null;
  engineer_remarks?: string | null;
  due_date?: string | null;
  schedule_title: string;
  asset_card_no: string;
  asset_description?: string | null;
  asset_location?: string | null;
  done_by_name?: string | null;
  checked_by_name?: string | null;
  assigned_technicians: AssignedTechnician[];
}

export const scheduledTaskService = {
  getScheduledTasks: async (hotelId: string, status?: string, priority?: string): Promise<ScheduledTask[]> => {
    const params: Record<string, string> = { hotel_id: hotelId };
    if (status) params.status = status;
    if (priority) params.priority = priority;

    const response = await apiClient.get("/scheduled-tasks", { params });
    return response.data.data;
  }
};

export default scheduledTaskService;
