import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const CourtCard = ({ court, onEdit, onDelete, isEditingMode }) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl shadow-md p-6 cursor-pointer text-white relative hover:shadow-lg hover:bg-opacity-90 hover:-translate-y-1 transition transform">
      <div className="absolute top-4 right-4 flex space-x-4">
        {isEditingMode && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(court); }}
            className="text-gray-400 hover:text-gray-200 transition cursor-pointer"
            aria-label="Editar pista"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        )}
        {isEditingMode && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(court.id); }}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            aria-label="Eliminar pista"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{court.name}</h3>
      <p className="text-gray-300 mb-1"><strong>Tipo:</strong> {court.court_type}</p>
      <p className="text-gray-300"><strong>Ubicación:</strong> {court.location}</p>
    </div>
  );
};