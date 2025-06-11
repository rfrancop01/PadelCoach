import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById, updateUser as apiUpdateUser } from "../../api/users";
import { Spinner } from "../../components/Spinner";
import { EnvelopeIcon, PhoneIcon, UserIcon, CakeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { UserProfileFormModal } from "./UserProfileFormModal";
import { useAuth } from "../../context/AuthContext";

export const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        setUser(res.data.results);
      } catch (err) {
        console.error("Error al obtener el perfil del usuario", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <Spinner />;
  if (!user) return <p className="p-4 text-red-600">Usuario no encontrado</p>;

  return (
    <div className="flex justify-center items-center mt-20 px-4">
      <div className="max-w-2xl w-full bg-white bg-opacity-80 rounded-xl shadow-xl p-8 space-y-6">
        <div className="relative text-center space-y-6">
        {user.id === JSON.parse(localStorage.getItem("user"))?.id && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-[-12px] right-[-12px] flex items-center gap-1 px-3 py-1 text-sm bg-accent text-gray-900 rounded hover:brightness-110 transition"
            aria-label="Editar perfil"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
        )}
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="relative inline-block mt-7 mb-3">
            {user.photo_url && !hasImageError ? (
              <img
                src={user.photo_url}
                alt="Foto de perfil"
                onError={() => setHasImageError(true)}
                className={`w-28 h-28 rounded-full border border-white shadow-lg ring-4 ring-offset-2 mx-auto object-cover transition duration-300 ease-in-out ${
                  user.is_active ? "ring-green-400" : "ring-red-400"
                }`}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full border border-white shadow-lg ring-4 ring-offset-2 mx-auto flex items-center justify-center text-5xl font-bold bg-white text-gray-800"
              >
                {user.name?.charAt(0).toUpperCase()}
                {user.last_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{user.name} {user.last_name}</h2>
          <p className="text-base text-gray-700 font-medium capitalize">
            {user.role === "student" ? "Alumno" :
             user.role === "trainer" ? "Entrenador" :
             user.role === "admin" ? "Administrador" :
             user.role}
          </p>
          <hr className="border-t border-gray-500/40 w-1/2 mx-auto mt-3 mb-1" />
        </div>

        <div className="flex flex-col items-center space-y-4 text-base">
          <div className="flex items-center gap-2 text-slate-700">
            <EnvelopeIcon className="h-5 w-5 text-slate-500" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <PhoneIcon className="h-5 w-5 text-slate-500" />
            <span>{user.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CakeIcon className="h-5 w-5 text-slate-500" />
            <span>{user.age || "—"}</span>
          </div>
        </div>
        </div>
      </div>
      <UserProfileFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={user}
        onSave={async (formData) => {
          try {
            const res = await apiUpdateUser(user.id, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            setUser(res.data.results);
            updateUser(res.data.results);
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error al actualizar usuario", err);
          }
        }}
      />
    </div>
  );
};