import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Booking        from './pages/Booking';
import MyBookings     from './pages/MyBookings';
import Profile        from './pages/Profile';
import NotFound       from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed  from './pages/PaymentFailed';
import PaymentHistory from './pages/PaymentHistory';
import BookingPass    from './pages/BookingPass';
import Teams         from './pages/Teams';
import TeamDetails   from './pages/TeamDetails';
import Venue         from './pages/Venue';
import Rewards       from './pages/Rewards';
import Matches       from './pages/Matches';
import Notifications from './pages/Notifications';
import ChatWidget    from './components/ChatWidget';
import AuthCallback  from './pages/AuthCallback';
import Leaderboard      from './pages/Leaderboard';
import Referral         from './pages/Referral';
import Gallery          from './pages/Gallery';
import DigitalCricketID from './pages/DigitalCricketID';
import PlayerProfile    from './pages/PlayerProfile';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ChatWidget />
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/booking"     element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/payment-success"  element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment-failed"   element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
          <Route path="/payment-history"  element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/booking-pass/:bookingId" element={<ProtectedRoute><BookingPass /></ProtectedRoute>} />
          <Route path="/teams"            element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="/teams/:id"        element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />
          <Route path="/venue"            element={<Venue />} />
          <Route path="/rewards"          element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/matches"          element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/notifications"    element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/leaderboard"      element={<Leaderboard />} />
          <Route path="/referrals"        element={<ProtectedRoute><Referral /></ProtectedRoute>} />
          <Route path="/gallery"          element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/cricket-id"       element={<ProtectedRoute><DigitalCricketID /></ProtectedRoute>} />
          <Route path="/player/:cricketId" element={<PlayerProfile />} />
          <Route path="*"                 element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
