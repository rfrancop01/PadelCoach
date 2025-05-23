import api from './index'

export const getInvitations = () => api.get('/invitations')
export const createInvitation = data => api.post('/invitations', data)
export const resendInvitation = data => api.post('/invitations/resend', data)
