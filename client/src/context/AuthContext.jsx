import React, { createContext, useState, useEffect, useCallback } from 'react'
import {
  login as apiLogin,
  signup as apiSignup,
  requestPasswordReset,
  resetPassword
} from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useContext } from 'react'

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

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAndSetUser = async () => {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);
          if (payload.exp) {
            const expiresAtMs = payload.exp * 1000;
            const nowMs = Date.now();
            const timeout = expiresAtMs - nowMs;
            if (timeout > 0) {
              const timerId = setTimeout(() => logout(), timeout);
              await refreshUser();
              return () => clearTimeout(timerId);
            } else {
              logout();
            }
          }
        }
      } catch (e) {
        console.error("Fallo al procesar token:", e);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetUser();
  }, [logout]);

  const login = async (credentials) => {
    try {
      const { access_token, results } = await apiLogin(credentials);

      if (access_token && results) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(results));
        setUser(results);
        await refreshUser(results.id);
        const updatedUser = JSON.parse(localStorage.getItem('user'));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
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

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };
  const refreshUser = async (id = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("Token no disponible para refrescar usuario.");
      return;
    }

    if (!id) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        id = storedUser?.id;
      } catch {
        console.warn("No se pudo obtener el ID desde localStorage.");
        return;
      }
    }

    if (!id) {
      console.warn("ID de usuario no disponible para refrescar.");
      return;
    }

    const userId = id;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Respuesta no OK:", res.status, errorText);
        return;
      }
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Respuesta no es JSON:", text);
        return;
      }

      const data = await res.json();
      setUser(data.results);
      localStorage.setItem('user', JSON.stringify(data.results));
    } catch (err) {
      console.error("Error al refrescar el usuario:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, requestReset, reset, updateUser, refreshUser }}
    >
      {!loading && (
        <>
          {children}
        </>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)