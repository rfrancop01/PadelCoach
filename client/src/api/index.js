// src/api/index.js
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json'
  }
})

// Interceptor de petición: adjuntar el token correcto
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')   // misma clave que usas para guardar
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: no recargar si viene de /auth/login
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const reqUrl = error.config?.url || ""

    if (status === 401) {
      if (reqUrl.endsWith('/auth/login')) {
        // 401 al intentar hacer login → dejamos que el catch(lo capture)
        return Promise.reject(error)
      }
      // Cualquier otro 401 (p.ej. acceder a /users sin token) → limpiar y redirect
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { login, signup, requestPasswordReset, resetPassword } from './auth'
export * from './courts'
export * from './sessions'
export * from './students'
export * from './users'
export * from './trainers'
export * from './invitations'