import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { createTrainingPlan, updateTrainingPlan } from "../../api/trainingplans";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const TrainingPlanFormModal = ({ isOpen, onClose, onSave, planToEdit }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRemoved, setFileRemoved] = useState(false);

  useEffect(() => {
    if (planToEdit) {
      setForm({
        title: planToEdit.title || "",
        description: planToEdit.description || "",
      });
      setSelectedFile(null);
      setFileRemoved(false);
    } else {
      setForm({
        title: "",
        description: "",
      });
      setSelectedFile(null);
      setFileRemoved(false);
    }
  }, [planToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      e.target.value = null;
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileRemoved(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!planToEdit && !selectedFile) {
      toast.error("Debes seleccionar un archivo PDF para subir");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (fileRemoved) {
      formData.append("remove_file", "true");
    }

    try {
      if (planToEdit) {
        await updateTrainingPlan(planToEdit.id, formData, true);
        toast.success("Plan actualizado correctamente");
      } else {
        await createTrainingPlan(formData, true);
        toast.success("Plan creado correctamente");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error("Error guardando plan de entrenamiento");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
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
          {planToEdit ? "Editar plan" : "Crear plan"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Título</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Archivo PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
            {selectedFile && (
              <p className="mt-1 text-xs text-gray-500">{selectedFile.name}</p>
            )}
            {planToEdit && !selectedFile && !fileRemoved && (
              <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                <a
                  href={planToEdit.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Ver documento
                </a>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-800 transition"
                  aria-label="Quitar archivo"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
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
              className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md
                hover:shadow-lg hover:brightness-110 transition font-medium"
            >
              {planToEdit ? "Guardar cambios" : "Crear plan"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};