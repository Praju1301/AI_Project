import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './Pages/RegisterPage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import DashboardPage from './Pages/DashboardPage.jsx';
import StudentPage from './Pages/StudentPage.jsx';
import SettingsPage from './Pages/SettingsPage.jsx';
import Navbar from './components/shared/Navbar.js';
import PrivateRoute from './components/shared/PrivateRoute.js'; // <-- Correctly import the component
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Use the imported PrivateRoute component */}
          <Route 
            path="/student" 
            element={<PrivateRoute allowedRoles={['student']}><StudentPage /></PrivateRoute>} 
          />
          <Route 
            path="/dashboard" 
            element={<PrivateRoute allowedRoles={['caregiver']}><DashboardPage /></PrivateRoute>} 
          />
          <Route 
            path="/settings/:studentId" 
            element={<PrivateRoute allowedRoles={['caregiver']}><SettingsPage /></PrivateRoute>} 
          />

          <Route path="/" element={<Navigate to={localStorage.getItem('authToken') ? (localStorage.getItem('userRole') === 'caregiver' ? '/dashboard' : '/student') : '/login'} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;