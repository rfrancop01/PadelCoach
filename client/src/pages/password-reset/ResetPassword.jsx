import { useState } from "react";
import { resetPassword } from "../../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../../assets/fondo.jpg";
import { toast } from "react-toastify";

export const ResetPassword = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, new_password: formData.password });
      toast.success("Contraseña restablecida correctamente. Redirigiendo a login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg?.includes("expirado")) {
        toast.error("El enlace ya no es válido. Solicita uno nuevo desde la página de recuperación.");
      } else {
        toast.error(msg || "Error al restablecer la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl max-w-md w-full p-10 backdrop-blur-md border border-white/30">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
            Restablecer Contraseña
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading ? "bg-blue-400" : "bg-primary hover:bg-accent"
              } transition`}
            >
              {loading ? "Procesando..." : "Restablecer"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};