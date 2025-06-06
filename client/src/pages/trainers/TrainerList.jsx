import React, { useEffect, useState } from "react";
import { getTrainers, updateTrainer } from "../../api/trainers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { TrainerFormModal } from "./TrainerFormModal";

export const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const fetchTrainers = async () => {
    try {
      const res = await getTrainers();
      setTrainers(res.data.results);
    } catch (err) {
      console.error("Error al cargar entrenadores", err);
      toast.error("Error al cargar entrenadores");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleToggle = async (trainer) => {
    try {
      await updateTrainer(trainer.id, {
        is_active: !trainer.user?.is_active
      });
      toast.success(`Entrenador ${!trainer.user?.is_active ? 'desactivado' : 'activado'} correctamente`);
      await fetchTrainers();
    } catch (err) {
      console.error("Error al actualizar estado del entrenador", err);
      toast.error("Error al actualizar estado del entrenador");
    }
  };

  const filtered = trainers
    .sort((a, b) => (a.user?.is_active === b.user?.is_active ? 0 : a.user?.is_active ? -1 : 1))
    .filter(trainer => {
      const name = trainer.user?.name?.toLowerCase() || "";
      const lastName = trainer.user?.last_name?.toLowerCase() || "";
      const matchesSearch = `${name} ${lastName}`.includes(searchTerm.toLowerCase());
      const matchesActive =
        filterActive === ""
          ? true
          : filterActive === "true"
          ? trainer.user?.is_active === true
          : trainer.user?.is_active === false;
      return matchesSearch && matchesActive;
    });

  return (
    <div className="space-y-12">
      <section className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-bold text-gray-900">Entrenadores</div>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Buscar por nombre o apellidos</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[220px]"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Estado</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[160px]"
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full mt-4">
          <table className="min-w-full bg-white rounded shadow text-sm divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Apellidos</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3 text-center">Editar</th>
                <th className="px-6 py-3 text-center align-middle">Activo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trainer) => (
                <tr key={trainer.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{trainer.user?.name}</td>
                  <td className="px-6 py-4">{trainer.user?.last_name}</td>
                  <td className="px-6 py-4">{trainer.user?.email}</td>
                  <td className="px-6 py-4">{trainer.user?.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        console.log("Abriendo modal con:", trainer); // Para depurar
                        setSelectedTrainer(trainer);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5 text-primary hover:text-primaryLight hover:scale-110 transition-transform duration-200" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    <div
                      onClick={() => handleToggle(trainer)}
                      className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ${
                        trainer.user?.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                          trainer.user?.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      ></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <TrainerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          try {
            if (!data.name || !data.last_name || !data.phone) {
              toast.error("Faltan campos requeridos");
              return;
            }
            if (selectedTrainer) {
              await updateTrainer(selectedTrainer.id, {
                is_active: data.is_active,
                name: data.name,
                last_name: data.last_name,
                phone: data.phone,
              });
              toast.success("Entrenador actualizado correctamente");
            }
            fetchTrainers();
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error al guardar entrenador:", err);
            toast.error("Error al guardar entrenador");
          }
        }}
        initialData={selectedTrainer}
        parentSelector={() => document.body}
      />
    </div>
  );
};