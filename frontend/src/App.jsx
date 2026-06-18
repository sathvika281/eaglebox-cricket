import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Booking     from './pages/Booking';
import MyBookings  from './pages/MyBookings';
import Profile     from './pages/Profile';
import NotFound    from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/booking"     element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
