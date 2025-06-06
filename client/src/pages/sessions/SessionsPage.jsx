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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  // Filtros
  const [filterTrainer, setFilterTrainer] = useState("");
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
    } else {
      getSessionsByUser(user.id)
        .then((res) => setSessions(res.data.results))
        .catch((err) => console.error("Error al cargar tus sesiones", err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      refreshSessions();
    }
  }, [user]);

  useEffect(() => {
    const fetchFiltersData = async () => {
      if (user?.role === "admin") {
        try {
          const trainersRes = await import("../../api/users").then(mod => mod.getUsers());
          const courtsRes = await import("../../api/courts").then(mod => mod.getCourts());
          setTrainers(trainersRes.data.results.filter(u => u.role === "trainer"));
          setCourts(courtsRes.data.results);
        } catch (err) {
          console.error("Error al cargar datos para filtros", err);
        }
      }
    };
    fetchFiltersData();
  }, [user]);

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
    <div className="space-y-12">
      <section className="bg-white rounded-xl shadow-md p-6">
        {user?.role === "admin" ? (
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Todas las sesiones</h2>
            <button
              onClick={() => setIsModalOpen(true)}
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
        {/* Filtros para admin */}
        {user?.role === "admin" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Entrenador</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                value={filterTrainer}
                onChange={(e) => setFilterTrainer(e.target.value)}
              >
                <option value="">Todos</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.last_name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Pista</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                value={filterCourt}
                onChange={(e) => setFilterCourt(e.target.value)}
              >
                <option value="">Todas</option>
                {courts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
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
                    const trainerMatch = !filterTrainer || s.trainer?.id == filterTrainer;
                    const courtMatch = !filterCourt || s.court?.id == filterCourt;
                    const dateMatch = !filterDate || formatDate(s.date) === filterDate;
                    const levelMatch = !filterLevel || s.students.some(st => st.level === filterLevel);
                    return trainerMatch && courtMatch && dateMatch && levelMatch;
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