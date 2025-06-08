import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const StudentFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    phone: "",
    level: "",
    user_id: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.user?.name || "",
        last_name: initialData.user?.last_name || "",
        phone: initialData.user?.phone || "",
        level: initialData.level || "",
        user_id: initialData.user?.id || "",
      });
    } else {
      setFormData({
        name: "",
        last_name: "",
        phone: "",
        level: "",
        user_id: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-2 sm:px-4 overflow-y-auto pt-[72px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-auto my-8 rounded-xl overflow-hidden bg-white shadow-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? "Editar Alumno" : "Crear Alumno"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nivel</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              required
            >
              <option value="">Seleccione un nivel</option>
              <option value="Primera">Primera</option>
              <option value="Segunda">Segunda</option>
              <option value="Tercera">Tercera</option>
              <option value="Cuarta">Cuarta</option>
              <option value="Iniciación">Iniciación</option>
              <option value="Competición">Competición</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 h-[40px] px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition font-medium"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};