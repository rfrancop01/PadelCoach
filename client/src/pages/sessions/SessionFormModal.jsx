import { useEffect, useState } from "react";
import { createSession, updateSession } from "../../api/sessions";
import { getCourts } from "../../api/courts";
import { getStudents } from "../../api/students";
import { getTrainers } from "../../api/trainers";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SessionFormModal = ({ isOpen, onClose, onSave, sessionToEdit }) => {
  const [form, setForm] = useState({
    date: "",
    time: "",
    court_id: "",
    trainer_id: "",
    notes: "",
    student_ids: [],
    level: ""
  });

  const [courts, setCourts] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    getCourts().then(res => setCourts(res.data.results));
    getTrainers().then(res => {
      const formatted = res.data.results.map(t => ({
        id: t.id, // Aseguramos que usamos el ID del modelo Trainer
        user_id: t.user?.id,
        name: t.user?.name || '',
        last_name: t.user?.last_name || ''
      }));
      console.log("📋 Lista de entrenadores disponibles:", formatted);
      setTrainers(formatted);
    });
  }, [sessionToEdit]);

  useEffect(() => {
    getStudents().then(res => {
      const formatted = res.data.results.map(s => ({
        id: s.id,
        level: s.level,
        name: s.user?.name || "",
        last_name: s.user?.last_name || ""
      }));
      setStudents(formatted);
    });
  }, []);

useEffect(() => {
  if (sessionToEdit && trainers.length > 0) {
    const trainerFromSession = sessionToEdit.trainer;
    const trainerIdFromSession =
      trainerFromSession?.id?.toString() || "";

    console.log("🧠 Trainer en sessionToEdit:", trainerFromSession);
    console.log("📋 Trainers disponibles:", trainers);
    console.log("✅ trainer_id a setear:", trainerIdFromSession);

    const newTrainerId = trainers.find(t => t.user_id === trainerFromSession.id)?.id?.toString() || "";

    setForm(prev => ({
      ...prev,
      date: sessionToEdit.date?.includes("/") ? (() => {
        const [day, month, year] = sessionToEdit.date.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      })() : sessionToEdit.date || "",
      time: sessionToEdit.time || "",
      trainer_id: newTrainerId,
      court_id: sessionToEdit.court?.id?.toString() || "",
      notes: sessionToEdit.notes || "",
      student_ids: sessionToEdit.students?.map(s => s.id) || [],
      level: sessionToEdit.students?.[0]?.level || ""
    }));
    console.log("🎯 Formulario final con trainer_id real:", newTrainerId);
    setSelectedLocation(sessionToEdit.court?.location || "");
  }
}, [sessionToEdit, trainers.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        trainer_id: form.trainer_id ? parseInt(form.trainer_id) : null,
        date: form.date,
        time: form.time,
        court_id: parseInt(form.court_id),
        students: form.student_ids.map(id => parseInt(id)),
        notes: form.notes || ""
      };

      console.log("Payload enviado:", payload);
      if (sessionToEdit) {
        await updateSession(sessionToEdit.id, payload);
      } else {
        await createSession(payload);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error al guardar sesión:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-2 sm:px-4 overflow-y-auto pt-[72px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-auto my-8 rounded-xl overflow-hidden"
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
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {sessionToEdit ? "Editar sesión" : "Crear sesión"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Fecha</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Hora</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Club</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            >
              <option value="">Seleccionar club</option>
              {[...new Set(courts.map(c => c.location))].map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Pista</label>
            <select
              name="court_id"
              value={form.court_id}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            >
              <option value="">Seleccionar pista</option>
              {courts
                .filter(c => !selectedLocation || c.location === selectedLocation)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Entrenador</label>
            <select
              name="trainer_id"
              value={form.trainer_id}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            >
              <option value="">Seleccionar entrenador</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Nivel</label>
            <select
              value={form.level || ""}
              onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            >
              <option value="">Todos los niveles</option>
              <option value="Competición">Competición</option>
              <option value="Primera">Primera</option>
              <option value="Segunda">Segunda</option>
              <option value="Tercera">Tercera</option>
              <option value="Cuarta">Cuarta</option>
              <option value="Iniciación">Iniciación</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Alumnos</label>
            <input
              type="text"
              placeholder="Buscar Alumnos por nombre..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 mb-2 w-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md px-3 py-2">
              {students
                .filter(s => {
                  const matchesSearch = `${s.name} ${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase());
                  const matchesLevel = !form.level || s.level === form.level || form.student_ids.includes(s.id);
                  return matchesSearch && matchesLevel;
                })
                .map(s => (
                  <div key={s.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`student-${s.id}`}
                      value={s.id}
                      checked={form.student_ids.includes(s.id)}
                      onChange={(e) => {
                        const id = parseInt(e.target.value);
                        setForm(prev => ({
                          ...prev,
                          student_ids: e.target.checked
                            ? [...prev.student_ids, id]
                            : prev.student_ids.filter(sid => sid !== id)
                        }));
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`student-${s.id}`} className="text-sm">
                      {s.name} {s.last_name}
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
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
              {sessionToEdit ? "Guardar cambios" : "Crear sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default SessionFormModal;