import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-3 border-top" style={{ backgroundColor: '#add8e6' }}>
      <Container>
        <Row className="d-flex flex-wrap justify-content-between align-items-center">
          <Col md={4} className="mb-0 text-secondary">
            <p>© 2024 WoofWalk, Inc</p>
          </Col>
          <Col md={4} className="d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto">
            <Link to="/" className="link-body-emphasis text-decoration-none">
              <img
                src="/images/pitbull-logo.jpeg"
                alt="Logo"
                width="60"
                height="60"
                className="d-inline-block align-text-center"
              />
            </Link>
          </Col>
          <Col md={4}>
            <Nav className="justify-content-end">
              <Nav.Item>
                <Nav.Link as={Link} to="#" className="px-2 text-secondary">
                  Contact
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="#" className="px-2 text-secondary">
                  Features
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/pricing" className="px-2 text-secondary">
                  Pricing
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="#" className="px-2 text-secondary">
                  FAQs
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="#" className="px-2 text-secondary">
                  About
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
