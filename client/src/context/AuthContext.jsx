import React, { createContext, useState, useEffect } from 'react'
import {
  login as apiLogin,
  signup as apiSignup,
  requestPasswordReset,
  resetPassword
} from '../api/auth'

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const { access_token, results } = await apiLogin(credentials)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(results))
    setUser(results)
  }

  const signup = async (data) => {
    await apiSignup(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const requestReset = async (payload) => {
    await requestPasswordReset(payload)
  }

  const reset = async (payload) => {
    await resetPassword(payload)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, requestReset, reset }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
