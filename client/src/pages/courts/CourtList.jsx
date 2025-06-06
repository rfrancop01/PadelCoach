import React, { useEffect, useState } from "react";
import { getCourts, deleteCourt } from "../../api/courts";
import { CourtCard } from "../../components/CourtCard";
import { CourtFormModal } from "./CourtFormModal";
import { PlusIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export const CourtList = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterLocation, setFilterLocation] = useState("");
  const [filterType, setFilterType] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);

  // Carga inicial de pistas
  const fetchCourts = () => {
    setLoading(true);
    getCourts()
      .then((res) => setCourts(res.data.results))
      .catch((err) => {
        console.error("Error fetching courts", err);
        toast.error("Error al cargar pistas");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const filteredCourts = courts.filter((court) => {
    const matchesLocation = filterLocation ? court.location === filterLocation : true;
    const matchesType = filterType ? court.court_type === filterType : true;
    return matchesLocation && matchesType;
  });

  const uniqueLocations = [...new Set(courts.map((c) => c.location))];
  const uniqueTypes = [...new Set(courts.map((c) => c.court_type))];

  // Abrir modal para crear pista nueva
  const handleAdd = () => {
    setEditingCourt(null);
    setModalOpen(true);
  };

  // Abrir modal para editar pista
  const handleEdit = (court) => {
    setEditingCourt(court);
    setModalOpen(true);
  };

  // Confirmar y eliminar pista
  const handleDelete = (id) => {
    confirmAlert({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de que deseas eliminar esta pista?",
      buttons: [
        {
          label: "Sí, eliminar",
          onClick: async () => {
            try {
              await deleteCourt(id);
              toast.success("Pista eliminada correctamente");
              fetchCourts();
            } catch (error) {
              console.error("Error eliminando pista:", error);
              toast.error("Error al eliminar pista");
            }
          },
        },
        {
          label: "Cancelar",
        },
      ],
    });
  };

  // Callback al guardar en modal (crear/editar)
  const handleSave = () => {
    setModalOpen(false);
    setEditingCourt(null);
    fetchCourts();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-md">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todas las pistas</h1>
        <button
          onClick={handleAdd}
          className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition w-fit font-medium hover:bg-accent/90"
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            <PlusIcon className="h-5 w-5 shrink-0" />
            <span className="truncate">Añadir pista</span>
          </div>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        >
          <option value="">Todas las ubicaciones</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        >
          <option value="">Todos los tipos</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando pistas...</p>
      ) : filteredCourts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredCourts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No se encontraron pistas con esos filtros.</p>
      )}

      <CourtFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        courtToEdit={editingCourt}
        locations={uniqueLocations} 
      />
    </div>
  );
};