import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'system_admin' | 'admin' | 'staff' | 'public';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSystemAdmin: boolean;
  isStaff: boolean;
  isPublic: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration - 3 ROLES
const MOCK_USERS: Record<string, User> = {
  'sysadmin@puertoprincesampa.gov': {
    id: '0',
    email: 'sysadmin@puertoprincesampa.gov',
    name: 'System Administrator',
    role: 'system_admin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
  },
  'admin@puertoprincesampa.gov': {
    id: '1',
    email: 'admin@puertoprincesampa.gov',
    name: 'Dr. Maria Santos',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  },
  'staff@puertoprincesampa.gov': {
    id: '2',
    email: 'staff@puertoprincesampa.gov',
    name: 'Carlos Rivera',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  'public@example.com': {
    id: '3',
    email: 'public@example.com',
    name: 'Maria Clara',
    role: 'public',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mpa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication - in production, this would call a real API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Check if user exists in mock data
          const authenticatedUser = MOCK_USERS[email] || {
            ...MOCK_USERS['public@example.com'],
            id: `guest-${Date.now()}`,
            email,
            name: email.split('@')[0] || 'Guest User',
          };
          setUser(authenticatedUser);
          localStorage.setItem('mpa_user', JSON.stringify(authenticatedUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mpa_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('mpa_user', JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;

    // Role hierarchy: admin > staff > public
    const roleHierarchy: Record<UserRole, number> = {
      'system_admin': 4,
      'admin': 3,
      'staff': 2,
      'public': 1,
    };

    // Check if user's role level is >= required role level
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSystemAdmin: user?.role === 'system_admin',
        isStaff: user?.role === 'staff',
        isPublic: user?.role === 'public',
        login,
        logout,
        updateProfile,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}