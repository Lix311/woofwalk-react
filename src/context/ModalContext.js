import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAddWalkModal, setShowAddWalkModal] = useState(false);

  const toggleLoginModal = () => {
    // Close the signup modal when opening/closing login modal
    setShowLoginModal((prev) => {
      if (!prev) setShowSignupModal(false); // Close signup modal when login opens
      return !prev;
    });
  };

  const toggleSignupModal = () => {
    // Close the login modal when opening/closing signup modal
    setShowSignupModal((prev) => {
      if (!prev) setShowLoginModal(false); // Close login modal when signup opens
      return !prev;
    });
  };

  const toggleAddPetModal = () => setShowAddPetModal((prev) => !prev);
  const toggleAddWalkModal = () => setShowAddWalkModal((prev) => !prev);

  return (
    <ModalContext.Provider value={{
      showLoginModal,
      toggleLoginModal,
      showSignupModal,
      toggleSignupModal,
      showAddPetModal,
      toggleAddPetModal,
      showAddWalkModal,
      toggleAddWalkModal,
    }}>
      {children}
    </ModalContext.Provider>
  );
};


export const useModal = () => useContext(ModalContext);
