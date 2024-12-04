import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useModal } from './context/ModalContext';
import { useAuth } from './context/AuthContext';
import './Login.css'; // Optional custom styles

const BASE_URL="https://woofwalk-backend-a64f983b3231.herokuapp.com"

function Login() {
  const { showLoginModal, toggleLoginModal, setResetCallback } = useModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // Function to reset form fields and error
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setResetMessage('');
  };

  // Register reset function with the ModalContext
  useEffect(() => {
    setResetCallback('login', resetForm);
    return () => setResetCallback('login', null); // Cleanup on unmount
  }, [setResetCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Please verify your email before logging in.');
        }
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      const { token, user } = data;
      login(token, user);

      // Close the modal and reset form after successful login
      toggleLoginModal();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error sending password reset email. Please try again.');
      }

      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setResetMessage(err.message);
    }
  };

  return (
    <Modal
      show={showLoginModal}
      onHide={() => {
        toggleLoginModal();
        resetForm(); // Ensure form is cleared when the modal is closed
      }}
      aria-labelledby="modalSignin"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-2 text-black">Login here.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-black">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-black">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {error && <p className="text-danger">{error}</p>} {/* Display error */}

          <Button variant="primary" type="submit" className="w-100 mb-2 btn-lg rounded-3">
            Login
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Button
              variant="link"
              className="p-0 text-decoration-underline"
              onClick={handlePasswordReset}
              disabled={!email} // Disable if email is not entered
            >
              Forgot your password?
            </Button>
          </div>

          {resetMessage && <p className="text-success mt-2">{resetMessage}</p>} {/* Display reset success */}
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default Login;
