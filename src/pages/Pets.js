import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { authState } = useAuth();
  const { toggleAddPetModal } = useModal();
  const { registerHandlePetAdded, registerHandlePetDeleted, deletePet, updatePetImage } = usePet();
  const fileInputRef = useRef(null);

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
        setSelectedPet(data[0]);
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

  const handleFileChange = async (e, petId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updatePetImage(petId, data.imageUrl, authState.token);
      } else {
        setUploadError('Error uploading image');
      }
    } catch (error) {
      setUploadError('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (petId) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
              className="btn-add-pet"
            >
              Add Pet
            </Button>
            <p className="ml-3 click-note text-muted">Click on a pet to switch details.</p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          {pets.map((pet) => (
            <Card
              key={pet._id}
              className="mb-4 pet-card"
              onClick={() => setSelectedPet(pet)}
              style={{ cursor: 'pointer' }}
            >
              <div className="mt-4 card-img-container" onClick={() => handleImageClick(pet._id)}>
                <Card.Img variant="top" src={pet.imageUrl || '/images/default.jpg'} alt={pet.name} />
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, pet._id)}
                  accept="image/*"
                  className="file-input"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </div>
              <Card.Body className="text-center">
                <Card.Title>{pet.name}</Card.Title>
                <Card.Text>
                  Breed: {pet.breed} <br />
                  Age: {pet.age} years
                </Card.Text>
                <Button
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePet(pet._id);
                  }}
                >
                  Delete Pet
                </Button>
                {uploading && <p className="text-muted">Uploading...</p>}
                {uploadError && <p className="text-danger">{uploadError}</p>}
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col md={8}>
          {selectedPet ? (
            <div className="pet-details-box p-4 bg-light rounded shadow-sm">
              <h2>{selectedPet.name}</h2>
              <p>Breed: {selectedPet.breed}</p>
              <p>Age: {selectedPet.age} years</p>
              <p>Gender: {selectedPet.gender}</p>
              <p>Size: {selectedPet.size}</p>
              <p>Weight: {selectedPet.weight} lbs</p>
              <p>Medical Conditions: {selectedPet.medicalConditions || 'None'}</p>
              <p>Vaccination Status: {selectedPet.vaccinationStatus || 'Up to date'}</p>
              <p>Vet Contact:</p>
              {selectedPet.vetContact ? (
                <ul>
                  <li>Name: {selectedPet.vetContact.name || 'Not provided'}</li>
                  <li>Phone: {selectedPet.vetContact.phone || 'Not provided'}</li>
                  <li>Address: {selectedPet.vetContact.address || 'Not provided'}</li>
                </ul>
              ) : (
                <p>Not provided</p>
              )}
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
            <div className="pet-details-box p-4 bg-light rounded shadow-sm text-center">
              <p>Select a pet to see more details</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Pets;
