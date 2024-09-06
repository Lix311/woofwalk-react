import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // Adjust the import path as necessary

const MyInfo = () => {
  const { authState, updateUserInfo} = useAuth(); // Access authState from useAuth

  const [userInfo, setUserInfo] = useState({
    firstName: authState?.user?.firstName || '',
    lastName: authState?.user?.lastName || '',
    email: authState?.user?.email || ''
  });

  // Update userInfo when authState changes
  useEffect(() => {
    if (authState?.user) {
      setUserInfo({
        firstName: authState.user.firstName || '',
        lastName: authState.user.lastName || '',
        email: authState.user.email || ''
      });
    }
  }, [authState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserInfo(userInfo); // Update user info
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Info</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFirstName" className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={userInfo.firstName}
            placeholder="Enter your first name"
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="formLastName" className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={userInfo.lastName}
            placeholder="Enter your last name"
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={userInfo.email}
            placeholder="Enter your email"
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </Container>
  );
};

export default MyInfo;