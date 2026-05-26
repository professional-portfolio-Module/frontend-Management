import apiClient from "./api";

export interface ManualTask {
  manual_task_id: string;
  hotel_id?: string | null;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  assigned_by?: string | null;
  assigned_by_name?: string | null;
  checked_by?: string | null;
  checked_by_name?: string | null;
  card_no?: string | null;
  asset_description?: string | null;
  status: 'pending' | 'in-progress' | 'under_review' | 'completed' | 'rejected' | 'expired';
  priority: 'normal' | 'emergency';
  attachment_url?: string | null;
  created_at?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  tech_remarks?: string | null;
  eng_remarks?: string | null;
}

export interface GetManualTasksParams {
  hotel_id?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  card_no?: string;
  search?: string;
}

export const manualTaskService = {
  async getManualTasks(params?: GetManualTasksParams): Promise<ManualTask[]> {
    const response = await apiClient.get("/Main/router-backend/api/manual-tasks", { params });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  },

  async createManualTask(data: Partial<ManualTask>): Promise<ManualTask> {
    const response = await apiClient.post("/Main/router-backend/api/manual-tasks", data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to create manual task");
  },

  async updateManualTask(id: string, data: Partial<ManualTask>): Promise<ManualTask> {
    const response = await apiClient.put(`/Main/router-backend/api/manual-tasks/${id}`, data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to update manual task");
  },

  async deleteManualTask(id: string): Promise<void> {
    const response = await apiClient.delete(`/Main/router-backend/api/manual-tasks/${id}`);
    if (!response.data || (!response.data.success && response.data.success !== undefined)) {
      throw new Error(response.data?.message || "Failed to delete manual task");
    }
  }
};
