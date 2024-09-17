import React, { createContext, useState, useContext, useCallback } from 'react';

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [handlePetAdded, setHandlePetAdded] = useState(null);
  const [handlePetDeleted, setHandlePetDeleted] = useState(null);
  const [handlePetImageUpdated, setHandlePetImageUpdated] = useState(null);
  const [handlePetUpdated, setHandlePetUpdated] = useState(null);

  const registerHandlePetImageUpdated = useCallback((handler) => {
    setHandlePetImageUpdated(() => handler);
  }, []);

  const registerHandlePetAdded = useCallback((handler) => {
    setHandlePetAdded(() => handler);
  }, []);

  const registerHandlePetDeleted = useCallback((handler) => {
    setHandlePetDeleted(() => handler);
  }, []);

  const registerHandlePetUpdated = useCallback((handler) => {
    setHandlePetUpdated(() => handler);
  }, []);

  const deletePet = useCallback(async (petId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dogs/${petId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      if (handlePetDeleted) {
        handlePetDeleted(petId);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  }, [handlePetDeleted]);

  const editPet = useCallback(async (petId, petData, token) => {
    console.log(petId, petData)
    try {
      const response = await fetch(`http://localhost:5000/api/dogs/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update pet');
      }
  
      const updatedPet = await response.json();
  
      if (handlePetUpdated) {
        handlePetUpdated(updatedPet);
      }
    } catch (error) {
      console.error('Error updating pet:', error);
    }
  }, [handlePetUpdated]);

  const updatePetImage = useCallback(async (petId, imageUrl, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dogs/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl }) // Update the imageUrl field
      });

      if (!response.ok) {
        throw new Error('Failed to update pet image');
      }

      // Notify the registered handler about the image update
      if (handlePetImageUpdated) {
        handlePetImageUpdated(petId, imageUrl);
      }
    } catch (error) {
      console.error('Error updating pet image:', error);
    }
  }, [handlePetImageUpdated]);

  return (
    <PetContext.Provider value={{ 
      handlePetAdded, 
      handlePetUpdated, 
      registerHandlePetAdded, 
      registerHandlePetImageUpdated, 
      deletePet, 
      registerHandlePetDeleted, 
      registerHandlePetUpdated, // Added this line
      updatePetImage,
      editPet
    }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => useContext(PetContext);
