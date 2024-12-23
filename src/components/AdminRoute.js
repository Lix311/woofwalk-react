import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AdminRoute = ({ children }) => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState) {
      setLoading(false); // Once the authState is available, stop the loading
    }
  }, [authState]);

  // Show a loading spinner while authState is being fetched
  if (loading) {
    return <div>Loading...</div>; // Or use a spinner component
  }

  // If not authenticated or not an admin, redirect to homepage
  if (!authState?.token || authState?.user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If the user is an authenticated admin, render the children
  return children;
};

export default AdminRoute;
