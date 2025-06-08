import React, { useState } from "react";
import { api } from "../api";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const UploadInvitationsModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo Excel.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await api.post("/invitations", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const alreadyInvited = response.data.results.filter(item =>
        item.message === "Ya existe una invitación válida"
      );

      const successfullySent = response.data.results.filter(item =>
        item.message === "Invitación enviada correctamente"
      );

      if (alreadyInvited.length > 0) {
        toast.warn(`${alreadyInvited.length} invitaciones no enviadas porque ya existen.`);
      }

      if (successfullySent.length > 0) {
        toast.success(`${successfullySent.length} invitaciones enviadas correctamente.`);
      }

      if (alreadyInvited.length === 0 && successfullySent.length === 0) {
        toast.info("No se procesaron invitaciones.");
      }

      onUploadSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al subir las invitaciones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2 sm:px-4 pt-[72px] overflow-y-auto">
      <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subir archivo de invitaciones</h2>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 h-[40px] px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition font-medium"
              disabled={loading}
            >
              {loading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};