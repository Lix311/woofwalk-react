import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useModal } from './context/ModalContext';
import { useAuth } from './context/AuthContext';
import { usePet } from './context/PetContext';

const AddPet = () => {
  const { showAddPetModal, toggleAddPetModal } = useModal();
  const { authState } = useAuth();
  const { handlePetAdded } = usePet();
  const [petData, setPetData] = useState({
    name: '',
    breed: '',
    age: '',
    medicalInfo: '',
  });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authState || !authState.user || !authState.user.id) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...petData,
          ownerId: authState.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add pet');
      }

      const newPet = await response.json();

      if (handlePetAdded) {
        handlePetAdded(newPet); // Notify Pets.js of the new pet
      }

      toggleAddPetModal(); // Close the modal after successful submission
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Modal show={showAddPetModal} onHide={toggleAddPetModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add a New Pet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formPetName">
            <Form.Label>Pet Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={petData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPetBreed">
            <Form.Label>Breed</Form.Label>
            <Form.Control
              type="text"
              name="breed"
              value={petData.breed}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPetAge">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={petData.age}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formMedicalInfo">
            <Form.Label>Medical Info</Form.Label>
            <Form.Control
              type="text"
              name="medicalInfo"
              value={petData.medicalInfo}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Add Pet
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPet;
