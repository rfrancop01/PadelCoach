import React, { useEffect, useState } from "react";
import { getInvitations } from "../../api/invitations";
import { api } from "../../api";
import { toast } from "react-toastify";
import { ArrowPathIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Spinner } from "../../components/Spinner";
import { UploadInvitationsModal } from "../../components/UploadInvitationsModal";

export const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [filterUsed, setFilterUsed] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const onUploadSuccess = () => {
    fetchInvitations();
  };

  const fetchInvitations = async () => {
    try {
      const res = await getInvitations();
      setInvitations(res.data.results);
    } catch (error) {
      toast.error("Error al cargar las invitaciones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (email) => {
    try {
      const res = await api.post("/invitations/resend", { email });
      toast.success("Invitación reenviada correctamente");
      fetchInvitations();
    } catch (error) {
      toast.error("Error al reenviar la invitación");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  if (loading) return <Spinner />;

  const filteredInvitations = invitations.filter((inv) => {
    const emailMatch = inv.email.toLowerCase().includes(searchEmail.toLowerCase());
    let usedMatch = true;
    if (filterUsed === "used") {
      usedMatch = inv.is_used === true;
    } else if (filterUsed === "not_used") {
      usedMatch = inv.is_used === false;
    }
    return emailMatch && usedMatch;
  });

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white/60 backdrop-blur-md rounded-lg shadow-xl">
      <div className="space-y-12 p-6 max-w-7xl mx-auto">
        {/* Gestión de invitaciones */}
        <section className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de invitaciones</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            title="Enviar invitaciones masivas"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            Enviar invitaciones
          </button>
          {/* Modal para subir invitaciones */}
          <UploadInvitationsModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onUploadSuccess={onUploadSuccess}
          />
        </section>

        {/* Lista de invitaciones */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invitaciones enviadas</h2>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por correo..."
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[250px]"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[180px]"
              value={filterUsed}
              onChange={(e) => setFilterUsed(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="used">Usadas</option>
              <option value="not_used">No usadas</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-white rounded shadow text-sm divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Nivel</th>
                  <th className="px-6 py-4 text-center">Enlace</th>
                  <th className="px-6 py-4 text-center">Enviada</th>
                  <th className="px-6 py-4 text-center">Expira</th>
                  <th className="px-6 py-4 text-center">Usada</th>
                  <th className="px-6 py-4 text-center">Reenviar</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map((inv) => (
                  <tr key={inv.id} className="border-t hover:bg-gray-100 hover:shadow-sm transition-all">
                    <td className="px-6 py-4">{inv.email}</td>
                    <td className="px-6 py-4 text-center">{inv.level || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <a href={`http://localhost:5174/signup?token=${inv.token}&email=${inv.email}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center justify-center gap-1">
                        <CloudArrowUpIcon className="h-5 w-5" />
                        Ver enlace
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">{formatDate(inv.created_at)}</td>
                    <td className="px-6 py-4 text-center">{formatDate(inv.expires_at)}</td>
                    <td className="px-6 py-4 text-center">
                      {inv.is_used ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!inv.is_used && (
                        <button onClick={() => handleResend(inv.email)} title="Reenviar invitación" className="text-blue-500 hover:text-blue-700">
                          <ArrowPathIcon className="h-6 w-6 mx-auto" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}