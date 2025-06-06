import React, { useEffect, useState } from "react";
import { UserGroupIcon, PencilIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getStudents, deleteStudent, updateStudent, createStudent } from "../../api/students";
import { getAvailableStudentUsers } from "../../api/users";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { StudentFormModal } from "./StudentFormModal";

export const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      // Ordenar para que los activos aparezcan primero
      const orderedStudents = res.data.results.sort((a, b) => {
        if (a.user?.is_active === b.user?.is_active) return 0;
        return a.user?.is_active ? -1 : 1;
      });
      setStudents(orderedStudents);
    } catch (err) {
      console.error("Error al cargar alumnos", err);
      toast.error("Error al cargar alumnos");
    }
  };

  const handleToggle = async (student) => {
    try {
      await updateStudent(student.id, {
        is_active: !student.user?.is_active,
        name: student.user?.name,
        last_name: student.user?.last_name,
        email: student.user?.email,
        phone: student.user?.phone,
        level: student.level,
      });
      toast.success(`Alumno ${!student.user?.is_active ? 'activado' : 'desactivado'} correctamente`);
      const res = await getStudents();
      // Ordenar para que los activos aparezcan primero
      const orderedStudents = res.data.results.sort((a, b) => {
        if (a.user?.is_active === b.user?.is_active) return 0;
        return a.user?.is_active ? -1 : 1;
      });
      setStudents(orderedStudents);
    } catch (err) {
      console.error("Error al actualizar estado del alumno", err);
      toast.error("Error al actualizar estado del alumno");
    }
  };

  useEffect(() => {
    fetchStudents();
    const fetchAvailableUsers = async () => {
      try {
        const res = await getAvailableStudentUsers();
        // Ordenar disponibles activos primero también si aplica
        const orderedAvailable = res.data.results.sort((a, b) => {
          if (a.is_active === b.is_active) return 0;
          return a.is_active ? -1 : 1;
        });
        setAvailableUsers(orderedAvailable);
      } catch (err) {
        console.error("Error al obtener usuarios disponibles:", err);
        toast.error("Error al obtener usuarios disponibles");
      }
    };
    fetchAvailableUsers();
  }, []);

  const handleAssignLevel = (userId, level) => {
    confirmAlert({
      title: 'Asignar Nivel',
      message: '¿Estás seguro de asignar este nivel al alumno?',
      buttons: [
        {
          label: 'Sí',
          onClick: async () => {
            try {
              await createStudent({ user_id: userId, level });
              toast.success("Nivel asignado correctamente");
              fetchStudents();
              // Refresh available users after assignment
              const res = await getAvailableStudentUsers();
              setAvailableUsers(res.data.results);
            } catch (err) {
              console.error("Error al asignar nivel:", err);
              toast.error("Error al asignar nivel");
            }
          }
        },
        {
          label: 'Cancelar',
          onClick: () => {}
        }
      ]
    });
  };

  return (
    <div className="space-y-12">
      <section className="bg-white rounded-xl shadow-md p-6">
        {/* Filtros y título */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-bold text-gray-900">Alumnos asignados </div>
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
                <label className="text-sm text-gray-700 mb-1">Filtrar por nivel</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 h-[40px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-[180px]"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Primera">Primera</option>
                  <option value="Segunda">Segunda</option>
                  <option value="Tercera">Tercera</option>
                  <option value="Cuarta">Cuarta</option>
                  <option value="Iniciación">Iniciación</option>
                  <option value="Competición">Competición</option>
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
        </div>

        {/* Filtrado de alumnos */}
        {(() => {
          const filteredStudents = students.filter(student => {
            const nameMatch = searchTerm === "" ||
              (`${student.user?.name || ""} ${student.user?.last_name || ""}`)
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const levelMatch = filterLevel ? student.level === filterLevel : true;
            const activeMatch =
              filterActive === ""
                ? true
                : filterActive === "true"
                ? student.user?.is_active === true
                : student.user?.is_active === false;
            return nameMatch && levelMatch && activeMatch;
          });
          return (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white rounded shadow text-sm divide-y divide-gray-200 mb-10">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Apellidos</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Teléfono</th>
                    <th className="px-6 py-3">Nivel</th>
                    <th className="px-6 py-3 text-center">Editar</th>
                    <th className="px-6 py-3 text-center">Activo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{student.user?.name || ""}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.user?.last_name || ""}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.user?.email || ""}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.user?.phone || ""}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.level || ""}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5 text-primary hover:text-primaryLight hover:scale-110 transition-transform duration-200" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          onClick={() => handleToggle(student)}
                          className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ${
                            student.user?.is_active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                              student.user?.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          ></span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </section>

      {availableUsers.length > 0 && (
        <section className="bg-white rounded-xl shadow-md p-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pendientes de asignar</h2>
          <table className="min-w-full bg-white rounded shadow text-sm divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Apellidos</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3 text-center">Asignar nivel</th>
              </tr>
            </thead>
            <tbody>
              {availableUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.phone}</td>
                  <td className="px-6 py-4 text-center">
                    <select
                      defaultValue=""
                      className="border rounded px-3 py-1"
                      onChange={(e) => {
                        if (e.target.value) handleAssignLevel(user.id, e.target.value);
                      }}
                    >
                      <option value="" disabled>Selecciona nivel</option>
                      <option value="Primera">Primera</option>
                      <option value="Segunda">Segunda</option>
                      <option value="Tercera">Tercera</option>
                      <option value="Cuarta">Cuarta</option>
                      <option value="Iniciación">Iniciación</option>
                      <option value="Competición">Competición</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          try {
            if (selectedStudent) {
              await updateStudent(selectedStudent.id, data);
              toast.success("Alumno actualizado correctamente");
            } else {
              await createStudent(data);
              toast.success("Alumno creado correctamente");
            }
            fetchStudents();
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error al guardar alumno:", err);
            toast.error("Error al guardar alumno");
          }
        }}
        initialData={selectedStudent}
        parentSelector={() => document.body}
      />
    </div>
  );
};