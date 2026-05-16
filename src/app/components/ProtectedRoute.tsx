import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
