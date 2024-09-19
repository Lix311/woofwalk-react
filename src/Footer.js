import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css'; // Assuming you have a separate CSS file

function Footer() {
  return (
    <footer className="py-3 border-top footer-bg">
      <Container>
        <Row className="d-flex justify-content-center align-items-center">
          <Col xs="auto" className="text-center">
            <Link to="/" className="link-body-emphasis text-decoration-none">
              <img
                src="/images/pitbull-logo.jpeg"
                alt="Logo"
                width="50"
                height="50"
                className="d-inline-block align-text-center mb-2"
              />
            </Link>
            <p className="mb-0 text-secondary">© 2024 WoofWalk, Inc</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
