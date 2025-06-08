import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { useState, useEffect } from "react";

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const Navbar = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(Date.now());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".avatar-menu")) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setHasImageError(false);
    setPhotoVersion(Date.now());
  }, [user, user?.photo_url]);

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
            className="hover:text-accent transition-colors duration-300"
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
                  Administración
                </Link>
              )}

              {user.role === "trainer" && (
                <Link
                  to="/dashboard/trainer"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Panel
                </Link>
              )}

              {user.role === "student" && (
                <Link
                  to="/dashboard/student"
                  className="hover:text-accent transition-colors duration-300"
                >
                  Panel
                </Link>
              )}

              <div className="relative avatar-menu">
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="focus:outline-none mr-2"
                >
                  {user.photo_url && !hasImageError ? (
                    <img
                      key={user.photo_url}
                      src={`${user.photo_url}${user.photo_url?.includes('?') ? '&' : '?'}v=${photoVersion}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      onLoad={() => setHasImageError(false)}
                      onError={() => setHasImageError(true)}
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ring-2 ring-yellow-400 bg-white shadow-sm flex items-center justify-center text-[15px] font-bold leading-[1] tracking-tight text-center ${user.role === "admin"
                          ? "bg-gray-200 text-gray-800"
                          : user.role === "trainer"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-green-200 text-green-800"
                        }`}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                      {user.last_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {isAvatarMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg z-50 py-2">
                      <Link
                        to={`/usuarios/${user.id}`}
                        className="block px-4 py-2 text-base text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setIsAvatarMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-base text-red-600 hover:bg-red-100 dark:hover:bg-red-800 dark:text-red-400 transition"
                      >
                        Salir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/about"
                className="hover:text-accent transition-colors duration-300"
              >
                Nosotros
              </Link>
              <Link
                to="/login"
                className="hover:text-accent transition-colors duration-300"
              >
                Acceder
              </Link>
            </>
          )}
        </div>
      </nav>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[998] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity duration-300 ease-out opacity-100" />
          <div className="absolute top-0 left-0 right-0 translate-y-0 transition-transform duration-300 ease-out transform px-6 pt-20 pb-8 flex flex-col gap-6 shadow-xl text-white">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Inicio</Link>
            {!user ? (
              <>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Nosotros</Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Acceder</Link>
              </>
            ) : (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Admin</Link>
                )}
                {user.role === "trainer" && (
                  <Link to="/dashboard/trainer" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Panel</Link>
                )}
                {user.role === "student" && (
                  <Link to="/dashboard/student" onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Panel</Link>
                )}
                <Link to={`/usuarios/${user.id}`} onClick={() => setIsMenuOpen(false)} className="hover:text-accent transition-colors duration-300">Perfil</Link>
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