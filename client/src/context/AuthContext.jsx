import React, { createContext, useState, useEffect, useCallback } from 'react'
import {
  login as apiLogin,
  signup as apiSignup,
  requestPasswordReset,
  resetPassword
} from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.info("Sesión cerrada. Por favor, inicia sesión de nuevo.")
    navigate('/login')
  }, [navigate])

useEffect(() => {
  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  // Si no hay token o no hay user, no hacemos logout, solo dejamos que el login se muestre.
  if (!token || !rawUser) {
    setLoading(false);
    return;
  }

  // Si llegamos aquí, sí había token y rawUser: ahora validamos la expiración del JWT.
  try {
    const parsedUser = JSON.parse(rawUser);
    setUser(parsedUser);

    const payloadBase64 = token.split('.')[1];
    if (payloadBase64) {
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      if (payload.exp) {
        const expiresAtMs = payload.exp * 1000;
        const nowMs = Date.now();
        const timeout = expiresAtMs - nowMs;
        if (timeout > 0) {
          // Programamos el logout al expirar
          const timerId = setTimeout(() => {
            logout();
          }, timeout);
          return () => clearTimeout(timerId);
        } else {
          // Si ya está expirado, cerramos sesión
          logout();
        }
      }
    }
  } catch (error) {
    localStorage.removeItem('user');
    setUser(null);
  } finally {
    setLoading(false);
  }
}, [logout]);
const login = async (credentials) => {
  try {
    const { access_token, results } = await apiLogin(credentials);

    if (access_token && results) {
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(results));
      setUser(results);
      return { success: true };
    } else {
      return { success: false, message: "Login: datos inválidos (falta access_token o results)" };
    }
  } catch (error) {
    return { success: false, message: error.message || "Error desconocido durante el login" };
  }
};

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