import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/users';
import { getStudents } from '../api/students';
import { getTrainers } from '../api/trainers';
import { getSessions, getMonthlySessions } from '../api/sessions';
import { getCourts } from '../api/courts';
import { getTrainingPlans } from '../api/trainingplans';
import { MonthlySessionsChart } from '../components/MonthlySessionsChart';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { StatCard } from '../components/StatCard';

const COLORS = ['#0083B0', '#00B4DB', '#F9A826', '#6EE7B7', '#3B82F6', '#9333EA'];

export const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    students: 0,
    trainers: 0,
    sessions: 0,
    courts: 0,
    trainingplans: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roleDistribution, setRoleDistribution] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [usersRes, studentsRes, trainersRes, sessionsRes, courtsRes, trainingPlansRes] = await Promise.all([
          getUsers(),
          getStudents(),
          getTrainers(),
          getSessions(),
          getCourts(),
          getTrainingPlans(),
        ]);

        setUsers(usersRes.data.results);

        setCounts({
          users: usersRes.data.results.length,
          students: studentsRes.data.results.length,
          trainers: trainersRes.data.results.length,
          sessions: sessionsRes.data.results.length,
          courts: courtsRes.data.results.length,
          trainingplans: trainingPlansRes.data.results.length,
        });

        const rolesCount = usersRes.data.results.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        const roleLabels = {
          admin: 'Administrador',
          trainer: 'Entrenador',
          student: 'Alumno',
        };

        const roleData = Object.entries(rolesCount).map(([role, value]) => ({
          name: roleLabels[role] || role,
          value,
        }));

        setRoleDistribution(roleData);

      } catch (err) {
        setError('Error al cargar datos del panel de administración');
      } finally {
        setLoading(false);
      }
    };

    const fetchMonthlyData = async () => {
      try {
        const res = await getMonthlySessions();
        setMonthlyData(res.data.results);
      } catch (err) {
        console.error('Error al cargar sesiones por mes', err);
      }
    };

    fetchData();
    fetchMonthlyData();
  }, []);

  if (loading) return <p className="text-center p-8">Cargando datos...</p>;
  if (error) return <p className="text-red-600 text-center p-8">{error}</p>;

  const labelMap = {
    users: 'Usuarios',
    students: 'Alumnos',
    trainers: 'Entrenadores',
    sessions: 'Sesiones',
    courts: 'Pistas',
    trainingplans: 'Planes',
  };

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white/60 backdrop-blur-md rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Panel de Administración
      </h1>

      <section className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <a href="/admin/users" className="flex items-center justify-center gap-2 bg-primaryLight hover:bg-primary text-white rounded-lg py-3 px-5 transition font-medium shadow hover:shadow-md">
            <span role="img" aria-label="Usuarios"></span>
            <span>Gestionar Usuarios</span>
          </a>
          <a href="/sessions" className="flex items-center justify-center gap-2 bg-primaryLight hover:bg-primary text-white rounded-lg py-3 px-5 transition font-medium shadow hover:shadow-md">
            <span role="img" aria-label="Sesiones"></span>
            <span>Gestionar Sesiones</span>
          </a>
          <a href="/admin/trainers" className="flex items-center justify-center gap-2 bg-primaryLight hover:bg-primary text-white rounded-lg py-3 px-5 transition font-medium shadow hover:shadow-md">
            <span role="img" aria-label="Entrenadores"></span>
            <span>Gestionar Entrenadores</span>
          </a>
          <a href="/admin/courts" className="flex items-center justify-center gap-2 bg-primaryLight hover:bg-primary text-white rounded-lg py-3 px-5 transition font-medium shadow hover:shadow-md">
            <span role="img" aria-label="Pistas"></span>
            <span>Gestionar Pistas</span>
          </a>
          <a href="/admin/trainingplans" className="flex items-center justify-center gap-2 bg-primaryLight hover:bg-primary text-white rounded-lg py-3 px-5 transition font-medium shadow hover:shadow-md">
            <span role="img" aria-label="Planes"></span>
            <span>Planes de Entrenamiento</span>
          </a>
          <a href="/admin/students" className="flex items-center justify-center gap-2 bg-primaryLight hover:bg-primary text-white rounded-lg py-3 px-5 transition font-medium shadow hover:shadow-md">
            <span role="img" aria-label="Alumnos"></span>
            <span>Gestionar Alumnos</span>
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">Resumen de actividad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(counts).map(([key, value]) => (
            <StatCard key={key} title={labelMap[key] || key} label={labelMap[key] || key} value={value} />
          ))}
        </div>
      </section>

      <section className="overflow-visible">
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-xl shadow-md p-8 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Sesiones por mes</h2>
            <div className="w-full">
              <MonthlySessionsChart data={monthlyData} />
            </div>
          </div>

          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-xl shadow-md p-8 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribución de usuarios por rol</h2>
            {roleDistribution.length === 0 ? (
              <p>No hay datos para mostrar</p>
            ) : (
              <ResponsiveContainer width="100%" minHeight={260} style={{ marginTop: '-10px' }}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={false}
                    labelLine={false}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, name === 'value' ? 'Usuarios' : name]} />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};