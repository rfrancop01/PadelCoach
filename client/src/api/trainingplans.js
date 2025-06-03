import { api } from './index';

export const getTrainingPlans = async () => {
  const response = await api.get('/trainingplans');
  return response;
};

export const getTrainingPlanById = async (id) => {
  const response = await api.get(`/trainingplans/${id}`);
  return response;
};

export const createTrainingPlan = async (data) => {
  const response = await api.post('/trainingplans', data);
  return response;
};

export const updateTrainingPlan = async (id, data) => {
  const response = await api.put(`/trainingplans/${id}`, data);
  return response;
};

export const deleteTrainingPlan = async (id) => {
  const response = await api.delete(`/trainingplans/${id}`);
  return response;
};