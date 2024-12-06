import React, { useState } from 'react';
import { Modal, Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useModal } from './context/ModalContext';
import './Signup.css';

const BASE_URL="http://localhost:5000"

function SignUp() {
  const { toggleLoginModal, showSignupModal, toggleSignupModal } = useModal();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false); // State for toast visibility
  const [toastMessage, setToastMessage] = useState(''); // Toast message content

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    toggleSignupModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
          role: 'owner',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const data = await response.json();
      console.log('Sign up successful:', data);

      // Show success toast
      setToastMessage('Sign up successful! Please check your email for validation.');
      setShowToast(true);

      resetForm(); // Reset form on successful signup
      handleClose(); // Close modal
    } catch (err) {
      console.error('Sign up failed:', err);
      setError(err.message);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={5000}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white fw-bold">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal
        show={showSignupModal}
        onHide={handleClose}
        aria-labelledby="modalSignup"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-2 text-black">Sign Up Here.</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-black">First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-black">Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Form.Group>

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

            <Form.Group className="mb-3">
              <Form.Label className="text-black">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-black">Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="123-456-7890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <Button variant="primary" type="submit" className="w-100 mb-2 btn-lg rounded-3">
              Sign Up
            </Button>

            <small className="text-body-secondary">Already have an account? </small>
            <Button variant="link" onClick={toggleLoginModal}>Log In Here</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SignUp;
