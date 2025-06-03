import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import bgImage from '../assets/fondo.jpg';

export const Layout = () => {
  return (
    <>
      {/* Fondo de imagen con filtro para toda la app */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
      </div>

      {/* Navbar y contenido de la página */}
      <div className="relative min-h-screen flex flex-col pt-[100px]">
        {/* pt-24 asegura que el contenido comience debajo del navbar fijo */}
        <Navbar />
        <main className="flex-grow z-10 relative p-6 max-w-7xl mx-auto w-full">
          <Outlet /> {/* Aquí se renderizan las rutas hijas */}
        </main>
        <Footer />
      </div>
    </>
  );
};