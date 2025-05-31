import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import bgImage from "../assets/fondo.jpg";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = "El email es obligatorio.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Por favor, introduce un email válido.";
    }
    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <>
      {/* Fondo con imagen y overlay oscuro + blur */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
      </div>

      {/* Contenedor del formulario */}
      <div className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl max-w-md w-full p-10 backdrop-blur-md border border-white/30">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
            Iniciar sesión
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <div>
              <label
                className="block text-gray-700 mb-2 font-semibold"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-4 transition  ${validationErrors.email ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-primary"}`}
                placeholder="tucorreo@ejemplo.com"
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label
                className="block text-gray-700 mb-2 font-semibold"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-4 transition  ${validationErrors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-primary"}`}
                placeholder="••••••••"
                required
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-white font-semibold rounded-md hover:bg-accent transition"
            >
              Entrar
            </button>

            <div className="text-right mt-2">
              <a
                href="/password-reset/request"
                className="text-primary hover:text-accent text-sm font-semibold"
              >
                ¿Olvidaste contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};