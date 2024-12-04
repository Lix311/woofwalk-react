import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap'; // Using React Bootstrap for consistency
import { useModal } from '../context/ModalContext'; // Access modal functions
import './ResetPassword.css'; // Add page-specific styles

const BASE_URL="https://woofwalk-backend-a64f983b3231.herokuapp.com"

function ResetPassword() {
  const { toggleLoginModal } = useModal(); // Access login modal function
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password. Please try again.');
      }

      setSuccessMessage('Password reset successful! Redirecting to login...');
      setError('');

      // Trigger the login modal
      setTimeout(() => {
        toggleLoginModal();
      }, 3000); // Wait for 3 seconds to show success message
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="reset-password-page">
      <h2 className="text-center">Reset Your Password</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="password" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword" className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Reset Password
        </Button>
      </Form>
    </Container>
  );
}

export default ResetPassword;
