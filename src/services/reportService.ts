import apiClient from "./api";

export interface ReportItem {
  id: string;
  hotel_id: string;
  technician_id: string;
  technician_name: string;
  technician_email: string;
  report_text: string;
  is_critical: boolean;
  recipient_role: "engineer" | "manager";
  created_at: string;
}

export const reportService = {
  fetchReports: async (
    hotelId: string,
    params?: { is_critical?: boolean; recipient_role?: string; technician_id?: string }
  ): Promise<ReportItem[]> => {
    const response = await apiClient.get("/Main/router-backend/api/technician-reports", {
      params: { hotel_id: hotelId, ...params }
    });
    return response.data?.data || [];
  }
};

export default reportService;
