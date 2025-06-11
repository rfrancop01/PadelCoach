import { useEffect, useState } from "react";
import { getSessionsByTrainer } from "../../api/sessions";
import { getTrainingPlans } from "../../api/trainingplans";
import { getTrainerByUserId } from "../../api/trainers";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Spinner";
import SessionCard from "../../components/SessionCard";
import { Link } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../index.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { CalendarIcon } from "@heroicons/react/24/outline";

export const TrainerDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessionDates, setSessionDates] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const trainerRes = await getTrainerByUserId(user.id);
        const trainerId = trainerRes.data.results.id;

        const sessionsRes = await getSessionsByTrainer(trainerId);
        const plansRes = await getTrainingPlans();

        setPlans(plansRes.data.results);
        setSessions(sessionsRes.data.results);

        const sessionsByDay = {};
        sessionsRes.data.results.forEach((session) => {
          if (session.date) {
            const [day, month, year] = session.date.split("/");
            if (year === String(new Date().getFullYear()) && Number(month) === new Date().getMonth() + 1) {
              const dayNum = parseInt(day, 10);
              sessionsByDay[dayNum] = (sessionsByDay[dayNum] || 0) + 1;
            }
          }
        });

        const chartData = Object.entries(sessionsByDay).map(([day, count]) => ({
          day,
          sessions: count,
        }));

        setMonthlyData(chartData);

        const formattedDates = sessionsRes.data.results.map((session) => {
          const [day, month, year] = session.date.split('/');
          const date = new Date(`${year}-${month}-${day}`);
          if (isNaN(date)) return null;
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }).filter(Boolean);

        setSessionDates(formattedDates);
      } catch (error) {
        console.error("Error al cargar datos del dashboard del entrenador:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === "trainer") {
      fetchData();
    }
  }, [user]);

  if (loading) return <Spinner />;

  const filteredSessions = sessions.filter(session => {
    if (!session.date) return false;
    const [day, month, year] = session.date.split('/');
    const sessionDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(sessionDate)) return false;
    const yyyy = sessionDate.getFullYear();
    const mm = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const dd = String(sessionDate.getDate()).padStart(2, '0');
    const sessionDateStr = `${yyyy}-${mm}-${dd}`;
    const selected = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return sessionDateStr === selected;
  });

  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white bg-opacity-80 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Hola {user.name}, ¡bienvenido/a de nuevo!
      </h1>

      <section className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Sesiones asignadas</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total de sesiones</h3>
            <p className="text-4xl font-bold text-accent">{sessions.length}</p>
            <Link to="/sessions" className="text-sm text-yellow-500 hover:underline block mt-2">
              Ver todas las sesiones →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Planes activos</h3>
            <p className="text-4xl font-bold text-accent">{plans?.length || 0}</p>
            <Link to="/training-plans?readonly=true" className="text-sm text-yellow-500 hover:underline block mt-2">
              Ver todos los planes →
            </Link>
          </div>
        </div>
      </section>

      {/* Calendario y sesiones */}
      <section className="bg-white rounded-xl shadow-md p-6 space-y-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Calendario de sesiones
            </h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-xl border border-gray-300 shadow p-4 text-sm w-full"
              tileClassName={({ date, view }) => {
                if (view !== 'month') return;
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dateString = `${yyyy}-${mm}-${dd}`;
                const isToday = new Date().toDateString() === date.toDateString();
                const isSelected = selectedDate.toDateString() === date.toDateString();
                const hasSession = sessionDates.includes(dateString);

                if (isSelected) return 'highlight hover:opacity-90';
                if (hasSession) return 'react-calendar__tile--hasSession transition-all duration-200';
                if (isToday) return 'react-calendar__tile--now';
                return '';
              }}
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Sesiones del día seleccionado</h3>
            {filteredSessions.length > 0 ? (
              <div className="max-h-[330px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-5 4h.01M6 21h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>No hay sesiones este día.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gráfico sesiones por día */}
      <section className="bg-white rounded-xl shadow-md p-6 space-y-2">
        <h2 className="text-xl font-semibold text-gray-700">
          Sesiones por día del mes de {capitalizedMonth}
        </h2>
        <p className="text-sm text-gray-500">Basado en tus sesiones del mes actual.</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-gray-800 text-white text-sm p-2 rounded-lg">
                      <p className="font-semibold">Día: {label}</p>
                      <p>Sesiones: {payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="sessions" fill="#0E4A86" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="sessions" position="top" fill="#374151" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};
