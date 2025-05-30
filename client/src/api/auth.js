import { api } from './index'  

export const login = async payload => {
  const response = await api.post('/auth/login', payload)
  return response.data
}

export const requestPasswordReset = email => api.post('/auth/request-password-reset', { email })
export const resetPassword = payload => api.post('/auth/reset-password', payload)
export const signup = payload => api.post('/auth/signup', payload)