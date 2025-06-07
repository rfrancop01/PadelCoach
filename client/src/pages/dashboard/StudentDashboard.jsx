import { useEffect, useState } from "react";
import { getSessionsByStudent , getStudentByUserId } from "../../api/students";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/Spinner";
import SessionCard from "../../components/SessionCard";
import { Link } from "react-router-dom";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchData() {
      try {
        // Paso 1: Obtener el student_id usando el user.id
        const studentRes = await getStudentByUserId(user.id);
        const studentId = studentRes.data.results.id;

        // Paso 2: Obtener sesiones con ese studentId
        const res = await getSessionsByStudent(studentId);
        setSessions(res.data.results);
      } catch (error) {
        console.error("Error al cargar sesiones del estudiante:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === "student") {
      fetchData();
    }
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div className="px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Hola {user.name}, ¡bienvenido/a de nuevo!</h1>

      <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-2">Sesiones apuntadas</h2>
        <p className="text-4xl font-extrabold text-accent">{sessions.length}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tus próximas sesiones</h2>
        <Link to="/my-sessions" className="text-yellow-400 hover:underline">Ver todas</Link>
      </div>

      {sessions.length === 0 ? (
        <p>No estás inscrito en ninguna sesión todavía.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.slice(0, 6).map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
