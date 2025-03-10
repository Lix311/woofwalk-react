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
                  <div className="form-group mb-3">
                <label htmlFor="petName">Name:</label>
                <input
                  type="text"
                  id="petName"
                  value={selectedPet.name}
                  onChange={(e) => setSelectedPet({ ...selectedPet, name: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="petBreed">Breed:</label>
                <input
                  type="text"
                  id="petBreed"
                  value={selectedPet.breed}
                  onChange={(e) => setSelectedPet({ ...selectedPet, breed: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="petAge">Age:</label>
                <input
                  type="number"
                  id="petAge"
                  value={selectedPet.age}
                  onChange={(e) => setSelectedPet({ ...selectedPet, age: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="petGender">Gender:</label>
                <input
                  type="text"
                  id="petGender"
                  value={selectedPet.gender}
                  onChange={(e) => setSelectedPet({ ...selectedPet, gender: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="petSize">Size:</label>
                <select
                  id="petSize"
                  value={selectedPet.size}
                  onChange={(e) => setSelectedPet({ ...selectedPet, size: e.target.value })}
                  className="form-control"
                >
                  <option value="">Select Size</option>
                  <option value="Toy">Toy</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="petWeight">Weight:</label>
                <input
                  type="number"
                  id="petWeight"
                  value={selectedPet.weight}
                  onChange={(e) => setSelectedPet({ ...selectedPet, weight: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="petMedicalConditions">Medical Conditions:</label>
                <textarea
                  id="petMedicalConditions"
                  value={selectedPet.medicalConditions || ''}
                  onChange={(e) => setSelectedPet({ ...selectedPet, medicalConditions: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group mb-3">
            <label htmlFor="petVaccinationStatus">Vaccination Status:</label>
            <select
              id="petVaccinationStatus"
              value={selectedPet.vaccinations || ''}
              onChange={(e) => setSelectedPet({ ...selectedPet, vaccinations: e.target.value })}
              className="form-control"
            >
              <option value="">Select Status</option>
              <option value="Up to Date">Up to Date</option>
              <option value="Not Up to Date">Not Up to Date</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="additionalVaccinationNotes">Additional Vaccination Notes:</label>
            <textarea
              id="additionalVaccinationNotes"
              value={selectedPet.additionalVaccinationNotes || ''}
              onChange={(e) => setSelectedPet({ ...selectedPet, additionalVaccinationNotes: e.target.value })}
              className="form-control"
            />
          </div>

              
              <div className="form-group mb-3">
                <label htmlFor="petVetContact">Vet Contact Name:</label>
                <input
                  type="text"
                  id="petVetContact"
                  value={selectedPet.vetContact?.name || ''}
                  onChange={(e) => setSelectedPet({ ...selectedPet, vetContact: { ...selectedPet.vetContact, name: e.target.value } })}
                  className="form-control"
                />
                <label htmlFor="petVetContactPhone" className="mt-2">Vet Contact Phone:</label>
                <input
                  type="tel"
                  id="petVetContactPhone"
                  value={selectedPet.vetContact?.phone || ''}
                  onChange={(e) => setSelectedPet({ ...selectedPet, vetContact: { ...selectedPet.vetContact, phone: e.target.value } })}
                  className="form-control"
                />
                <label htmlFor="petVetContactAddress" className="mt-2">Vet Contact Address:</label>
                <input
                  type="text"
                  id="petVetContactAddress"
                  value={selectedPet.vetContact?.address || ''}
                  onChange={(e) => setSelectedPet({ ...selectedPet, vetContact: { ...selectedPet.vetContact, address: e.target.value } })}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
  <label htmlFor="petTemperament">Temperament:</label>
  <select
    id="petTemperament"
    value={selectedPet.temperament || ''}
    onChange={(e) => setSelectedPet({ ...selectedPet, temperament: e.target.value })}
    className="form-control"
  >
    <option value="">Select Temperament</option>
    <option value="Friendly">Friendly</option>
    <option value="Aggressive">Aggressive</option>
    <option value="Shy">Shy</option>
    <option value="Curious">Curious</option>
    <option value="Playful">Playful</option>
  </select>
</div>

<div className="form-group mb-3">
  <label htmlFor="petSocialization">Socialization:</label>
  <select
    id="petSocialization"
    value={selectedPet.socialization || ''}
    onChange={(e) => setSelectedPet({ ...selectedPet, socialization: e.target.value })}
    className="form-control"
  >
    <option value="">Select Socialization</option>
    <option value="Good with others">Good with others</option>
    <option value="Needs training">Needs training</option>
    <option value="Not social">Not social</option>
    <option value="Timid">Timid</option>
  </select>
</div>

              <div className="form-group mb-3">
  <label htmlFor="preferredTimes">Preferred Walk Times:</label>
  <input
    type="text"
    id="preferredTimes"
    value={selectedPet.walkPreferences?.preferredTimes.join(', ') || ''}
    onChange={(e) => {
      const timesArray = e.target.value.split(',').map((time) => time.trim());
      setSelectedPet({ 
        ...selectedPet, 
        walkPreferences: { 
          ...selectedPet.walkPreferences, 
          preferredTimes: timesArray 
        } 
      });
    }}
    className="form-control"
    placeholder="Enter preferred times separated by commas (e.g., Morning, Afternoon)"
  />
</div>

<div className="form-group mb-3">
  <label htmlFor="preferredRoutes">Preferred Walk Routes:</label>
  <input
    type="text"
    id="preferredRoutes"
    value={selectedPet.walkPreferences?.preferredRoutes.join(', ') || ''}
    onChange={(e) => {
      const routesArray = e.target.value.split(',').map((route) => route.trim());
      setSelectedPet({ 
        ...selectedPet, 
        walkPreferences: { 
          ...selectedPet.walkPreferences, 
          preferredRoutes: routesArray 
        } 
      });
    }}
    className="form-control"
    placeholder="Enter preferred routes separated by commas (e.g., Park, Riverside)"
  />
</div>

<div className="form-group mb-3">
  <label htmlFor="pace">Preferred Walk Pace:</label>
  <input
    type="text"
    id="pace"
    value={selectedPet.walkPreferences?.pace || ''}
    onChange={(e) => setSelectedPet({
      ...selectedPet,
      walkPreferences: {
        ...selectedPet.walkPreferences,
        pace: e.target.value
      }
    })}
    className="form-control"
    placeholder="Enter pace (e.g., Fast, Slow)"
  />
</div>

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
              <p>Vaccination Status: {selectedPet.vaccinations || ''}</p>
              <p>Additional Vaccination Notes: {selectedPet.additionalVaccinationNotes || 'No Notes'}</p>
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
