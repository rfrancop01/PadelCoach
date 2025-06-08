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
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-2 sm:px-4 overflow-y-auto pt-[72px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-auto my-8 rounded-xl overflow-hidden bg-white shadow-md p-6 max-h-[90vh] overflow-y-auto"
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
          {courtToEdit ? "Editar pista" : "Crear pista"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Ubicación</label>
            {!isNewLocation ? (
              <select
                name="locationSelect"
                value={locations.includes(form.location) ? form.location : ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
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
                className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
                required
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Tipo</label>
            <select
              name="court_type"
              value={form.court_type}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
              {courtToEdit ? "Guardar cambios" : "Crear pista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};