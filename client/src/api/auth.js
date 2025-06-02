import { api } from './index'  

export const login = async payload => {
  try {
    const response = await api.post('/auth/login', payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Error desconocido durante el login';
    throw new Error(message);
  }
};

export const requestPasswordReset = email => api.post('/auth/request-password-reset', { email })
export const resetPassword = payload => api.post('/auth/reset-password', payload)
export const signup = payload => api.post('/auth/signup', payload)