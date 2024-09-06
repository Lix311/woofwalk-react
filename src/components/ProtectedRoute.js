import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();
  const { toggleLoginModal } = useModal();

  useEffect(() => {
    if (!authState.token) {
      toggleLoginModal(); // Open the login modal
    }
  }, [authState.token, toggleLoginModal]);

  // If the user is authenticated, render the children components
  // Otherwise, redirect to the homepage with a validation message
  return authState.token ? (
    children
  ) : (
    <Navigate
      to="/"
      state={{ message: 'Please log in to access this page.' }}
      replace
    />
  );
};

export default ProtectedRoute;
