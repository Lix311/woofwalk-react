import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAddWalkModal, setShowAddWalkModal] = useState(false);
  const [showBookWeekModal, setShowBookWeekModal] = useState(false);


  // Add reset callbacks
  const resetCallbacks = {
    login: null,
    signup: null,
    addPet: null,
    addWalk: null,
  };

  const toggleLoginModal = () => {
    if (showLoginModal && resetCallbacks.login) resetCallbacks.login(); // Reset form on close
    setShowLoginModal((prev) => {
      if (!prev) setShowSignupModal(false); // Close signup modal when login opens
      return !prev;
    });
  };

  const toggleSignupModal = () => {
    if (showSignupModal && resetCallbacks.signup) resetCallbacks.signup(); // Reset form on close
    setShowSignupModal((prev) => {
      if (!prev) setShowLoginModal(false); // Close login modal when signup opens
      return !prev;
    });
  };

  const toggleAddPetModal = () => {
    if (showAddPetModal && resetCallbacks.addPet) resetCallbacks.addPet(); // Reset form on close
    setShowAddPetModal((prev) => !prev);
  };

  const toggleAddWalkModal = () => {
    if (showAddWalkModal && resetCallbacks.addWalk) resetCallbacks.addWalk(); // Reset form on close
    setShowAddWalkModal((prev) => !prev);
  };

  const setResetCallback = (modal, callback) => {
    if (resetCallbacks[modal] !== undefined) {
      resetCallbacks[modal] = callback;
    }
  };

  return (
    <ModalContext.Provider
      value={{
        showLoginModal,
        toggleLoginModal,
        showSignupModal,
        toggleSignupModal,
        showAddPetModal,
        toggleAddPetModal,
        showAddWalkModal,
        toggleAddWalkModal,
        showBookWeekModal,
        setShowBookWeekModal,
        
        setResetCallback, // Expose the callback setter
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
