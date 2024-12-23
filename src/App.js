import React from 'react';
import { Routes, Route} from 'react-router-dom';

import Home from './Home';
import Login from './Login';
import SignUp from './Signup';
import MyInfo from './pages/MyInfo';
import Pets from './pages/Pets';
import Scheduling from './pages/Scheduling';
import AdminScheduling from './pages/AdminScheduling';
import Payments from './pages/Payments';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './Layout'; // Import Layout
import AddPet from './AddPet'; // Import AddPet
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminPage from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { authState } = useAuth();

   // If authState is still loading or null, display a loading spinner or placeholder
   if (authState === null) {
    return <div>Loading...</div>; // Or use a spinner component here
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info" element={<ProtectedRoute><MyInfo /></ProtectedRoute>} />
        <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
        <Route path="/schedule" element={authState?.user?.role === 'admin' ? <AdminScheduling /> : <Scheduling />} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />

        {/* Admin routes wrapped with AdminRoute */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Login /> {/* Include the Login modal */}
      <SignUp /> {/* Include the SignUp modal */}
      <AddPet /> {/* Include the AddPet modal */}
    </Layout>
  );
}

export default App;