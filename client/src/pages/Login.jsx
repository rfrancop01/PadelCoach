import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import bgImage from "../assets/fondo.jpg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!email) {
      setError("El email es obligatorio.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Por favor, introduce un email válido.");
      return false;
    }
    if (!password) {
      setError("La contraseña es obligatoria.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    if (!validate()) {
      return;
    }

    try {
      const result = await login({ email, password });

      if (result.success) {
        const role = result.user?.role;

        if (role === "admin") {
          navigate("/admin");
        } else if (role === "trainer") {
          navigate("/dashboard/trainer");
        } else if (role === "student") {
          navigate("/dashboard/student");
        } else {
          navigate("/");
        }
      } else {
        setError(result.message || "Credenciales inválidas.");
      }
    } catch (err) {
      setError(err.message || "Error inesperado.");
    }
  };

  return (
    <>
      {/* Fondo de pantalla */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl max-w-md w-full p-10 backdrop-blur-md border border-white/30">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="text-red-600 text-sm text-center mb-4" aria-live="polite">
                {error}
              </p>
            )}

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-1 font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block mb-1 font-semibold text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-white font-semibold rounded-md hover:bg-accent transition"
            >
              Entrar
            </button>
          </form>

          <div className="text-right mt-4">
            <Link
              to="/password-reset"
              className="text-primary hover:text-accent text-sm font-semibold"
            >
              ¿Olvidaste contraseña?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};