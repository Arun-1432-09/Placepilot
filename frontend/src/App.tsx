import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleRoute } from './components/common/RoleRoute';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';

// Student Pages
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { NewAssessment } from './pages/NewAssessment';
import { Results } from './pages/Results';
import { History } from './pages/History';
import { Recommendations } from './pages/Recommendations';

// Faculty / Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDirectory } from './pages/StudentDirectory';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Student Role Routes */}
            <Route element={<RoleRoute allowedRole="student" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/assessment/new" element={<NewAssessment />} />
              <Route path="/results" element={<Results />} />
              <Route path="/history" element={<History />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Route>

            {/* Faculty / Admin Role Routes */}
            <Route element={<RoleRoute allowedRole="faculty" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentDirectory />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
