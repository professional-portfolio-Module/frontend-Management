import apiClient from "./api";
import { User, mockUsers, mockEngineers, mockStaff } from "../mock/users";

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userService = {
  // Get all users
  async getUsers(role?: string): Promise<User[]> {
    await simulateDelay(300);
    if (role === "engineer") {
      return mockEngineers;
    }
    if (role === "staff") {
      return mockStaff;
    }
    return mockUsers;
  },

  // Get user by ID
  async getUser(id: string): Promise<User> {
    await simulateDelay(200);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    return user;
  },

  // Get pending users (for verification)
  async getPendingUsers(): Promise<User[]> {
    await simulateDelay(300);
    return mockUsers.filter((u) => u.status === "pending");
  },

  // Verify user account
  async verifyUser(userId: string): Promise<User> {
    await simulateDelay(400);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.status = "active";
    return user;
  },

  // Reject user account
  async rejectUser(userId: string): Promise<void> {
    await simulateDelay(300);
    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error("User not found");
    mockUsers.splice(index, 1);
  },

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await simulateDelay(400);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    Object.assign(user, data);
    return user;
  },

  // Update profile
  async updateProfile(id: string, name: string, phone: string, profilePhoto?: string): Promise<User> {
    await simulateDelay(400);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    user.name = name;
    user.phone = phone;
    if (profilePhoto) {
      user.profilePhoto = profilePhoto;
    }
    return user;
  },

  // Change password
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await simulateDelay(500);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    if (user.password !== oldPassword) {
      throw new Error("Old password is incorrect");
    }
    user.password = newPassword;
  },

  // Register new manager (only existing managers can do this)
  async registerManager(data: Omit<User, "id" | "createdAt" | "status">): Promise<User> {
    await simulateDelay(400);
    const newManager: User = {
      ...data,
      id: `${Date.now()}`,
      role: "manager",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newManager);
    return newManager;
  },

  // Create user (admin/manager)
  async createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
    await simulateDelay(400);
    const newUser: User = {
      ...data,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await simulateDelay(300);
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    mockUsers.splice(index, 1);
  },
};
