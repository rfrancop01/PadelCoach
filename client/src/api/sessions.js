

import api from './index'

// Sessions endpoints
export const getSessions = () => api.get('/sessions')
export const getSession = id => api.get(`/sessions/${id}`)
export const createSession = data => api.post('/sessions', data)
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data)
export const deleteSession = id => api.delete(`/sessions/${id}`)