// src/components/CourtsSVG/CourtSVG.jsx
import React from 'react';

export const CourtSVG = ({ court }) => {
  // Puedes usar court.court_type para cambiar colores si quieres

  return (
    <svg
      width="80"
      height="50"
      viewBox="0 0 80 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded"
    >
      <rect x="1" y="1" width="78" height="48" stroke="white" strokeWidth="2" fill="#2b6cb0" rx="4" ry="4" />
      <line x1="40" y1="1" x2="40" y2="49" stroke="white" strokeWidth="1" />
      <line x1="1" y1="25" x2="79" y2="25" stroke="white" strokeWidth="1" />
      <line x1="20" y1="1" x2="20" y2="25" stroke="white" strokeWidth="1" />
      <line x1="60" y1="25" x2="60" y2="49" stroke="white" strokeWidth="1" />
      {/* Puedes añadir más líneas o detalles según diseño */}
    </svg>
  );
};