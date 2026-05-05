import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard — redirects unauthenticated users to /login.
 * Preserves the intended destination so they return after login.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Save where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
