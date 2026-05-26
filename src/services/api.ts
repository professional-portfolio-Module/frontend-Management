import axios from "axios";

// API Base URL - Configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bffserviceprod-production.up.railway.app/BFF/api/proxy";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token from localStorage
apiClient.interceptors.request.use((config) => {
  // Do not attach token for login or forgot password requests
  if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/forgot-password') || config.url.includes('/auth/sign-up') || config.url.includes('/auth/reset-forgotten-password'))) {
    // Explicitly remove it in case it was set in defaults
    if (config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = localStorage.getItem("authToken");
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // Fallback for older localStorage format
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token && user.token !== "cookie") {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        }
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
