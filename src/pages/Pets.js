import React, { useState, useEffect, useCallback } from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { usePet } from '../context/PetContext';
import { useModal } from '../context/ModalContext';
import "./Pets.css";

const Pets = () => {
  const [pets, setPets] = useState([]);
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
      <h1 className="mb-4">My Pets</h1>
      <Button variant="primary" onClick={toggleAddPetModal} className="mb-4">
        Add Pet
      </Button>
      <Row>
        {pets.map((pet) => (
          <Col key={pet._id} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={pet.image || '/images/default.jpg'} alt={pet.name} />
              <Card.Body>
                <Card.Title>{pet.name}</Card.Title>
                <Card.Text>
                  Breed: {pet.breed} <br />
                  Age: {pet.age} years
                </Card.Text>
                <Button 
                  variant="danger" 
                  onClick={() => handleDeletePet(pet._id)}
                >
                  Delete Pet
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Pets;
