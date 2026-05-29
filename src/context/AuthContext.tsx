import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, LoginCredentials } from "../services/authService";
import { AuthUser } from "../services/userService";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      if (storedUser.role === "technician") {
        authService.clearAuthData();
        setUser(null);
      } else {
        setUser(storedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // DO NOT use setIsLoading here. It causes RoleBasedRedirect to unmount LoginPage
    // and destroys local component state (like error messages)
    const authUser = await authService.login(credentials);
    if (authUser.role === "technician") {
      throw new Error("Access Denied: Technicians must login via the mobile application.");
    }
    authService.setAuthData(authUser);
    setUser(authUser);
    return authUser;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (name: string, phone: string) => {
    if (user) {
      const updatedUser = { ...user, name, phone };
      setUser(updatedUser);
      authService.setAuthData(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
