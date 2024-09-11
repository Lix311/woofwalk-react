import React, { useState, useEffect, useCallback } from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { usePet } from '../context/PetContext';
import { useModal } from '../context/ModalContext';
import "./Pets.css";

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const { toggleAddPetModal } = useModal();
  const { registerHandlePetAdded, registerHandlePetDeleted, deletePet } = usePet();

  const fetchPets = useCallback(async () => {
    if (!authState || !authState.user || !authState.user.id) return;

    try {
      const ownerId = authState.user.id;
      const response = await fetch(`http://localhost:5000/api/dogs/owner/${ownerId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPets(data);
      if (data.length > 0) {
        setSelectedPet(data[0]); // Automatically select the first pet
      }
    } catch (err) {
      setError('Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  }, [authState]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleDeletePet = (petId) => {
    deletePet(petId, authState.token);
  };

  useEffect(() => {
    registerHandlePetAdded((newPet) => {
      setPets((prevPets) => [...prevPets, newPet]);
    });

    registerHandlePetDeleted((deletedPetId) => {
      setPets((prevPets) => prevPets.filter(pet => pet._id !== deletedPetId));
    });
  }, [registerHandlePetAdded, registerHandlePetDeleted]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="mt-4">
     <Row className="align-items-center mb-4">
  <Col>
    <div className="d-flex align-items-center">
      <h1 className="mb-0 mr-3">My Pets</h1>
      <Button 
        variant="primary" 
        onClick={toggleAddPetModal}
        style={{ marginLeft: '20px' }} // Adjust the margin as needed
        className="ml-8 add-pet-button" // Adjusted the margin-left here to "ml-2" for a small space
      >
        Add Pet
      </Button>
      <p className="click-note">Click on a pet to switch details.</p>
    </div>
  </Col>
  
</Row>

      <Row>
        {/* Left side: Pet cards */}
        <Col md={4}>
          {pets.map((pet) => (
            <Card
            key={pet._id}
            className="mb-4 pet-card"
            onClick={() => setSelectedPet(pet)}
            style={{ cursor: 'pointer', maxWidth: '300px', width: '100%' }}
          >
            <Card.Img variant="top" src={pet.image || '/images/default.jpg'} alt={pet.name} style={{ height: '150px', objectFit: 'cover' }} />
            <Card.Body className="text-center">
              <Card.Title>{pet.name}</Card.Title>
              <Card.Text>
                Breed: {pet.breed} <br />
                Age: {pet.age} years
              </Card.Text>
              <Button
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents card click event from firing
                  handleDeletePet(pet._id);
                }}
              >
                Delete Pet
              </Button>
            </Card.Body>
          </Card>
          
          ))}
        </Col>

        {/* Right side: Detailed pet info */}
        <Col md={8}>
          {selectedPet ? (
            <div className="pet-details-box">
              <h2>{selectedPet.name}</h2>
              <p>Breed: {selectedPet.breed}</p>
              <p>Age: {selectedPet.age} years</p>
              <p>Gender: {selectedPet.gender}</p>
              <p>Size: {selectedPet.size}</p>
              <p>Weight: {selectedPet.weight} lbs</p>
              <p>Medical Conditions: {selectedPet.medicalConditions || 'None'}</p>
              <p>Vaccination Status: {selectedPet.vaccinationStatus || 'Up to date'}</p>
              <p>Vet Info: {selectedPet.vetInfo || 'Not provided'}</p>
              <p>Temperament: {selectedPet.temperament || 'Unknown'}</p>
              <p>Socialization: {selectedPet.socialization || 'Unknown'}</p>
              <p>Walk Preferences:</p>
              {selectedPet.walkPreferences ? (
                <ul>
                  <li>Preferred Times: {selectedPet.walkPreferences.preferredTimes}</li>
                  <li>Preferred Routes: {selectedPet.walkPreferences.preferredRoutes}</li>
                  <li>Pace: {selectedPet.walkPreferences.pace}</li>
                </ul>
              ) : (
                <p>No preferences</p>
              )}
            </div>
          ) : (
            <div className="pet-details-box empty-details">
              <p>Select a pet to see more details</p>
            </div>
          )}
         
        </Col>
      </Row>
    </Container>
  );
};

export default Pets;
