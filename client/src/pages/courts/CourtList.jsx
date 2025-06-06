import React, { useEffect, useState } from "react";
import { getCourts } from "../../api/courts";
import { CourtCard } from "../../components/CourtCard";
import { PlusIcon } from "@heroicons/react/24/solid";

export const CourtList = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterLocation, setFilterLocation] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    getCourts()
      .then(res => setCourts(res.data.results))
      .catch(err => console.error("Error fetching courts", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourts = courts.filter(court => {
    const matchesLocation = filterLocation ? court.location === filterLocation : true;
    const matchesType = filterType ? court.court_type === filterType : true;
    return matchesLocation && matchesType;
  });

  const uniqueLocations = [...new Set(courts.map(c => c.location))];
  const uniqueTypes = [...new Set(courts.map(c => c.court_type))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-md ">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todas las pistas</h1>
        <button
          onClick={() => {
            // Aquí deberás manejar la apertura del modal para añadir pista
            console.log('Abrir modal añadir pista');
          }}
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
          onChange={e => setFilterLocation(e.target.value)}
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        >
          <option value="">Todas las ubicaciones</option>
          {uniqueLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        >
          <option value="">Todos los tipos</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando pistas...</p>
      ) : filteredCourts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredCourts.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              onEdit={(court) => console.log('Editar', court)}
              onDelete={(id) => console.log('Eliminar', id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No se encontraron pistas con esos filtros.</p>
      )}
    </div>
  );
};