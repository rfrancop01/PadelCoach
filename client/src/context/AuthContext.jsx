import React, { createContext, useState, useEffect } from 'react'
import {
  login as apiLogin,
  signup as apiSignup,
  requestPasswordReset,
  resetPassword
} from '../api/auth'

// Context
export const AuthContext = createContext()

// Provider como named export
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const rawUser = localStorage.getItem('user')

    try {
      if (token && rawUser) {
        const parsedUser = JSON.parse(rawUser)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error al parsear el usuario:", error)
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      const { access_token, results } = await apiLogin(credentials)

      if (access_token && results) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(results))
        setUser(results)
      } else {
        console.error("Login: datos inválidos (falta access_token o results)")
      }
    } catch (error) {
      console.error("Error durante el login:", error)
    }
  }

  const signup = async (data) => {
    try {
      const { access_token, results } = await apiSignup(data)

      if (access_token && results) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(results))
        setUser(results)
      } else {
        console.error("Signup: datos inválidos (falta access_token o results)")
      }
    } catch (error) {
      console.error("Error durante el signup:", error)
    }
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