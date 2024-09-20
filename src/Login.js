import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useModal } from './context/ModalContext';
import { useAuth } from './context/AuthContext';
import './Login.css'; // Optional custom styles

function Login() {
  const { showLoginModal, toggleLoginModal } = useModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const BASE_URL="https://woofwalk-backend-a64f983b3231.herokuapp.com"


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
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      const { token, user } = data;
      login(token, user); // Pass only the token

      // Handle successful login
      console.log('Login successful:', token);
      toggleLoginModal(); // Close the modal
    } catch (err) {
      // Handle error
      console.error('Login failed:', err);
      setError(err.message);
    }
  };

  return (
    <Modal
      show={showLoginModal}
      onHide={toggleLoginModal}
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

          <small className="text-body-secondary">Already Have an Account? </small>
          <a className="text-black" href="/home">Sign In Here</a>

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

export default Login;
