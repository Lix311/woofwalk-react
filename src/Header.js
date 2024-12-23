import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useModal } from './context/ModalContext';  // Import useModal from your context
import './Header.css'; // Import the CSS file

const Header = () => {
  const { toggleLoginModal, toggleSignupModal } = useModal();  // Use useModal to get modal functions
  const { authState, logout } = useAuth(); // Destructure authState from useAuth

  const { token, user } = authState; // Destructure token and user from authState


  return (
    <Navbar sticky="top" expand="lg" style={{ backgroundColor: '#add8e6' }}>
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/">
          <img
            src="/images/pitbull-logo.jpeg"
            alt="Logo"
            width="60"
            height="60"
            className="d-inline-block align-text-center"
          />
          WoofWalk
        </Navbar.Brand>

        {/* Toggle Button */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navbar Collapse */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            {/* Conditionally render the Admin link based on user role */}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
            )}

            <Nav.Link as={Link} to="/info">My Info</Nav.Link>
            <Nav.Link as={Link} to="/pets">My Pets</Nav.Link>
            <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
            
            <Nav.Link as={Link} to="/schedule">
              {user?.role === 'admin' ? 'Admin Scheduling' : 'Scheduling'}
            </Nav.Link>
          </Nav>

          {/* Welcome Message or Login/Signup Buttons */}
          {token ? (
            <>
              <span className="navbar-text me-3">Welcome, {user?.firstName || 'User'}</span>
              <Button variant="primary" onClick={logout} className="me-2">Logout</Button>
            </>
          ) : (
            <div className="d-flex">
              <Button variant="primary" onClick={toggleLoginModal} className="me-2">Login</Button>
              <Button variant="outline-primary" onClick={toggleSignupModal}>Signup</Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
