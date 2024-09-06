// Dashboard.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <Container className="mt-4">
      <h1>Dashboard</h1>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Profile</Card.Title>
              <Card.Text>
                View and update your profile information.
              </Card.Text>
              <Button variant="primary" as={Link} to="/profile">Go to Profile</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>My Pets</Card.Title>
              <Card.Text>
                Manage your pets and view their details.
              </Card.Text>
              <Button variant="primary" as={Link} to="/pets">View Pets</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Schedule</Card.Title>
              <Card.Text>
                Manage your appointments and schedule events.
              </Card.Text>
              <Button variant="primary" as={Link} to="/schedule">View Schedule</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
