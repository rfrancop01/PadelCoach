import { useEffect, useState } from "react";
import { getSessionsByTrainer as getTrainerSessions } from "../../api/sessions";
import { getTrainingPlans as getTrainerPlans } from "../../api/trainingplans";
import { getTrainerByUserId } from "../../api/trainers";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Spinner";
import  SessionCard  from "../../components/SessionCard";
import { Link } from "react-router-dom";

export const TrainerDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    try {
      const trainerRes = await getTrainerByUserId(user.id); 
      console.log("Respuesta de getTrainerByUserId:", trainerRes.data);
      const trainerId = trainerRes.data.results.id;

      const sessionsRes = await getTrainerSessions(trainerId);
      const plansRes = await getTrainerPlans(trainerId);

      setSessions(sessionsRes.data.results || []);
      setPlans(plansRes.data);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  }
  if (user) fetchData();
}, [user]);

  if (loading) return <Spinner />;

  return (
    <div className="px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Bienvenido/a, {user.name}</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total de sesiones</h2>
          <p className="text-4xl font-extrabold text-accent">{sessions.length}</p>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Planes activos</h2>
          <p className="text-4xl font-extrabold text-accent">{plans.length}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sesiones recientes</h2>
        <Link to="/sessions" className="text-yellow-400 hover:underline">Ver todas</Link>
      </div>

      {sessions.length === 0 ? (
        <p>No tienes sesiones registradas aún.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.slice(0, 6).map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};
