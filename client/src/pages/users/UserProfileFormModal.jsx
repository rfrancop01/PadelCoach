import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from 'react-toastify';

export const UserProfileFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const { updateUser, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        phone: "",
        age: "",
        photo: null,
        remove_photo: false,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                last_name: initialData.last_name || "",
                phone: initialData.phone || "",
                age: initialData.age !== undefined ? initialData.age : "",
                photo: null,
                remove_photo: false,
            });
        } else {
            setFormData({
                name: "",
                last_name: "",
                phone: "",
                age: "",
                photo: null,
                remove_photo: false,
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("last_name", formData.last_name);
        data.append("phone", formData.phone);
        if (formData.age !== "") data.append("age", String(formData.age));
        if (formData.photo) data.append("photo", formData.photo);
        if (formData.remove_photo) data.append("remove_photo", "true");

        try {
            // MODIFICA tu onSave para devolver la respuesta del backend
            const response = await onSave(data); // Espera {results: {user}}

            if (response?.results) {
                updateUser(response.results);
            }
            onClose();
        } catch (error) {
            console.error("Error guardando y actualizando usuario:", error);
            toast.error("Error actualizando tu perfil");
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-2 sm:px-4 overflow-y-auto pt-[72px]"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md mx-auto my-8 rounded-xl overflow-hidden bg-white shadow-md p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
                        aria-label="Cerrar modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {initialData ? "Editar perfil" : "Actualizar datos"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-800 font-semibold">Nombre</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-semibold">Apellidos</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name || ""}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-semibold">Teléfono</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-semibold">Edad (opcional)</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age || ""}
                            onChange={handleChange}
                            min="0"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-800 font-semibold">Foto de perfil (archivo, opcional)</label>
                        {(!initialData?.photo_url || formData.remove_photo) && (
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && file.name !== "placeholder150") {
                                        setFormData((prev) => ({ ...prev, photo: file }));
                                    }
                                }}
                                className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primaryLight"
                            />
                        )}
                        {initialData?.photo_url && !formData.remove_photo && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-600">Imagen cargada</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        confirmAlert({
                                            title: '¿Eliminar imagen?',
                                            message: '¿Estás seguro que deseas eliminar la imagen de perfil?',
                                            buttons: [
                                                {
                                                    label: 'Sí',
                                                    onClick: () => {
                                                        setFormData((prev) => ({ ...prev, remove_photo: true, photo: null }));
                                                        toast.success("Imagen eliminada correctamente");
                                                    },
                                                },
                                                {
                                                    label: 'Cancelar',
                                                },
                                            ],
                                        })
                                    }
                                    className="text-red-600 hover:text-red-800 text-sm"
                                    title="Eliminar foto actual"
                                >
                                    ❌
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 h-[40px] px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-accent text-gray-900 h-[40px] px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:brightness-110 transition font-medium"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};