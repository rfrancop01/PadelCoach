import React, { useEffect, useState } from "react";
import { createCourt, updateCourt } from "../../api/courts";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const CourtFormModal = ({ isOpen, onClose, onSave, courtToEdit, locations }) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    court_type: "indoor",
  });

  // Nuevo estado para controlar si se está creando una ubicación nueva
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [newLocationValue, setNewLocationValue] = useState("");

  useEffect(() => {
    if (courtToEdit) {
      setForm({
        name: courtToEdit.name || "",
        location: courtToEdit.location || "",
        court_type: courtToEdit.court_type || "indoor",
      });
      setIsNewLocation(
        courtToEdit.location && !locations.includes(courtToEdit.location)
      );
      setNewLocationValue(
        courtToEdit.location && !locations.includes(courtToEdit.location)
          ? courtToEdit.location
          : ""
      );
    } else {
      setForm({
        name: "",
        location: "",
        court_type: "indoor",
      });
      setIsNewLocation(false);
      setNewLocationValue("");
    }
  }, [courtToEdit, locations]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "locationSelect") {
      if (value === "new") {
        // Selecciona crear nueva ubicación
        setIsNewLocation(true);
        setForm((prev) => ({ ...prev, location: "" }));
      } else {
        setIsNewLocation(false);
        setForm((prev) => ({ ...prev, location: value }));
      }
    } else if (name === "newLocation") {
      setNewLocationValue(value);
      setForm((prev) => ({ ...prev, location: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar si location está vacía
    if (!form.location || form.location.trim() === "") {
      toast.error("Por favor, selecciona o escribe una ubicación válida");
      return;
    }

    try {
      if (courtToEdit) {
        await updateCourt(courtToEdit.id, form);
        toast.success("Pista actualizada correctamente");
      } else {
        await createCourt(form);
        toast.success("Pista creada correctamente");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error guardando pista:", error);
      toast.error("Error al guardar pista");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-4 overflow-auto pt-[72px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {courtToEdit ? "Editar pista" : "Crear pista"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Ubicación</label>
            {!isNewLocation ? (
              <select
                name="locationSelect"
                value={locations.includes(form.location) ? form.location : ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="" disabled>
                  Seleccionar ubicación
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="new">Otra ubicación...</option>
              </select>
            ) : (
              <input
                type="text"
                name="newLocation"
                value={newLocationValue}
                onChange={handleChange}
                placeholder="Escribe nueva ubicación"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Tipo</label>
            <select
              name="court_type"
              value={form.court_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-accent text-gray-900 px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition font-medium"
            >
              {courtToEdit ? "Guardar cambios" : "Crear pista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};