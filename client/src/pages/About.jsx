import React from 'react';
import { motion } from 'framer-motion';

export const About = () => {
  return (
    <div className="min-h-screen bg-cover bg-center text-primaryDark py-16 px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-16 bg-white/70 backdrop-blur-lg rounded-2xl p-10 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight text-primaryDark max-w-3xl mx-auto px-4">Sobre PadelCoach</h1>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6 bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow">
          <h2 className="text-3xl font-bold text-primaryDark tracking-tight">Nuestra misión</h2>
          <p className="text-lg text-primaryDark/80">
            En PadelCoach queremos digitalizar y profesionalizar la forma en que se organizan entrenamientos de pádel. Apostamos por una experiencia ágil, moderna y cercana tanto para jugadores como entrenadores y academias.
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6 bg-slate-50/70 backdrop-blur-sm p-6 rounded-xl shadow">
          <h2 className="text-3xl font-bold text-primaryDark tracking-tight">¿Por qué lo hacemos?</h2>
          <p className="text-lg text-primaryDark/80">
            Porque el pádel crece cada día y merece herramientas que estén a su altura. Queremos eliminar el caos de WhatsApp, hojas de Excel y llamadas innecesarias, y ofrecer una plataforma que conecte a todos los perfiles del deporte.
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6 bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow">
          <h2 className="text-3xl font-bold text-primaryDark tracking-tight">Nuestro equipo</h2>
          <p className="text-lg text-primaryDark/80">
            Somos entrenadores, jugadores y desarrolladores apasionados por este deporte. Conocemos los dolores del día a día y por eso creamos una solución desde dentro, pensada para el mundo real.
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6 bg-slate-50/70 backdrop-blur-sm p-6 rounded-xl shadow">
          <h2 className="text-3xl font-bold text-primaryDark tracking-tight">Nuestros valores</h2>
          <ul className="text-lg text-primaryDark/80 list-disc list-inside space-y-2">
            <li><strong>Compromiso:</strong> Escuchamos a los usuarios y evolucionamos con ellos.</li>
            <li><strong>Transparencia:</strong> Comunicación clara, sin letra pequeña.</li>
            <li><strong>Innovación:</strong> Siempre buscando la mejor experiencia posible.</li>
            <li><strong>Cercanía:</strong> Somos parte del mundo del pádel, no observadores externos.</li>
          </ul>
        </motion.section>

        <div className="h-[1px] w-full bg-white/20 my-12" />

        <div className="bg-white/60 backdrop-blur p-8 rounded-xl shadow-md text-center">
          <h3 className="text-3xl font-bold text-primaryDark mb-4 tracking-tight">¿Te gustaría unirte a nuestra comunidad?</h3>
          <p className="text-lg text-primaryDark/80 mb-6">
            Empieza gratis hoy y descubre cómo PadelCoach puede transformar tu forma de entrenar o gestionar.
          </p>
          <a
            href="/signup"
            className="inline-block bg-slate-900 text-white font-bold px-8 py-4 rounded-md hover:scale-105 hover:bg-slate-800 transition"
          >
            Crear cuenta gratuita
          </a>
        </div>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-20 bg-white/60 text-primaryDark backdrop-blur rounded-2xl shadow-xl p-8">
          <h3 className="text-3xl font-bold mb-4 tracking-tight">¿Tienes dudas o quieres saber más?</h3>
          <p className="text-lg mb-6">
            Escríbenos y te responderemos lo antes posible. Estamos aquí para ayudarte a llevar tu club o entrenamiento al siguiente nivel.
          </p>
          <form className="space-y-6 max-w-xl">
            <div>
              <label className="block mb-2 text-primaryDark/80">Tu nombre</label>
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full px-4 py-3 rounded bg-white text-primaryDark border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-primaryDark/80">Correo electrónico</label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-4 py-3 rounded bg-white text-primaryDark border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-primaryDark/80">Mensaje</label>
              <textarea
                rows="4"
                placeholder="Cuéntanos qué necesitas..."
                className="w-full px-4 py-3 rounded bg-white text-primaryDark border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 text-white font-bold px-6 py-3 rounded-md hover:scale-105 hover:bg-slate-800 transition w-full mt-2"
            >
              ✉️ Enviar mensaje
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};
