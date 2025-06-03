import React, { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users";
import { Spinner } from "../../components/Spinner";
import { UserFormModal } from "./UserFormModal";
import { toast } from "react-toastify";

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getUsers();
        setUsers(res.data.results.filter((u) => u.is_active));
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
    <div className="max-w-7xl mx-auto p-6 bg-white bg-opacity-90 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="bg-accent text-gray-900 px-4 py-2 rounded hover:brightness-110 transition"
        >
          Crear Usuario
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  {{
                    admin: 'Administrador',
                    trainer: 'Entrenador',
                    student: 'Estudiante'
                  }[user.role] || user.role}
                </td>
                <td className="px-6 py-4 space-y-2 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
                        try {
                          await deleteUser(user.id);
                          toast.success("Usuario eliminado correctamente");
                          const res = await getUsers();
                          setUsers(res.data.results.filter((u) => u.is_active));
                        } catch (err) {
                          console.error("Error al eliminar usuario:", err);
                          toast.error("Error al eliminar usuario");
                        }
                      }
                    }}
                    className="text-sm px-3 py-1 rounded border border-red-500 text-red-600 bg-red-50 hover:bg-red-200 transition"
                  >
                    Eliminar
                  </button>
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
            setUsers(res.data.results.filter((u) => u.is_active));
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error al guardar usuario:", err);
            toast.error("Error al guardar usuario");
          }
        }}
        initialData={selectedUser}
      />
    </div>
  );
};
