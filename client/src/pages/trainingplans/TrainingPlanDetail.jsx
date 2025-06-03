import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTrainingPlanById, deleteTrainingPlan } from '../../api/trainingplans';

export const TrainingPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await getTrainingPlanById(id);
        setPlan(res.data);
      } catch (err) {
        setError('Error al cargar el plan de entrenamiento');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plan?')) return;

    try {
      await deleteTrainingPlan(id);
      navigate('/trainingplans');
    } catch (err) {
      setError('Error al eliminar el plan');
    }
  };

  if (loading) return <p className="text-center p-8">Cargando plan de entrenamiento...</p>;
  if (error) return <p className="text-red-600 text-center p-8">{error}</p>;
  if (!plan) return <p>No se encontró el plan.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-card">
      <h1 className="text-3xl font-bold mb-4">{plan.name || `Plan #${plan.id}`}</h1>
      <p className="mb-4">{plan.description || 'Sin descripción'}</p>

      {/* Aquí puedes añadir más detalles relevantes del plan */}

      <div className="flex space-x-4">
        <Link
          to={`/trainingplans/edit/${id}`}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Eliminar
        </button>
        <Link
          to="/trainingplans"
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Volver a la lista
        </Link>
      </div>
    </div>
  );
};