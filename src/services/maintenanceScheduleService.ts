import apiClient from "./api";

export interface Assignment {
  assignment_id: string;
  user_id: string;
  scheduled_id: string;
  assigned_at: string;
  assigned_by?: string | null;
  technician_name?: string;
  technician_email?: string;
}

export interface MaintenanceSchedule {
  schedule_id: string;
  hotel_id: string;
  card_no: string;
  asset_id: string;
  month: string;
  week_no: number;
  start_date: string;
  end_date: string;
  title: string;
  default_description_manager?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  asset_description?: string;
  asset_location?: string;
  assignments: Assignment[];
}

export interface CreateScheduleData {
  hotel_id: string;
  card_no: string;
  month: string;
  week_no: number;
  start_date: string;
  end_date: string;
  title: string;
  default_description_manager?: string;
  assigned_technicians: string[];
  assigned_by: string;
}

export interface UpdateScheduleData {
  card_no?: string;
  month?: string;
  week_no?: number;
  start_date?: string;
  end_date?: string;
  title?: string;
  default_description_manager?: string | null;
  is_active?: boolean;
  assigned_technicians?: string[];
  assigned_by?: string;
}

export const maintenanceScheduleService = {
  async getMaintenanceSchedules(params: { hotel_id: string; month?: string; card_no?: string; page?: number; limit?: number }): Promise<{ items: MaintenanceSchedule[]; pagination: { totalItems: number; totalPages: number; currentPage: number; limit: number } }> {
    const response = await apiClient.get("/Main/router-backend/api/maintenance-schedules", { params });
    if (response.data && response.data.success) {
      const data = response.data.data;
      // Handle both paginated response { items, pagination } and legacy array response
      if (Array.isArray(data)) {
        return { items: data, pagination: { totalItems: data.length, totalPages: 1, currentPage: 1, limit: data.length } };
      }
      return data;
    }
    return { items: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 50 } };
  },

  async createMaintenanceSchedule(data: CreateScheduleData): Promise<MaintenanceSchedule> {
    const response = await apiClient.post("/Main/router-backend/api/maintenance-schedules", data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to create maintenance schedule");
  },

  async updateMaintenanceSchedule(id: string, data: UpdateScheduleData): Promise<MaintenanceSchedule> {
    const response = await apiClient.put(`/Main/router-backend/api/maintenance-schedules/${id}`, data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to update maintenance schedule");
  },

  async deleteMaintenanceSchedule(id: string): Promise<void> {
    const response = await apiClient.delete(`/Main/router-backend/api/maintenance-schedules/${id}`);
    if (!response.data || (!response.data.success && response.data.success !== undefined)) {
      throw new Error(response.data?.message || "Failed to delete maintenance schedule");
    }
  }
};
