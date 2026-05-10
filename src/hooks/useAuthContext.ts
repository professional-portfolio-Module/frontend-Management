import { useAuth } from "../context/AuthContext";

export const useAuthContext = () => {
  return useAuth();
};

export const useRole = () => {
  const { user } = useAuth();
  return user?.role || null;
};

export const useUserId = () => {
  const { user } = useAuth();
  return user?.id || null;
};
