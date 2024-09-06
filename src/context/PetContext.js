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

  return (
    <PetContext.Provider value={{ handlePetAdded, registerHandlePetAdded, deletePet, registerHandlePetDeleted }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => useContext(PetContext);
