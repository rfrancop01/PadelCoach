import { useState } from "react";
import { requestPasswordReset } from "../../api/auth"; // asegúrate de importar bien
import { toast } from "react-toastify";
import bgImage from "../../assets/fondo.jpg";

export const RequestReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast.success(res.message || "Si el correo está registrado, se ha enviado un enlace de recuperación.");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar el enlace de recuperación.");
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
            Recuperar contraseña
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block mb-1 font-semibold text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary"
                placeholder="tuemail@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading ? "bg-blue-400" : "bg-primary hover:bg-accent"
              } transition`}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};