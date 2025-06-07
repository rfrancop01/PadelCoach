import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[999] bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-white/20 shadow-sm px-10 py-5 h-16 flex justify-between items-center text-gray-900 dark:text-white">        
      <div className="text-3xl font-extrabold cursor-default select-none text-white">
        <Link to="/">
          <span className="text-accent font-black">Padel</span>Coach
        </Link>
      </div>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-white focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
        <div className="hidden md:flex gap-x-8 text-lg font-semibold text-white items-center">
          <Link
            to="/"
            className="hover:text-yellow-400 hover:underline underline-offset-4 transition duration-300"
          >
            Inicio
          </Link>

          {user ? (
            <>
              {/* Link exclusivo para admin */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Admin Panel
                </Link>
              )}

              {user.role === "trainer" && (
                <Link
                  to="/dashboard/trainer"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Dashboard
                </Link>
              )}

              {user.role === "student" && (
                <Link
                  to="/dashboard/student"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Dashboard
                </Link>
              )}

              {/* Mostrar perfil público para todos los roles autenticados */}
              <Link
                to={`/usuarios/${user.id}`}
                className="hover:text-accent transition-colors duration-300"
              >
                Mi Perfil
              </Link>

              <button
                onClick={handleLogout}
                className="ml-4 bg-accent hover:bg-yellow-600 transition-colors px-4 py-2 rounded font-semibold text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/about"
                className="hover:text-yellow-400 hover:underline underline-offset-4 transition duration-300"
              >
                Sobre Nosotros
              </Link>
              <Link
                to="/login"
                className="hover:text-yellow-400 hover:underline underline-offset-4 transition duration-300"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[998] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity duration-300 ease-out opacity-100" />
          <div className="absolute top-0 left-0 right-0 translate-y-0 transition-transform duration-300 ease-out transform px-6 pt-20 pb-8 flex flex-col gap-6 shadow-xl text-white">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            {!user ? (
              <>
                <Link to="/about" onClick={() => setIsMenuOpen(false)}>Sobre Nosotros</Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </>
            ) : (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                )}
                {user.role === "trainer" && (
                  <Link to="/dashboard/trainer" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                )}
                {user.role === "student" && (
                  <Link to="/dashboard/student" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                )}
                <Link to={`/usuarios/${user.id}`} onClick={() => setIsMenuOpen(false)}>Mi Perfil</Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-red-400 hover:text-red-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};