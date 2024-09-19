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
  const [isEditing, setIsEditing] = useState(false);
  const { authState } = useAuth();
  const { toggleAddPetModal } = useModal();
  const { registerHandlePetAdded, registerHandlePetImageUpdated, registerHandlePetDeleted, registerHandlePetUpdated, deletePet, editPet } = usePet();
  const fileInputRefs = useRef({});

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

    if (selectedPet && selectedPet._id === petId) {
      setSelectedPet(null);
    }
  };

  const handleEditPet = () => {
    if (selectedPet) {
      const updatedPetData = {
        ...selectedPet
      };
      editPet(selectedPet._id, updatedPetData, authState.token);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    fetchPets();
    setIsEditing(false);
  };

  const handleUpdateImage = (petId, imageUrl) => {
    setPets((prevPets) =>
      prevPets.map(pet => pet._id === petId ? { ...pet, imageUrl } : pet)
    );
    if (selectedPet && selectedPet._id === petId) {
      setSelectedPet(prevPet => ({ ...prevPet, imageUrl }));
    }
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
        handleUpdateImage(petId, data.imageUrl);
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
    if (fileInputRefs.current[petId]) {
      fileInputRefs.current[petId].click();
    }
  };

  useEffect(() => {
    const handlePetImageUpdate = (petId, imageUrl) => {
      setPets((prevPets) =>
        prevPets.map(pet => pet._id === petId ? { ...pet, imageUrl } : pet)
      );
    };

    registerHandlePetAdded((newPet) => {
      setPets((prevPets) => [...prevPets, newPet]);
    });

    registerHandlePetUpdated((updatedPet) => {
      setPets((prevPets) =>
        prevPets.map(pet => pet._id === updatedPet._id ? { ...updatedPet } : pet)
      );
    });

    registerHandlePetImageUpdated(handlePetImageUpdate);

    registerHandlePetDeleted((deletedPetId) => {
      setPets((prevPets) => prevPets.filter(pet => pet._id !== deletedPetId));
    });

    return () => {
      // Clean up registered handlers if necessary
    };
  }, [registerHandlePetAdded, registerHandlePetImageUpdated, registerHandlePetDeleted, registerHandlePetUpdated]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="mt-4">
      <Row className="d-block d-md-flex justify-content-between align-items-center mb-4">
        <Col xs={12} className="text-center text-md-left">
          <h1 className="mb-2">My Pets</h1>
          <Button
            variant="primary"
            onClick={toggleAddPetModal}
            className="w-50 mb-2"
          >
            Add Pet
          </Button>
          <p className="text-muted">Click on a pet to see details</p>
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
                <div className="profile-img-wrapper">
                  <Card.Img variant="top" src={pet.imageUrl || "/images/pitbull-logo.jpeg"} alt={pet.name} />
                  {isEditing && (
                    <p className="update-profile-text">Click to update profile</p>
                  )}
                </div>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, pet._id)}
                  accept="image/*"
                  className="file-input"
                  ref={el => fileInputRefs.current[pet._id] = el}
                  style={{ display: 'none' }}
                  disabled={!isEditing}
                />
              </div>
              <Card.Body className="text-center">
                <Card.Title>{pet.name}</Card.Title>
                <Card.Text>
                  Breed: {pet.breed} <br />
                  Age: {pet.age} years
                </Card.Text>
                {!isEditing && (
                  <Button
                    className="button-spacing"
                    variant="warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    Edit Pet
                  </Button>
                )}
                {!isEditing && (
                  <Button
                    className="button-spacing"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePet(pet._id);
                    }}
                  >
                    Delete Pet
                  </Button>
                )}
                {uploading && <p className="text-muted">Uploading...</p>}
                {uploadError && <p className="text-danger">{uploadError}</p>}
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col md={8}>
          {selectedPet ? (
            <div className="pet-details-box p-4 bg-light rounded shadow-sm">
              {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleEditPet(); }}>
                  {/* Form fields */}
                  <Button type="submit" variant="success" className="button-spacing">
                    Save Pet
                  </Button>
                  <Button type="button" variant="secondary" className="button-spacing" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <h2>{selectedPet.name}</h2>
              <p>Breed: {selectedPet.breed}</p>
              <p>Age: {selectedPet.age} years</p>
              <p>Gender: {selectedPet.gender}</p>
              <p>Size: {selectedPet.size}</p>
              <p>Weight: {selectedPet.weight} lbs</p>
              <p>Medical Conditions: {selectedPet.medicalConditions || 'None'}</p>
              <p>Vaccinations: {selectedPet.vaccinations || ''}</p>
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
                  <li>Preferred Times: {selectedPet.walkPreferences.preferredTimes.join(', ')}</li>
                  <li>Preferred Routes: {selectedPet.walkPreferences.preferredRoutes}</li>
                  <li>Pace: {selectedPet.walkPreferences.pace}</li>
                </ul>
              ) : (
                <p>Not provided</p>
              )}
                </>
              )}
            </div>
          ) : (
            <p>Select a pet to see details</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Pets;
