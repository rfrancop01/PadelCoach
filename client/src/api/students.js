import { api } from './index';

export const getStudents = () => api.get('/students');
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getSessionsByStudent = (studentId) => api.get(`/students/${studentId}/sessions`);
export const getStudentByUserId = (userId) => {return api.get(`/students/by_user/${userId}`);
};