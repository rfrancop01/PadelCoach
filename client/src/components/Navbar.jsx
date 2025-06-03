import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[999] bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-white/20 shadow-sm px-10 py-4 flex justify-between items-center text-gray-900 dark:text-white">        
      <div className="text-3xl font-extrabold cursor-default select-none text-white">
        <Link to="/">
          <span className="text-accent font-black">Padel</span>Coach
        </Link>
      </div>
        <div className="space-x-8 text-lg font-semibold text-white flex items-center">
          <Link
            to="/"
            className="hover:text-accent transition-colors duration-300"
          >
            Inicio
          </Link>

          {user ? (
            <>
              {/* Mostrar Dashboard solo para roles que no sean admin */}
              {user.role !== "admin" && (
                <Link
                  to="/dashboard"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Dashboard
                </Link>
              )}

              {/* Link exclusivo para admin */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Admin Panel
                </Link>
              )}

              <Link
                to="/profile"
                className="hover:text-accent transition-colors duration-300"
              >
                Perfil
              </Link>

              {user.role === "trainer" && (
                <Link
                  to="/sessions"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Mis Sesiones
                </Link>
              )}

              {user.role === "student" && (
                <Link
                  to="/my-sessions"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Mis Entrenos
                </Link>
              )}

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
                to="/signup"
                className="hover:text-accent transition-colors duration-300"
              >
                Registro
              </Link>
              <Link
                to="/about"
                className="hover:text-accent transition-colors duration-300"
              >
                Sobre Nosotros
              </Link>
              <Link
                to="/login"
                className="hover:text-accent transition-colors duration-300"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};