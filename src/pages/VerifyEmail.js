import React, { useEffect, useState } from 'react';
import { useLocation} from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';


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
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card
          className="shadow-lg text-center p-5"
          style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: '#f8f9fa', // light gray card
            borderRadius: '10px',
          }}
        >
          {status === 'loading' && (
            <h3 className="fw-bold fs-3">Verifying your email...</h3>
          )}
          {status === 'success' && (
            <div className="text-success">
              <h2 className="fw-bold mb-3 fs-2">Email Verified!</h2>
              <p className="fs-5">Your email has been successfully verified.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="text-danger">
              <h2 className="fw-bold mb-3 fs-2">Error</h2>
              <p className="fs-5">{errorMessage}</p>
            </div>
          )}
        </Card>
    </Container>
  );
};

  
  

export default VerifyEmail;
