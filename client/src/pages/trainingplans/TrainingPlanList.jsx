import React, { useEffect, useState } from "react";
import { getTrainingPlans, deleteTrainingPlan } from "../../api/trainingplans";
import { TrainingPlanFormModal } from "./TrainingPlanFormModal";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export const TrainingPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getTrainingPlans();
      setPlans(res.data.results);
    } catch (error) {
      toast.error("Error al cargar planes de entrenamiento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = (id) => {
    confirmAlert({
      title: "Confirmar eliminación",
      message: "¿Seguro que quieres eliminar este plan de entrenamiento?",
      buttons: [
        {
          label: "Sí, eliminar",
          onClick: async () => {
            try {
              await deleteTrainingPlan(id);
              toast.success("Plan eliminado correctamente");
              fetchPlans();
            } catch (error) {
              toast.error("Error al eliminar plan");
            }
          },
        },
        { label: "Cancelar" },
      ],
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingPlan(null);
    fetchPlans();
  };

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Planes de Entrenamiento</h1>
          <button
            onClick={handleAdd}
            className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition w-fit font-medium hover:bg-accent/90 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Plan
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Cargando planes...</p>
        ) : plans.length === 0 ? (
          <p className="text-gray-500">No hay planes disponibles.</p>
        ) : (
          <table className="min-w-full bg-white rounded shadow text-sm divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                <th className="px-6 py-3">Título</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Archivo</th>
                <th className="px-6 py-3 text-center">Editar</th>
                <th className="px-6 py-3 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t hover:bg-gray-100 hover:shadow-sm transition-all">
                  <td className="px-6 py-4">{plan.title}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{plan.description || "-"}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`http://localhost:8000/uploads/trainingplans/1.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-600 hover:underline"
                    >
                      Ver archivo
                    </a>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-1 rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5 text-primary hover:text-primaryLight" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1 rounded border border-red-600 text-red-600 bg-red-100 hover:bg-red-200 transition"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TrainingPlanFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        planToEdit={editingPlan}
      />
    </div>
  );
};