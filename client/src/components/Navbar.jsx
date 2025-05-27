

import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="text-lg font-semibold">
        <Link to="/">PadelCoach</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">
          Inicio
        </Link>
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/profile" className="hover:underline">
          Perfil
        </Link>
      </div>
    </nav>
  );
};