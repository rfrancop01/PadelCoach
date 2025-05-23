// src/Routes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Students from './pages/students/Students'
import Courts from './pages/courts/Courts'
import Sessions from './pages/sessions/Sessions'
import Trainers from './pages/trainers/Trainers'
import Invitations from './pages/invitations/Invitations'
import ProtectedRoute from './components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/invitations" element={<Invitations />} />
        </Route>

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}