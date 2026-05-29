import apiClient from "./api";
import { AuthUser } from "./userService";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  // Login using real API via BFF
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // 1. Authenticate and get basic info + tokens (in hybrid mode)
      const response = await apiClient.post("/AuthForward/auth/login", {
        usernameOrEmail: credentials.email,
        password: credentials.password
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      // In hybrid mode, authData is inside data.authData or data directly
      const responseData = response.data.data || {};
      const authData = responseData.authData || responseData;
      
      if (!authData || !authData.user_name) {
        throw new Error("Invalid response from server");
      }

      const accessToken = authData.access_token;
      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
        // Temporarily set the token in the API client for the next call
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }

      // 2. Fetch user profile to get the role using the email (user_name)
      const userProfileRes = await apiClient.get(`/AuthForward/auth/api/email/${authData.user_name}`);
      
      if (!userProfileRes.data.success) {
        throw new Error("Failed to load user profile");
      }

      const userData = userProfileRes.data.data;

      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        // The backend role might be "ADMIN", frontend expects lowercase "admin". Fallback to "staff" if null.
        role: userData.role ? userData.role.toLowerCase() : "staff",
        phone: userData.mobileNumber || "",
        hotelId: userData.hotelId || "",
        profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        department: "Maintenance",
        status: "active", // mapping accountStatus if needed
        createdAt: new Date().toISOString(),
        token: accessToken || "cookie", 
      };

      return authUser;
    } catch (error: any) {
      console.error("Login API Error:", error);
      console.error("Error Response Data:", error.response?.data);
      
      let message = "Invalid credentials";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          try {
            const parsed = JSON.parse(error.response.data);
            message = parsed.message || message;
          } catch (e) {
            // ignore
          }
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      if (message.toLowerCase().includes("credential") || message.toLowerCase().includes("invalid")) {
        message = "Invalid credentials";
      }
      throw new Error(message);
    }
  },

  // Logout via API
  async logout(): Promise<void> {
    try {
      await apiClient.post("/AuthForward/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("user");
    }
  },

  // Verify token (for protected routes)
  async verifyToken(_token: string): Promise<AuthUser> {
    // In cookie-based auth, we can just fetch the current user profile or rely on stored state
    // For now, we trust the local storage user if cookies are present
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
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear auth data
  clearAuthData(): void {
    localStorage.removeItem("user");
  },

  // Forgot password - Request OTP
  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await apiClient.post("/AuthForward/auth/forgot-password", {
        usernameOrEmail: email
      });
      return response.data.message || "OTP sent successfully";
    } catch (error: any) {
      let message = "Failed to send OTP";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          try { message = JSON.parse(error.response.data).message || message; } catch (e) {}
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      throw new Error(message);
    }
  },

  // Reset password using OTP
  async resetPassword(email: string, otp: string, newPassword: string): Promise<string> {
    try {
      const response = await apiClient.post("/AuthForward/auth/reset-forgotten-password", {
        usernameOrEmail: email,
        otp: otp,
        newPassword: newPassword,
        confirmPassword: newPassword
      });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to reset password");
      }
      return response.data.message || "Password reset successful";
    } catch (error: any) {
      let message = error.message || "Failed to reset password";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          try { message = JSON.parse(error.response.data).message || message; } catch (e) {}
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      throw new Error(message);
    }
  }
};
