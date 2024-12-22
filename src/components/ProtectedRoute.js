import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();
  const { toggleLoginModal } = useModal();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    if (!authState.token) {
      toggleLoginModal(); // Open the login modal
    }
  }, [authState.token, toggleLoginModal]);

  debugger 

  // If the user is not authenticated and not on the homepage, redirect to the homepage
  if (!authState.token && location.pathname !== '/') {
    return (
      <Navigate
        to="/"
        state={{ message: 'Please log in to access this page.' }}
        replace
      />
    );
  }

  // If the user is authenticated, render the children components
  return authState.token ? children : null;
};

export default ProtectedRoute;
