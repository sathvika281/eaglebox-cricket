import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={s.loader}>
        <span style={s.dot} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const s = {
  loader: {
    minHeight: '100vh',
    backgroundColor: '#0D0D0D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#BFFF00',
    display: 'block',
    animation: 'pulse 1s ease-in-out infinite',
  },
};
