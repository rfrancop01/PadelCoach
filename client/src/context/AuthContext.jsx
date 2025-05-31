import React, { createContext, useState, useEffect, useCallback } from 'react'
import {
  login as apiLogin,
  signup as apiSignup,
  requestPasswordReset,
  resetPassword
} from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Context
export const AuthContext = createContext()

// Provider como named export
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const rawUser = localStorage.getItem('user')

    try {
      if (token && rawUser) {
        const parsedUser = JSON.parse(rawUser)
        setUser(parsedUser)

        // Decode token payload to get exp
        const payloadBase64 = token.split('.')[1]
        if (payloadBase64) {
          const payloadJson = atob(payloadBase64)
          const payload = JSON.parse(payloadJson)
          if (payload.exp) {
            const expiresAtMs = payload.exp * 1000
            const nowMs = Date.now()
            const timeout = expiresAtMs - nowMs
            if (timeout > 0) {
              const timerId = setTimeout(() => {
                logout()
              }, timeout)
              return () => clearTimeout(timerId)
            } else {
              logout()
            }
          }
        }
      }
    } catch (error) {
      console.error("Error al parsear el usuario:", error)
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [logout])

  const login = async (credentials) => {
    try {
      const { access_token, results } = await apiLogin(credentials)

      if (access_token && results) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(results))
        setUser(results)
        return { success: true }
      } else {
        return { success: false, message: "Login: datos inválidos (falta access_token o results)" }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const signup = async (data) => {
    try {
      const { access_token, results } = await apiSignup(data)

      if (access_token && results) {
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(results))
        setUser(results)
        return { success: true }
      } else {
        return { success: false, message: "Signup: datos inválidos (falta access_token o results)" }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
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
      {!loading && (
        <>
          {children}
          <ToastContainer />
        </>
      )}
    </AuthContext.Provider>
  )
}