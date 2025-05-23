import api from './index'  

export const login = payload => api.post('/auth/login', payload)

export const requestPasswordReset = email => api.post('/auth/request-password-reset', { email })
export const resetPassword = payload => api.post('/auth/reset-password', payload)