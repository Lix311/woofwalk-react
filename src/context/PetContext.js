import React, { createContext, useState, useContext, useCallback } from 'react';

const PetContext = createContext();
const BASE_URL="https://woofwalk-backend-a64f983b3231.herokuapp.com"


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
      // Step 1: Fetch and delete bookings associated with the pet
      const bookingsResponse = await fetch(`${BASE_URL}/api/bookings?dogId=${petId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings for the pet');
      }
  
      const bookings = await bookingsResponse.json();
      const walkIds = [];
  
      // Collect walk IDs associated with the bookings
      for (const booking of bookings) {
        walkIds.push(booking.walkId);
      }
  
      // Step 2: Delete associated walks
      for (const walkId of walkIds) {
        await fetch(`${BASE_URL}/api/walks/${walkId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
      }
  
      // Step 3: Delete associated bookings
      for (const booking of bookings) {
        await fetch(`${BASE_URL}/api/bookings/${booking._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
      }
  
      // Step 4: Delete the pet
      const response = await fetch(`${BASE_URL}/api/dogs/${petId}`, {
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
      console.error('Error deleting pet and related records:', error);
    }
  }, [handlePetDeleted]);
  

  const editPet = useCallback(async (petId, petData, token) => {
    console.log(petId, petData)
    debugger 
    try {
      const response = await fetch(`${BASE_URL}/api/dogs/${petId}`, {
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
      const response = await fetch(`${BASE_URL}/api/dogs/${petId}`, {
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
