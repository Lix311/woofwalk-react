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
    size: '',
    weight: '',
    gender: '',
    medicalConditions: '',
    vaccinations: '',
    vetContact: {
      name: '',
      phone: '',
      address: ''
    },
    temperament: '',
    socialization: '',
    walkPreferences: {
      preferredTimes: '',
      preferredRoutes: '',
      pace: ''
    }
  });

  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPetData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleVetContactChange = (e) => {
    const { name, value } = e.target;
    setPetData((prevData) => ({
      ...prevData,
      vetContact: {
        ...prevData.vetContact,
        [name]: value
      }
    }));
  };

  const handleWalkPreferencesChange = (e) => {
    const { name, value } = e.target;
    setPetData((prevData) => ({
      ...prevData,
      walkPreferences: {
        ...prevData.walkPreferences,
        [name]: value
      }
    }));
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
          <Form.Group controlId="formPetSize">
            <Form.Label>Size</Form.Label>
            <Form.Control
              type="text"
              name="size"
              value={petData.size}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formPetWeight">
            <Form.Label>Weight</Form.Label>
            <Form.Control
              type="number"
              name="weight"
              value={petData.weight}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formPetGender">
            <Form.Label>Gender</Form.Label>
            <Form.Control
              type="text"
              name="gender"
              value={petData.gender}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formMedicalConditions">
            <Form.Label>Medical Conditions</Form.Label>
            <Form.Control
              type="text"
              name="medicalConditions"
              value={petData.medicalConditions}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formVaccinations">
            <Form.Label>Vaccinations</Form.Label>
            <Form.Control
              type="text"
              name="vaccinations"
              value={petData.vaccinations}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formVetName">
            <Form.Label>Vet Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={petData.vetContact.name}
              onChange={handleVetContactChange}
            />
          </Form.Group>
          <Form.Group controlId="formVetPhone">
            <Form.Label>Vet Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={petData.vetContact.phone}
              onChange={handleVetContactChange}
            />
          </Form.Group>
          <Form.Group controlId="formVetAddress">
            <Form.Label>Vet Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={petData.vetContact.address}
              onChange={handleVetContactChange}
            />
          </Form.Group>
          <Form.Group controlId="formTemperament">
            <Form.Label>Temperament</Form.Label>
            <Form.Control
              type="text"
              name="temperament"
              value={petData.temperament}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formSocialization">
            <Form.Label>Socialization</Form.Label>
            <Form.Control
              type="text"
              name="socialization"
              value={petData.socialization}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formWalkPreferencesTimes">
            <Form.Label>Preferred Walk Times</Form.Label>
            <Form.Control
              type="text"
              name="preferredTimes"
              value={petData.walkPreferences.preferredTimes}
              onChange={handleWalkPreferencesChange}
            />
          </Form.Group>
          <Form.Group controlId="formWalkPreferencesRoutes">
            <Form.Label>Preferred Walk Routes</Form.Label>
            <Form.Control
              type="text"
              name="preferredRoutes"
              value={petData.walkPreferences.preferredRoutes}
              onChange={handleWalkPreferencesChange}
            />
          </Form.Group>
          <Form.Group controlId="formWalkPreferencesPace">
            <Form.Label>Walk Pace</Form.Label>
            <Form.Control
              type="text"
              name="pace"
              value={petData.walkPreferences.pace}
              onChange={handleWalkPreferencesChange}
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
