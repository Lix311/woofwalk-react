import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const BASE_URL="https://woofwalk-backend.herokuapp.com"

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
  });
  const navigate = useNavigate();

  const login = (token, user) => {
    setAuthState({
      token,
      user,
    });
    console.log("logging in...", token, user);
    navigate('/', { replace: true });
  };

  const logout = () => {
    setAuthState({
      token: null,
      user: null,
    });
    navigate('/', { replace: true });
  };

  const updateUserInfo = async (updatedInfo) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${authState.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedInfo),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update user info');
      }
  
      const updatedUser = await response.json();
  
      // Update authState with the new user info
      setAuthState((prevAuthState) => ({
        ...prevAuthState,
        user: {
          ...updatedUser,
          id: updatedUser._id, // Map _id to id
        },
      }));
      console.log(updatedUser)
      return updatedUser;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}
