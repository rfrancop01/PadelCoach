import React, { useEffect, useState } from "react";
import { getAvailableStudentUsers } from "../../api/users";

export const StudentFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    phone: "",
    level: "",
    user_id: "",
  });
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        last_name: initialData.last_name || "",
        phone: initialData.phone || "",
        level: initialData.level || "",
        user_id: initialData.user_id || "",
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

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const res = await getAvailableStudentUsers();
        setAvailableUsers(res.data.results);
      } catch (err) {
        console.error("Error al obtener usuarios disponibles:", err);
      }
    };
    fetchAvailableUsers();
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Editar Estudiante" : "Crear Estudiante"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <select
              name="user_id"
              value={formData.user_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
              disabled={!!initialData}
            >
              <option value="">Seleccione un usuario</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nivel</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="px-4 py-2 text-gray-600 hover:underline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primaryLight transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
