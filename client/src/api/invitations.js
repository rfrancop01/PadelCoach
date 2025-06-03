import { api } from './index'

export const getInvitations = () => api.get('/invitations')
export const getInvitation = (id) => api.get(`/invitations/${id}`)
export const createInvitation = (data) => api.post('/invitations', data)
export const updateInvitation = (id, data) => api.put(`/invitations/${id}`, data)
export const deleteInvitation = (id) => api.delete(`/invitations/${id}`)