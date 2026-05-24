import apiClient from "./api";

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get("/Main/router-backend/api/categories");
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  },

  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get(`/Main/router-backend/api/categories/${id}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch category");
  },

  async createCategory(data: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const response = await apiClient.post("/Main/router-backend/api/categories", data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to create category");
  },

  async updateCategory(id: string, data: Partial<Omit<Category, "id" | "createdAt" | "code">>): Promise<Category> {
    const response = await apiClient.put(`/Main/router-backend/api/categories/${id}`, data);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to update category");
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await apiClient.delete(`/Main/router-backend/api/categories/${id}`);
    if (!response.data || (!response.data.success && response.data.success !== undefined)) {
      throw new Error(response.data?.message || "Failed to delete category");
    }
  }
};
