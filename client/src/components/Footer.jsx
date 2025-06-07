import React from 'react';

export const Footer = () => {
  return (
    <>
      <div className="w-full h-[1px] bg-white/10 mb-4" />
      <footer className="w-full py-4 text-center text-xs text-white/80 bg-slate-900/80 backdrop-blur-md shadow-inner mt-auto rounded-t-xl">
        &copy; 2025 PadelCoach. Todos los derechos reservados.
      </footer>
    </>
  );
};