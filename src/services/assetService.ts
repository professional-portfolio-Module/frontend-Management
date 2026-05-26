import apiClient from "./api";

export interface Asset {
  id: string;
  hotel_id?: string | null;
  card_no: string;
  category_id: string;
  category_name?: string;
  category_code?: string;
  description: string;
  location?: string | null;
  status: 'active' | 'under_maintainace' | 'breakdown' | 'retired' | 'inactive';
  installation_date?: string | null;
  warranty_expiery?: string | null;
  notes?: string | null;
  qr_code_url?: string | null;
}

export interface GetAssetsParams {
  search?: string;
  category_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  hotel_id?: string;
}

export interface GetAssetsResponse {
  items: Asset[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const assetService = {
  async getAssets(params?: GetAssetsParams): Promise<GetAssetsResponse> {
    const response = await apiClient.get("/Main/router-backend/api/equipment", { params });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return {
      items: [],
      pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 }
    };
  },

  async getAsset(id: string): Promise<Asset> {
    const response = await apiClient.get(`/Main/router-backend/api/equipment/${id}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch asset");
  },

  async createAsset(data: Omit<Asset, "id">): Promise<Asset> {
    const response = await apiClient.post("/Main/router-backend/api/equipment", data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to create asset");
  },

  async updateAsset(id: string, data: Partial<Omit<Asset, "id">>): Promise<Asset> {
    const response = await apiClient.put(`/Main/router-backend/api/equipment/${id}`, data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to update asset");
  },

  async getStatuses(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await apiClient.get("/Main/router-backend/api/equipment/statuses");
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error("Failed to fetch equipment statuses from API, falling back to static list", err);
    }
    return [
      { value: "active", label: "Active" },
      { value: "under_maintainace", label: "Under Maintenance" },
      { value: "breakdown", label: "Breakdown" },
      { value: "retired", label: "Retired" },
      { value: "inactive", label: "Inactive" }
    ];
  },

  async deleteAsset(id: string): Promise<void> {
    const response = await apiClient.delete(`/Main/router-backend/api/equipment/${id}`);
    if (!response.data || (!response.data.success && response.data.success !== undefined)) {
      throw new Error(response.data?.message || "Failed to delete asset");
    }
  }
};

