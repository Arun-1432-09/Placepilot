import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
