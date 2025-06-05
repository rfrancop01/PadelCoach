import React, { useEffect, useState } from "react";

export const UserProfileFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        phone: "",
        age: "",
        photo: null,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                last_name: initialData.last_name || "",
                phone: initialData.phone || "",
                age: initialData.age !== undefined ? initialData.age : "",
                photo: null,
            });
        } else {
            setFormData({
                name: "",
                last_name: "",
                phone: "",
                age: "",
                photo: null,
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("last_name", formData.last_name);
        data.append("phone", formData.phone);

        // Solo añade edad si no es cadena vacía (permite "0")
        if (formData.age !== "") {
            data.append("age", String(formData.age));
        }

        if (formData.photo) {
            data.append("photo", formData.photo);
        }

        for (let [key, value] of data.entries()) {
            console.log(`${key}:`, value);
        }

        console.log('Submitting FormData');
        onSave(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                    {initialData ? "Editar perfil" : "Actualizar datos"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.files[0] }))}
                            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primaryLight"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 text-sm font-semibold rounded hover:bg-primaryLight transition"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};