// src/components/PadelCourtBackground.jsx
import React from "react";

const PadelCourtBackground = () => (
  <svg
    width="100vw"
    height="100vh"
    viewBox="0 0 800 400"
    preserveAspectRatio="none"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: -1,
      pointerEvents: "none",
      filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
    }}
  >
    <defs>
      <linearGradient id="courtGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#114B22" />
        <stop offset="100%" stopColor="#1D6F3E" />
      </linearGradient>
      <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#0a2c11" floodOpacity="0.6" />
      </filter>
    </defs>

    {/* Fondo degradado */}
    <rect width="800" height="400" fill="url(#courtGradient)" filter="url(#innerShadow)" rx="25" ry="25" />

    {/* Bordes de la pista */}
    <rect
      x="50"
      y="20"
      width="700"
      height="360"
      stroke="white"
      strokeWidth="3"
      fill="none"
      rx="20"
      ry="20"
      opacity={0.85}
    />

    {/* Línea central horizontal */}
    <line x1="50" y1="200" x2="750" y2="200" stroke="white" strokeWidth="1.5" opacity={0.7} />

    {/* Líneas verticales */}
    <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="1.5" opacity={0.7} />
    <line x1="600" y1="20" x2="600" y2="380" stroke="white" strokeWidth="1.5" opacity={0.7} />

    {/* Red */}
    <rect x="395" y="20" width="10" height="360" fill="white" opacity="0.35" rx="2" ry="2" />
  </svg>
);

export default PadelCourtBackground;