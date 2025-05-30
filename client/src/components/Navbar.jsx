import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary-900 px-6 py-4 text-white shadow-md flex justify-between items-center">
      <div className="text-lg font-semibold">
        <Link to="/">PadelCoach</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-primary-300 transition-colors duration-200">
          Inicio
        </Link>

        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="hover:text-primary-300 transition-colors duration-200">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:text-primary-300 transition-colors duration-200">
              Perfil
            </Link>
            {role === "admin" && (
              <Link to="/admin" className="hover:text-primary-300 transition-colors duration-200">
                Admin Panel
              </Link>
            )}
            {role === "trainer" && (
              <Link to="/sessions" className="hover:text-primary-300 transition-colors duration-200">
                Mis Sesiones
              </Link>
            )}
            {role === "student" && (
              <Link to="/my-sessions" className="hover:text-primary-300 transition-colors duration-200">
                Mis Entrenos
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 transition-colors px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </>
        )}

        {!isAuthenticated && (
          <>
            <Link to="/login" className="hover:text-primary-300 transition-colors duration-200">
              Login
            </Link>
            <Link to="/signup" className="hover:text-primary-300 transition-colors duration-200">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};