import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useModal } from './context/ModalContext';
import './Signup.css'; // Optional custom styles

function SignUp() {
  const { showSignupModal, toggleSignupModal } = useModal();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role: 'owner', // or any other role as needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const data = await response.json();
      
      // Handle successful signup
      console.log('Sign up successful:', data);
      toggleSignupModal(); // Close the modal
    } catch (err) {
      // Handle error
      console.error('Sign up failed:', err);
      setError(err.message);
    }
  };

  return (
    <Modal
      show={showSignupModal}
      onHide={toggleSignupModal}
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

          {error && <p className="text-danger">{error}</p>} {/* Display error */}

          <Button variant="primary" type="submit" className="w-100 mb-2 btn-lg rounded-3">
            Sign Up
          </Button>

          <small className="text-body-secondary">Already have an account? </small>
          <a className="text-black" href="/login">Log In Here</a>

          <hr className="my-4" />

          <h2 className="fs-5 fw-bold mb-3">Or use a third-party</h2>

          <Button variant="outline-secondary" className="w-100 py-2 mb-2 rounded-3">
            <i className="bi bi-twitter me-1"></i> Sign up with Twitter
          </Button>
          <Button variant="outline-primary" className="w-100 py-2 mb-2 rounded-3">
            <i className="bi bi-facebook me-1"></i> Sign up with Facebook
          </Button>
          <Button variant="outline-secondary" className="w-100 py-2 mb-2 rounded-3">
            <i className="bi bi-github me-1"></i> Sign up with GitHub
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default SignUp;
