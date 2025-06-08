import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import React, { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { Spinner } from "../../components/Spinner";
import { UserFormModal } from "./UserFormModal";
import { Invitations } from '../invitations/Invitations';
import { toast } from "react-toastify";
import { PencilIcon, PlusIcon, MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchChips, setSearchChips] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getUsers();
        setUsers(
          res.data.results.sort((a, b) => {
            if (a.is_active === b.is_active) return 0;
            return a.is_active ? -1 : 1;
          })
        );
      } catch (err) {
        setError("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 bg-white/60 backdrop-blur-md rounded-lg shadow-xl">
      <div className="space-y-12">
        <section className="bg-white rounded-xl shadow-md p-6">

          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-4">
              <div className="text-2xl font-bold text-gray-900">Usuarios</div>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">Buscar por nombre o apellidos</label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[220px]"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">Filtrar por rol</label>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[180px]"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="admin">Administrador</option>
                    <option value="trainer">Entrenador</option>
                    <option value="student">Alumno</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 mb-1">Estado</label>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[160px]"
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => {
                  window.location.href = "/admin/invitations";
                }}
                className="bg-blue-600 text-white h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition w-fit font-medium hover:bg-blue-700 flex items-center gap-2"
                title="Ver Invitaciones"
              >
                <EnvelopeIcon className="h-5 w-5" />
                Invitaciones
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsModalOpen(true);
                }}
                className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition w-fit font-medium hover:bg-accent/90 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Crear Usuario
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full mt-4">
            <table className="min-w-full bg-white rounded shadow text-sm divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Apellidos</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3 text-center">Editar</th>
                  <th className="px-6 py-3 text-center align-middle">Activo</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => {
                    const matchesSearch = searchTerm === "" ||
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesRole = filterRole ? user.role === filterRole : true;
                    const matchesActive =
                      filterActive === ""
                        ? true
                        : filterActive === "true"
                          ? user.is_active
                          : !user.is_active;
                    return matchesSearch && matchesRole && matchesActive;
                  })
                  .map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-100 hover:shadow-sm transition-all">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.last_name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        {{
                          admin: 'Administrador',
                          trainer: 'Entrenador',
                          student: 'Alumno'
                        }[user.role] || user.role}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5 text-primary hover:text-primaryLight hover:scale-110 transition-transform duration-200" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div
                          onClick={async () => {
                            try {
                              await updateUser(user.id, { ...user, is_active: !user.is_active });
                              toast.success(`Usuario ${user.is_active ? 'desactivado' : 'activado'} correctamente`);
                              const res = await getUsers();
                              setUsers(
                                res.data.results.sort((a, b) => {
                                  if (a.is_active === b.is_active) return 0;
                                  return a.is_active ? -1 : 1;
                                })
                              );
                            } catch (err) {
                              console.error("Error al cambiar estado del usuario", err);
                              toast.error("Error al cambiar estado del usuario");
                            }
                          }}
                          className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ${user.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${user.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          ></span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <UserFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={async (data) => {
              try {
                if (selectedUser) {
                  await updateUser(selectedUser.id, data);
                  toast.success("Usuario actualizado correctamente");
                } else {
                  await createUser(data);
                  toast.success("Usuario creado correctamente");
                }
                const res = await getUsers();
                setUsers(res.data.results);
                setIsModalOpen(false);
              } catch (err) {
                console.error("Error al guardar usuario:", err);
                toast.error("Error al guardar usuario");
              }
            }}
            initialData={selectedUser}
          />
        </section>
      </div>
    </div>
  );
};
