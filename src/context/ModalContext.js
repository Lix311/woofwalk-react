import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAddWalkModal, setShowAddWalkModal] = useState(false); // Add state for AddWalk modal

  const toggleLoginModal = () => setShowLoginModal((prev) => !prev);
  const toggleSignupModal = () => setShowSignupModal((prev) => !prev);
  const toggleAddPetModal = () => setShowAddPetModal((prev) => !prev);
  const toggleAddWalkModal = () => setShowAddWalkModal((prev) => !prev); // Add toggle function for AddWalk modal

  return (
    <ModalContext.Provider value={{
      showLoginModal,
      toggleLoginModal,
      showSignupModal,
      toggleSignupModal,
      showAddPetModal,
      toggleAddPetModal,
      showAddWalkModal, // Provide the state for AddWalk modal
      toggleAddWalkModal, // Provide the toggle function for AddWalk modal
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
