import React from 'react';
import AppRoutes from './Routes.jsx';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <AppRoutes />
      </div>
    </div>
  );
}
