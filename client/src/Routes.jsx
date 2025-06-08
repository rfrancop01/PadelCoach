import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "./components/Layout";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Profile } from "./pages/Profile";
import { RequestReset } from "./pages/password-reset/RequestReset";
import { ResetPassword } from "./pages/password-reset/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { TrainerDashboard } from "./pages/dashboard/TrainerDashboard";
import { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import { StudentList } from "./pages/students/StudentList";
import { StudentDetail } from "./pages/students/StudentDetail";
import { CourtList } from "./pages/courts/CourtList";
import { CourtDetail } from "./pages/courts/CourtDetail";
import { SessionList } from "./pages/sessions/SessionList";
import { SessionsPage } from "./pages/sessions/SessionsPage";
import { SessionDetail } from "./pages/sessions/SessionDetail";
import { TrainerList } from "./pages/trainers/TrainerList";
import { TrainerDetail } from "./pages/trainers/TrainerDetail";
import { Invitations } from "./pages/invitations/Invitations.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TrainingPlanList } from "./pages/trainingplans/TrainingPlanList";
import { UserList } from "./pages/users/UserList";
import { UserProfile } from "./pages/users/UserProfile";
import { About } from "./pages/About";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home route */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/password-reset" element={<RequestReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Admin-only routes */}
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/students" element={<StudentList />} />
          <Route path="/admin/trainers" element={<TrainerList />} />
          <Route path="/admin/courts" element={<CourtList />} />
          <Route path="/admin/trainingplans" element={<TrainingPlanList />} />
          <Route path="/admin/invitations" element={<Invitations />} />

          <Route path="/usuarios/:id" element={<UserProfile />} />

          {/* Non-admin routes */}
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/trainers/:id" element={<TrainerDetail />} />
          <Route path="/courts/:id" element={<CourtDetail />} />

          {/* Shared for trainer and student */}
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}