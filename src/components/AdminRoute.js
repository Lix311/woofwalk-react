import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const AdminRoute = ({ children }) => {
  const { authState } = useAuth();

  useEffect(() => {
    // Side effect: If the user is not authenticated or not an admin, redirect to homepage
    if (!authState.token || authState.user?.role !== 'admin') {
      // You can perform additional actions here if necessary
    }
  }, [authState]); // Dependency on authState to trigger effect when it changes

  // If the user is not authenticated or not an admin, redirect to a fallback page
  if (!authState.token || authState.user?.role !== 'admin') {
    return <Navigate to="/" replace />; // Redirect non-admin users to the homepage
  }

  return children; // Render children if the user is authenticated and an admin
};

export default AdminRoute;
