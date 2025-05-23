// src/App.jsx
import React from 'react'
import AuthProvider from './context/AuthContext'
import Navbar from './components/Navbar'
import AppRoutes from './Routes'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  )
}
