import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}