export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "manager" | "engineer" | "staff";
  phone?: string;
  profilePhoto?: string;
  department?: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

export interface AuthUser extends Omit<User, "password"> {
  token: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "manager@browns.com",
    password: "123456",
    name: "John Manager",
    role: "manager",
    phone: "+1-800-123-4567",
    department: "Management",
    status: "active",
    createdAt: "2024-01-15",
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "2",
    email: "engineer@browns.com",
    password: "123456",
    name: "Sarah Engineer",
    role: "engineer",
    phone: "+1-800-234-5678",
    department: "Engineering",
    status: "active",
    createdAt: "2024-02-10",
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: "3",
    email: "staff@browns.com",
    password: "123456",
    name: "Mike Staff",
    role: "staff",
    phone: "+1-800-345-6789",
    department: "Operations",
    status: "active",
    createdAt: "2024-03-05",
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
  {
    id: "4",
    email: "engineer2@browns.com",
    password: "123456",
    name: "Emma Johnson",
    role: "engineer",
    phone: "+1-800-456-7890",
    department: "Engineering",
    status: "active",
    createdAt: "2024-01-20",
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
  {
    id: "5",
    email: "staff2@browns.com",
    password: "123456",
    name: "David Smith",
    role: "staff",
    phone: "+1-800-567-8901",
    department: "Operations",
    status: "pending",
    createdAt: "2024-04-01",
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
];

export const mockManagers = mockUsers.filter((u) => u.role === "manager");
export const mockEngineers = mockUsers.filter((u) => u.role === "engineer");
export const mockStaff = mockUsers.filter((u) => u.role === "staff");
