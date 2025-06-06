import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
    return (
        <div className="min-h-screen relative flex flex-col font-sans overflow-hidden text-textDark">
            {/* Sección principal con imagen y texto */}
            <section className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto w-full px-8 py-12 gap-12 md:gap-20 text-white">
                <div className="max-w-xl text-center md:text-left">
                    <h2
                        className="text-5xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg"
                    >
                        Tu{' '}
                        <span
                            className="text-accent font-extrabold"
                            style={{
                                WebkitTextStroke: '1px black',
                                WebkitTextFillColor: '#f9a826',
                                textShadow: '2px 2px 6px rgba(0,0,0,0.75)'
                            }}
                        >
                            entrenador personal
                        </span>{' '}
                        de pádel online
                    </h2>
                    <p
                        className="text-lg mb-12 leading-relaxed max-w-lg"
                        style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            color: 'rgba(255, 255, 255, 0.9)'
                        }}
                    >
                        Gestiona tus entrenamientos, sesiones y reservas con la plataforma más intuitiva y potente para jugadores, entrenadores y admins.
                    </p>
                    <div className="flex justify-center md:justify-start space-x-6">
                        <Link
                            to="/signup"
                            className="bg-gradient-to-r from-accent to-yellow-400 text-primaryDark font-bold px-8 py-3 rounded-lg shadow-lg hover:from-yellow-400 hover:to-accent hover:shadow-xl transition"
                        >
                            Empieza gratis
                        </Link>
                        <Link
                            to="/about"
                            className="border-2 border-accent px-8 py-3 rounded-lg font-semibold text-white hover:bg-accent hover:text-primaryDark transition"
                        >
                            Más info
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sección de funcionalidades principales con mejor espaciado y rejilla */}
            <section className="relative z-10 py-20 px-8 rounded-3xl shadow-inner max-w-7xl mx-auto bg-primaryLight/80 mb-20">
                <h3 className="text-4xl font-extrabold text-white drop-shadow-md text-center mb-16">
                    Funcionalidades principales
                </h3>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                    {[
                        {
                            title: "Entrenamientos personalizados",
                            description: "Crea planes de entrenamiento adaptados a cada jugador y sigue su progreso fácilmente."
                        },
                        {
                            title: "Reserva de pistas sencilla",
                            description: "Consulta disponibilidad y reserva tu pista con un par de clicks desde cualquier dispositivo."
                        },
                        {
                            title: "Gestión de usuarios y roles",
                            description: "Administra usuarios, alumnos y entrenadores con permisos diferenciados para cada rol."
                        }
                    ].map(({ title, description }) => (
                        <div
                            key={title}
                            className="bg-white rounded-lg p-8 shadow-card hover:shadow-2xl transition cursor-default"
                        >
                            <h4 className="text-xl font-semibold mb-4 text-accent drop-shadow-md">
                                {title}
                            </h4>
                            <p className="text-primaryDark/90 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};