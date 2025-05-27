import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json'
  }
})

// Interceptor para añadir el JWT de acceso (access_token) si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor para manejar errores globales
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Limpiar token y redirigir al login en caso de no autorizado
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