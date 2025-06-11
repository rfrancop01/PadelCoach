import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, InformationCircleIcon, CalendarIcon, ChartBarIcon, UsersIcon, CalendarDaysIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="w-full text-primaryDark font-poppins relative bg-cover bg-center" style={{ backgroundImage: "url('/assets/bg-padel.jpg')" }}>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white/70 backdrop-blur ring-1 ring-white/20 rounded-2xl shadow-xl my-12 py-12 px-6 max-w-6xl mx-auto"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Organiza tus <span className="text-slate-900">entrenamientos</span> de pádel sin complicaciones
            </h1>
            <p className="text-lg text-slate-900/90">
              PadelCoach es la plataforma perfecta para jugadores, entrenadores y clubes que quieren ahorrar tiempo y mejorar su experiencia en pista.
            </p>
            <div className="flex gap-4 mt-6 justify-center">
              <Link
                to="/signup"
                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-md shadow hover:ring-2 hover:ring-white transition hover:scale-105 flex items-center justify-center hover:bg-slate-800"
              >
                Probar gratis <ArrowRightIcon className="inline h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/about"
                className="bg-white/90 text-slate-900 font-semibold px-6 py-3 rounded-md shadow hover:ring-2 hover:ring-slate-400 transition hover:scale-105 flex items-center justify-center"
              >
                Ver más <InformationCircleIcon className="inline h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Funcionalidades */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white/70 backdrop-blur ring-1 ring-white/20 rounded-2xl shadow-xl my-12 py-12 px-6 max-w-6xl mx-auto"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-12 tracking-tight text-slate-900">¿Qué puedes hacer con PadelCoach?</h2>
          <div className="grid gap-10 md:grid-cols-3 text-left">
            {[
              {
                title: "Entrenadores",
                desc: "Crea sesiones, gestiona planes de entrenamiento y lleva el control de tus alumnos.",
                icon: <UsersIcon className="h-8 w-8 text-slate-800 mb-3" />
              },
              {
                title: "Jugadores",
                desc: "Apúntate a entrenamientos, consulta tus horarios y mejora con seguimiento personalizado.",
                icon: <ChartBarIcon className="h-8 w-8 text-slate-800 mb-3" />
              },
              {
                title: "Administradores",
                desc: "Gestiona usuarios, pistas, horarios y visualiza estadísticas de uso.",
                icon: <CalendarIcon className="h-8 w-8 text-slate-800 mb-3" />
              }
            ].map(({ title, desc, icon }) => (
              <div key={title} className="bg-white/70 backdrop-blur ring-1 ring-white/20 rounded-3xl p-6 shadow hover:shadow-xl transition">
                {icon}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Beneficios */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white/70 backdrop-blur ring-1 ring-white/20 rounded-2xl shadow-xl my-12 py-12 px-6 max-w-6xl mx-auto"
      >
        <div className="max-w-6xl mx-auto text-center space-y-14">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">¿Por qué elegir PadelCoach?</h2>
          <div className="grid gap-12 md:grid-cols-3 text-left">
            {[
              {
                icon: <CalendarDaysIcon className="h-8 w-8 text-slate-800 mb-3" />,
                title: "Organiza tu tiempo",
                desc: "Consulta y gestiona horarios desde cualquier dispositivo, sin llamadas ni hojas de cálculo."
              },
              {
                icon: <ArrowTrendingUpIcon className="h-8 w-8 text-slate-800 mb-3" />,
                title: "Mejora continua",
                desc: "Sigue tu evolución en el entrenamiento y mantén la motivación con feedback claro."
              },
              {
                icon: <UsersIcon className="h-8 w-8 text-slate-800 mb-3" />,
                title: "Conecta con tu club",
                desc: "PadelCoach facilita la comunicación y coordinación entre alumnos, entrenadores y gestores."
              }
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/70 backdrop-blur ring-1 ring-white/20 rounded-3xl p-6 shadow hover:shadow-xl transition">
                <div className="mb-3">{icon}</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">Lo que opinan nuestros usuarios</h3>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  name: "Carlos, entrenador",
                  quote: "Gracias a PadelCoach puedo dedicarme 100% a entrenar. La gestión de sesiones es rapidísima."
                },
                {
                  name: "Lucía, estudiante",
                  quote: "Ahora me entero antes de cada entrenamiento y puedo seguir mi progreso fácilmente."
                }
              ].map(({ name, quote }) => (
                <div key={name} className="bg-white/70 backdrop-blur ring-1 ring-white/20 text-slate-900 rounded-3xl p-6 shadow hover:shadow-xl transition">
                  <p className="italic text-lg mb-4">“{quote}”</p>
                  <p className="font-semibold text-right">— {name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-slate-100/90 text-slate-900 py-20 px-6 rounded-2xl shadow-xl mt-12 max-w-6xl mx-auto"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Empieza hoy con PadelCoach</h2>
          <p className="text-lg text-slate-900/90">
            Regístrate gratis y descubre cómo PadelCoach puede transformar tu forma de entrenar, organizar y crecer como jugador o entrenador.
          </p>
          <Link
            to="/signup"
            className="inline-block mt-4 bg-slate-900 text-white font-bold px-8 py-4 rounded-md shadow hover:ring-2 hover:ring-white transition hover:scale-105 hover:bg-slate-800"
          >
            Crear cuenta gratuita
          </Link>
        </div>
      </motion.section>
    </div>
  );
};