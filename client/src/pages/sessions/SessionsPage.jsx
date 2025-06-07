import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from 'react-toastify';
import { useAuth } from "../../hooks/useAuth";
import React, { useEffect, useState } from "react";
import SessionCard from "../../components/SessionCard";
import { getSessions, getSessionsByUser, deleteSession } from "../../api/sessions";
import SessionFormModal from "./SessionFormModal";
import { PlusIcon } from "@heroicons/react/24/solid";

const formatDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [trainerId, setTrainerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  // Filtros
  const [filterTrainerId, setFilterTrainerId] = useState("");
  const [filterTrainerName, setFilterTrainerName] = useState("");
  const [filterCourt, setFilterCourt] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [courts, setCourts] = useState([]);

  const refreshSessions = () => {
    if (user.role === "admin") {
      getSessions()
        .then((res) => setSessions(res.data.results))
        .catch((err) => console.error("Error al cargar sesiones", err))
        .finally(() => setLoading(false));
    } else if (user.role === "trainer") {
      Promise.all([
        import("../../api/sessions"),
        import("../../api/trainers"),
      ])
        .then(([{ getSessionsByTrainer }, { getTrainerByUserId }]) =>
          getTrainerByUserId(user.id).then((trainerRes) => {
            const trainerId = trainerRes.data.results.id;
            setTrainerId(trainerId);
            return getSessionsByTrainer(trainerId);
          })
        )
        .then((res) => setSessions(res.data.results))
        .catch((err) => console.error("Error al cargar sesiones del entrenador", err))
        .finally(() => setLoading(false));
    } else {
      getSessionsByUser(user.id)
        .then((res) => setSessions(res.data.results))
        .catch((err) => console.error("Error al cargar tus sesiones", err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (user && (user.role !== "trainer" || trainerId)) {
      refreshSessions();
    }
  }, [user, trainerId]);

useEffect(() => {
  const fetchFiltersData = async () => {

    if (!user) return;

    if (user.role === "admin") {

      try {
        const [usersModule, courtsModule] = await Promise.all([
          import("../../api/users"),
          import("../../api/courts"),
        ]);

        const [usersRes, courtsRes] = await Promise.all([
          usersModule.getUsers(),
          courtsModule.getCourts(),
        ]);


        if (usersRes?.data?.results) {
          setTrainers(usersRes.data.results.filter(u => u.role === "trainer"));
        }

        if (courtsRes?.data?.results) {
          setCourts(courtsRes.data.results);
        }
      } catch (err) {
        console.error("❌ Error cargando datos como admin:", err);
      }
    }

    if (user.role === "student") {

      const uniqueTrainersMap = new Map();
      sessions.forEach(session => {
        const t = session.trainer;
        if (t && !uniqueTrainersMap.has(t.id)) {
          uniqueTrainersMap.set(t.id, t);
        }
      });
      const uniqueTrainers = Array.from(uniqueTrainersMap.values());
      setTrainers(uniqueTrainers);
    }

    if (user.role === "trainer") {
      try {
        const { getTrainerByUserId } = await import("../../api/trainers");
        const trainerRes = await getTrainerByUserId(user.id);
        const fetchedTrainerId = trainerRes.data.results.id;
        setTrainerId(fetchedTrainerId);
        setTrainers([{
          id: fetchedTrainerId,
          name: user.name || "",
          last_name: user.last_name || ""
        }]);
      } catch (err) {
        console.error("❌ Error cargando datos como trainer:", err);
      }
    }
  };

  fetchFiltersData();
}, [user, sessions]);

  const handleEdit = (session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleDelete = (sessionId) => {
    confirmAlert({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta sesión?',
      buttons: [
        {
          label: 'Sí, eliminar',
          onClick: async () => {
            try {
              await deleteSession(sessionId);
              toast.success("Sesión eliminada correctamente");
              refreshSessions();
            } catch (error) {
              console.error("Error al eliminar sesión:", error);
              toast.error("Error al eliminar sesión");
            }
          }
        },
        {
          label: 'Cancelar'
        }
      ]
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg">
      <section className="bg-white rounded-xl shadow-md p-6">
        {user?.role === "admin" ? (
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Todas las sesiones</h2>
            <button
              onClick={() => {
                setEditingSession(null);
                setIsModalOpen(true);
              }}
              className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition w-fit font-medium hover:bg-accent/90"
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <PlusIcon className="h-5 w-5 shrink-0" />
                <span className="truncate">Añadir sesión</span>
              </div>
            </button>
          </div>
        ) : (
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Mis sesiones</h2>
        )}
        {/* Filtros para admin, student y trainer */}
        {(user?.role === "admin" || user?.role === "student" || user?.role === "trainer") && (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {(user?.role === "admin" || user?.role === "trainer") && (
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Buscar por nombre</label>
                <input
                  type="text"
                  placeholder="Nombre o apellidos"
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                  value={filterTrainerName}
                  onChange={(e) => setFilterTrainerName(e.target.value)}
                />
              </div>
            )}

            {(user?.role === "admin" || user?.role === "trainer") && (
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Nivel</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Iniciación">Iniciación</option>
                  <option value="Competición">Competición</option>
                  <option value="Primera">Primera</option>
                  <option value="Segunda">Segunda</option>
                  <option value="Tercera">Tercera</option>
                  <option value="Cuarta">Cuarta</option>
                </select>
              </div>
            )}

            {(user?.role === "admin" || user?.role === "student") && (
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Entrenador</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                  value={filterTrainerId}
                  onChange={(e) => setFilterTrainerId(e.target.value)}
                >
                  <option value="">Todos</option>
                  {trainers.map(t => (
                    <option key={t.id} value={String(t.id)}>
                      {`${t.name || ''} ${t.last_name || ''}`.trim() || 'Entrenador sin nombre'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(user?.role === "admin" || user?.role === "student" || user?.role === "trainer") && (
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
        <div className="mb-10" />
        {loading ? (
          <p className="text-zinc-600 dark:text-zinc-300">Cargando sesiones...</p>
        ) : (
          (() => {
            const sortedSessions = [...sessions].sort((a, b) => {
              const [dayA, monthA, yearA] = a.date.split('/');
              const [dayB, monthB, yearB] = b.date.split('/');
              const dateA = new Date(`${yearA}-${monthA}-${dayA}T${a.time}`);
              const dateB = new Date(`${yearB}-${monthB}-${dayB}T${b.time}`);
              return dateA - dateB;
            });
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedSessions
                  .filter((s) => {
                    const isAdmin = user?.role === "admin";
                    const isTrainer = user?.role === "trainer";
                    const isStudent = user?.role === "student";

                    const trainerIdMatch = !filterTrainerId || String(s.trainer?.id) === String(filterTrainerId);
                    const trainerNameMatch = !filterTrainerName || (
                      (isAdmin || isTrainer) &&
                      s.students?.some(st => {
                        const fullName = `${st.user?.name || ""} ${st.user?.last_name || ""}`.toLowerCase();
                        return fullName.includes(filterTrainerName.toLowerCase());
                      })
                    );
                    const courtMatch = !filterCourt || s.court?.id == filterCourt;
                    const dateMatch = !filterDate || formatDate(s.date) === filterDate;
                    const levelMatch = !filterLevel || s.students.some(st => st.level === filterLevel);

                    return (
                      (isAdmin && trainerIdMatch && trainerNameMatch && courtMatch && dateMatch && levelMatch) ||
                      (isTrainer && trainerIdMatch && trainerNameMatch && courtMatch && dateMatch && levelMatch) ||
                      (isStudent && trainerIdMatch && dateMatch)
                    );
                  })
                  .map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onEdit={() => handleEdit(session)}
                      onDelete={() => handleDelete(session.id)}
                    />
                  ))}
              </div>
            );
          })()
        )}
        <SessionFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSession(null);
          }}
          onSave={refreshSessions}
          sessionToEdit={editingSession}
        />
      </section>
    </div>
  );
};