 import { api } from './index';

export const getTrainingPlans = async () => {
  return await api.get('/trainingplans');
};

export const getTrainingPlanById = async (id) => {
  return await api.get(`/trainingplans/${id}`);
};

// data puede ser JSON o FormData
// isFormData: boolean que indica si data es FormData para configurar axios
export const createTrainingPlan = async (data, isFormData = false) => {
  if (isFormData) {
    return await api.post('/trainingplans', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } else {
    return await api.post('/trainingplans', data);
  }
};

export const updateTrainingPlan = async (id, data, isFormData = false) => {
  if (isFormData) {
    return await api.put(`/trainingplans/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } else {
    return await api.put(`/trainingplans/${id}`, data);
  }
};

export const deleteTrainingPlan = async (id) => {
  return await api.delete(`/trainingplans/${id}`);
};