import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { toast } from "react-toastify";

export const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    token: "",
    password: "",
    passwordConfirm: "",
    name: "",
    last_name: "",
    phone: "",
  });

  // Extraer email de la URL para mostrar info al usuario
  const emailFromUrl = searchParams.get("email") || "";

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token") || "";
    if (tokenFromUrl) {
      setForm((prev) => ({ ...prev, token: tokenFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.token) {
      toast.error("El token de invitación es requerido");
      return;
    }
    if (!form.password) {
      toast.error("La contraseña es requerida");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      await signup({
        token: form.token,
        password: form.password,
        name: form.name,
        last_name: form.last_name,
        phone: form.phone,
      });
      toast.success("Cuenta creada correctamente. Inicia sesión para acceder a la plataforma.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear la cuenta");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg min-h-[70vh] flex flex-col justify-center">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Crear Cuenta
        </h2>

        {emailFromUrl && (
          <p className="text-center text-sm text-gray-600 mb-6">
            Invitación enviada a: <strong>{emailFromUrl}</strong>
          </p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="token" value={form.token} />

          <div>
            <label htmlFor="name" className="sr-only">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="sr-only">
              Apellidos
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Apellidos"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="sr-only">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Teléfono"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Contraseña"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="sr-only">
              Confirmar Contraseña
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="Confirmar Contraseña"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-gray-900 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};