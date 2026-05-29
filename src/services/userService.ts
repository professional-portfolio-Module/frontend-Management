import apiClient from "./api";

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: "admin" | "super_admin" | "manager" | "engineer" | "staff" | "technician";
  phone?: string;
  hotelId?: string;
  hotelName?: string;
  profilePhoto?: string;
  department?: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

export interface AuthUser extends Omit<User, "password"> {
  token: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  hotelId: string;
}

export const userService = {
  // Get all users
  async getUsers(params?: { role?: string; hotel_id?: string }): Promise<User[]> {
    try {
      const response = await apiClient.get("/Main/router-backend/api/users", { params });
      if (response.data && response.data.success) {
        return response.data.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ? u.role.toLowerCase() as User['role'] : "staff",
          phone: u.mobileNumber || u.mobilenumber || "",
          department: u.role ? (u.role.toUpperCase() === "ADMIN" ? "Administration" : u.role.toUpperCase() === "MANAGER" ? "Management" : "Operations") : "Operations",
          status: u.is_active ? "active" : "inactive",
          createdAt: u.created_at || new Date().toISOString(),
          hotelId: u.hotels && u.hotels[0] ? u.hotels[0].id : u.hotelId || "",
          hotelName: u.hotels && u.hotels[0] ? u.hotels[0].name : u.hotelName || "",
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch users", error);
      return [];
    }
  },

  // Get user by ID
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get(`/Main/router-backend/api/users/${id}`);
    if (response.data && response.data.success) {
      const u = response.data.data;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role ? u.role.toLowerCase() as User['role'] : "staff",
        phone: u.mobilenumber || u.mobileNumber || "",
        department: u.role ? (u.role.toUpperCase() === "ADMIN" ? "Administration" : u.role.toUpperCase() === "MANAGER" ? "Management" : "Operations") : "Operations",
        status: u.is_active ? "active" : "inactive",
        createdAt: u.created_at || new Date().toISOString(),
        hotelId: u.hotels && u.hotels[0] ? u.hotels[0].id : u.hotelId || "",
        hotelName: u.hotels && u.hotels[0] ? u.hotels[0].name : u.hotelName || "",
      };
    }
    throw new Error("User not found");
  },

  // Get pending users (for verification)
  async getPendingUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get("/AuthForward/admin/api/users/pending");
      if (response.data && response.data.success) {
        return response.data.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role ? u.role.toLowerCase() : "",
          status: "pending",
          phone: u.mobileNumber,
          createdAt: u.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch pending users", error);
      return [];
    }
  },

  // Approve user account
  async verifyUser(userId: string): Promise<void> {
    try {
      const response = await apiClient.put(`/AuthForward/admin/api/users/${userId}/approve`);
      if (!response.data.success && response.data.success !== undefined) {
        throw new Error(response.data.message || "Failed to approve user");
      }
    } catch (error: any) {
      let message = "Failed to approve user";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          try { message = JSON.parse(error.response.data).message || message; } catch (e) { }
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      throw new Error(message);
    }
  },

  // Reject user account
  async rejectUser(userId: string): Promise<void> {
    // Delete the pending user from the database
    const response = await apiClient.delete(`/Main/router-backend/api/users/${userId}`);
    if (!response.data || (!response.data.success && response.data.success !== undefined)) {
      throw new Error(response.data?.message || "Failed to reject user registration");
    }
  },

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/Main/router-backend/api/users/${id}`, {
      name: data.name,
      phone: data.phone
    });
    if (response.data && response.data.success) {
      const u = response.data.data;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role ? u.role.toLowerCase() as User['role'] : "staff",
        phone: u.mobilenumber || u.mobileNumber || "",
        department: u.role ? (u.role.toUpperCase() === "ADMIN" ? "Administration" : u.role.toUpperCase() === "MANAGER" ? "Management" : "Operations") : "Operations",
        status: u.is_active ? "active" : "inactive",
        createdAt: u.created_at || new Date().toISOString(),
        hotelId: u.hotels && u.hotels[0] ? u.hotels[0].id : u.hotelId || "",
        hotelName: u.hotels && u.hotels[0] ? u.hotels[0].name : u.hotelName || "",
      };
    }
    throw new Error("Failed to update user");
  },

  // Update profile
  async updateProfile(id: string, name: string, phone: string, _profilePhoto?: string): Promise<User> {
    const response = await apiClient.put(`/Main/router-backend/api/users/${id}`, {
      name,
      phone
    });
    if (response.data && response.data.success) {
      const u = response.data.data;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role ? u.role.toLowerCase() as User['role'] : "staff",
        phone: u.mobilenumber || u.mobileNumber || "",
        department: u.role ? (u.role.toUpperCase() === "ADMIN" ? "Administration" : u.role.toUpperCase() === "MANAGER" ? "Management" : "Operations") : "Operations",
        status: u.is_active ? "active" : "inactive",
        createdAt: u.created_at || new Date().toISOString()
      };
    }
    throw new Error(response.data?.message || "Failed to update profile");
  },

  // Create real internal user via API
  async createInternalUser(data: CreateUserPayload): Promise<void> {
    try {
      const response = await apiClient.post("/AuthForward/admin/api/users/internal", data);
      if (!response.data.success && response.data.success !== undefined) {
        throw new Error(response.data.message || "Failed to create user");
      }
    } catch (error: any) {
      let message = "Failed to create user";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          try { message = JSON.parse(error.response.data).message || message; } catch (e) { }
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      throw new Error(message);
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const response = await apiClient.delete(`/Main/router-backend/api/users/${id}`);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to deactivate user");
    }
  },
};
