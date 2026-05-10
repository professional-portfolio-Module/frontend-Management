import { mockUsers } from "../mock/users";
import { AuthUser } from "../mock/users";

// Simulate API delay
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  // Login with mock authentication
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await simulateDelay(500);
    
    const user = mockUsers.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Generate mock token
    const token = `token_${user.id}_${Date.now()}`;
    
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      department: user.department,
      status: user.status,
      createdAt: user.createdAt,
      token,
    };

    // In production, this would be an API call:
    // const response = await apiClient.post<AuthUser>("/auth/login", credentials);
    // return response.data;

    return authUser;
  },

  // Logout
  async logout(): Promise<void> {
    // In production:
    // await apiClient.post("/auth/logout");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  // Verify token (for protected routes)
  async verifyToken(_token: string): Promise<AuthUser> {
    await simulateDelay(300);
    
    // Mock verification - in production:
    // const response = await apiClient.get<AuthUser>("/auth/verify", {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    const user = localStorage.getItem("user");
    if (!user) {
      throw new Error("Token invalid");
    }
    return JSON.parse(user);
  },

  // Get current user
  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Set auth data (called after successful login)
  setAuthData(user: AuthUser): void {
    localStorage.setItem("authToken", user.token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear auth data
  clearAuthData(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};
