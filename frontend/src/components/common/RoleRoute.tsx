import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface RoleRouteProps {
  allowedRole: 'student' | 'faculty';
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'faculty' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};
