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
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="text-lg font-semibold">
        <Link to="/">PadelCoach</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">
          Inicio
        </Link>

        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:underline">
              Perfil
            </Link>
            {role === "admin" && (
              <Link to="/admin" className="hover:underline">
                Admin Panel
              </Link>
            )}
            {role === "trainer" && (
              <Link to="/sessions" className="hover:underline">
                Mis Sesiones
              </Link>
            )}
            {role === "student" && (
              <Link to="/my-sessions" className="hover:underline">
                Mis Entrenos
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="hover:underline bg-red-600 px-2 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}

        {!isAuthenticated && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};