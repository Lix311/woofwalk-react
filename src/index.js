import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { ModalProvider } from './context/ModalContext'; // Import ModalProvider
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PetProvider } from './context/PetContext';
import { BookingProvider } from './context/BookingsContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
      <BookingProvider>
          <ModalProvider>
            <PetProvider>
              <App />
            </PetProvider>
          </ModalProvider>
      </BookingProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
