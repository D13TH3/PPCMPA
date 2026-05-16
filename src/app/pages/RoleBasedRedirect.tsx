import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import PublicMapViewer from './PublicMapViewer';

export default function RoleBasedRedirect() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to their role-specific dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show public map viewer for non-authenticated users (guests)
  return <PublicMapViewer />;
}
