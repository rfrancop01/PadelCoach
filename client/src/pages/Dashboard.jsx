import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";

export const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        {user ? (
          <div>
            <p className="text-lg mb-2">
              Hola, <span className="font-semibold capitalize">{user.name}</span>
            </p>
            <p className="text-md mb-6">
              Tu rol es: <span className="font-semibold capitalize">{user.role}</span>
            </p>
            {/* Aquí podrías añadir más secciones dependiendo del rol */}
            {user.role === "admin" && <p>Bienvenido, administrador. Aquí puedes gestionar todo.</p>}
            {user.role === "trainer" && <p>Bienvenido, entrenador. Aquí están tus sesiones y materiales.</p>}
            {user.role === "student" && <p>Bienvenido, estudiante. Aquí están tus próximas sesiones y progreso.</p>}
          </div>
        ) : (
          <p>Cargando información del usuario...</p>
        )}
      </div>
    </>
  );
};