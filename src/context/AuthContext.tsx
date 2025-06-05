
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";

// Define the types for our user roles
export enum UserRole {
  ADMIN = 'admin',
  DATA_ENTRY = 'data_entry',
  VIEWER = 'viewer',
}

// Define the user type
export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

// Define the auth context state
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial mock users for demo purposes
const initialMockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: UserRole.ADMIN,
    name: 'Admin User',
    status: 'active',
    lastLogin: '2025-05-06',
  },
  {
    id: '2',
    username: 'entry',
    password: 'entry123',
    role: UserRole.DATA_ENTRY,
    name: 'Data Entry Staff',
    status: 'active',
    lastLogin: '2025-05-05',
  },
  {
    id: '3',
    username: 'viewer',
    password: 'viewer123',
    role: UserRole.VIEWER,
    name: 'View Only Staff',
    status: 'active',
    lastLogin: '2025-05-01',
  },
];

// Helper function to generate a secure password
export const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize mock users in localStorage if not exists
  useEffect(() => {
    const storedUsers = localStorage.getItem('mockUsers');
    if (!storedUsers) {
      localStorage.setItem('mockUsers', JSON.stringify(initialMockUsers));
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current users from localStorage (includes newly created users)
      const storedUsers = localStorage.getItem('mockUsers');
      const mockUsers = storedUsers ? JSON.parse(storedUsers) : initialMockUsers;
      
      const foundUser = mockUsers.find(
        (u: any) => u.username === username && u.password === password && u.status === 'active'
      );
      
      if (foundUser) {
        // Remove password from stored user
        const { password, status, lastLogin, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        // Update last login for the user
        const updatedUsers = mockUsers.map((u: any) => 
          u.id === foundUser.id ? { ...u, lastLogin: new Date().toISOString().split('T')[0] } : u
        );
        localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
        
        toast.success(`Welcome back, ${userWithoutPassword.name}`);
      } else {
        toast.error('Invalid username or password, or account is inactive');
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
