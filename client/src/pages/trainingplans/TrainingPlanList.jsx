import React, { useEffect, useState } from 'react';
import { getTrainingPlans } from '../../api/trainingplans';

export const TrainingPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await getTrainingPlans();
        setPlans(res.data.results || []);
      } catch (err) {
        setError('Error al cargar planes de entrenamiento');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <p className="text-center p-8">Cargando planes de entrenamiento...</p>;
  if (error) return <p className="text-red-600 text-center p-8">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Planes de Entrenamiento</h1>
      {plans.length === 0 ? (
        <p>No hay planes de entrenamiento disponibles.</p>
      ) : (
        <ul className="space-y-4">
          {plans.map(plan => (
            <li key={plan.id} className="bg-white rounded-lg shadow-card p-4">
              <h2 className="text-xl font-semibold">{plan.name || `Plan #${plan.id}`}</h2>
              <p className="text-gray-700">{plan.description || 'Sin descripción'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};