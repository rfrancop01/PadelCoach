// src/Routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Profile } from './pages/Profile'
import { RequestReset } from './pages/password-reset/RequestReset'
import { ResetPassword } from './pages/password-reset/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { StudentList } from './pages/students/StudentList'
import { StudentDetail } from './pages/students/StudentDetail'
import { CourtList } from './pages/courts/CourtList'
import { CourtDetail } from './pages/courts/CourtDetail'
import { SessionList } from './pages/sessions/SessionList'
import { SessionDetail } from './pages/sessions/SessionDetail'
import { TrainerList } from './pages/trainers/TrainerList'
import { TrainerDetail } from './pages/trainers/TrainerDetail'
import { Invitations } from './pages/invitations/Invitations'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/password-reset" element={<RequestReset />} />
      <Route path="/password-reset/:token" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/courts" element={<CourtList />} />
        <Route path="/courts/:id" element={<CourtDetail />} />
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/trainers" element={<TrainerList />} />
        <Route path="/trainers/:id" element={<TrainerDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/invitations" element={<Invitations />} />
      </Route>

      {/* Fallback to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}