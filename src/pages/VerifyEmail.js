import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    const messageParam = queryParams.get('message');

    const toastState = {
      show: true,
      variant: statusParam === 'success' ? 'success' : 'danger',
      message: statusParam === 'success' 
        ? 'Email verified successfully!' 
        : messageParam || 'Error verifying email',
    };

    navigate('/', { state: { toast: toastState } }); // Redirect to homepage
  }, [location.search, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h3>Processing your email verification...</h3>
    </div>
  );
};

export default VerifyEmail;