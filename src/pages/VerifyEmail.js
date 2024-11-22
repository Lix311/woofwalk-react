import React, { useEffect, useState } from 'react';
import { useLocation} from 'react-router-dom';

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  // const navigate = useNavigate();

  useEffect(() => {
    // Log location.search to debug query params
    console.log('Location search:', location.search);

    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    const messageParam = queryParams.get('message');

    if (statusParam === 'success') {
      setStatus('success');
    } else if (statusParam === 'error') {
      setStatus('error');
      setErrorMessage(messageParam || 'Error verifying email');
    } else {
      setStatus('loading');
    }
  }, [location.search]);

  // Debugging state to check what is being set
  console.log('Status:', status);
  console.log('Error Message:', errorMessage);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'loading' && <h3>Verifying your email...</h3>}
        {status === 'success' && (
          <div style={styles.success}>
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified.</p>
          </div>
        )}
        {status === 'error' && (
          <div style={styles.error}>
            <h2>Error</h2>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple inline styles for the card and container
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    textAlign: 'center',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
};

export default VerifyEmail;
