import React, { createContext, useState, useContext, useCallback } from 'react';

const PetContext = createContext();

export const PetProvider = ({ children }) => {
  const [handlePetAdded, setHandlePetAdded] = useState(null);
  const [handlePetDeleted, setHandlePetDeleted] = useState(null);

  // Function to register the handlePetAdded callback
  const registerHandlePetAdded = useCallback((callback) => {
    setHandlePetAdded(() => callback);
  }, []);

  // Function to register the handlePetDeleted callback
  const registerHandlePetDeleted = useCallback((callback) => {
    setHandlePetDeleted(() => callback);
  }, []);

  // Function to delete a pet
  const deletePet = useCallback(async (petId, token) => {
    console.log("delete pet being called in context!!!")
    try {
      const response = await fetch(`http://localhost:5000/api/dogs/${petId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json' // Include auth token if required
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      // Trigger the callback after successful deletion
      if (handlePetDeleted) {
        handlePetDeleted(petId);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  }, [handlePetDeleted]);

  // Function to update a pet's image
  const updatePetImage = useCallback(async (petId, imageUrl, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/dogs/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl }) // Update the imageUrl field
      });

      if (!response.ok) {
        throw new Error('Failed to update pet image');
      }

      // const updatedPet = await response.json();
      // You can handle additional logic here, such as updating state or triggering callbacks
    } catch (error) {
      console.error('Error updating pet image:', error);
    }
  }, []);

  return (
    <PetContext.Provider value={{ handlePetAdded, registerHandlePetAdded, deletePet, registerHandlePetDeleted, updatePetImage }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => useContext(PetContext);
