import api from './index'

// Courts endpoints
export const getCourts = () => api.get('/courts')
export const getCourt = id => api.get(`/courts/${id}`)
export const createCourt = data => api.post('/courts', data)
export const updateCourt = (id, data) => api.put(`/courts/${id}`, data)
export const deleteCourt = id => api.delete(`/courts/${id}`)
